import { outputJSON } from 'fs-extra'
import { Octokit } from '@octokit/core'
import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class FetchCollaborators extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'fetch:collaborators'

  /**
   * Command description is displayed in the "help" output
   */
  public static description =
    'Fetch collaborators from Github API and write to content/collaborators.json file'

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  private organization = 'adonisjs'
  private octokit = new Octokit({ auth: this.application.env.get('GITHUB_ACCESS_TOKEN') })

  /**
   * Fetches collaborators for a given repo
   */
  private async fetchCollaboratorsFor(repo: string) {
    const response = await this.octokit.request('GET /repos/{owner}/{repo}/contributors', {
      owner: this.organization,
      repo,
    })

    if (!response.data) {
      return []
    }

    this.logger.success(`"${repo}" repo has "${response.data.length}" collaborators`)

    return response.data.map((row) => {
      return {
        avatar_url: row.avatar_url,
        url: row.html_url,
        username: row.login,
      }
    })
  }

  /**
   * Filtering collaborators to only unique entries
   */
  private filterUnique(collaborators: { username: string }[]) {
    return collaborators.filter((collaborator, index) => {
      return collaborators.findIndex((colab) => colab.username === collaborator.username) === index
    })
  }

  /**
   * Returns a list of repos for the AdonisJS organization
   * on Github
   */
  private async fetchOrganizationRepos() {
    const { data: repos } = await this.octokit.request('GET /orgs/{org}/repos', {
      org: this.organization,
      type: 'public',
      per_page: 100,
    })

    return repos.filter((repo) => repo.archived === false)
  }

  public async run() {
    let collaborators: any[] = []
    this.logger.info('Fetching repos')
    const repos = await this.fetchOrganizationRepos()

    this.logger.info(`Fetching collaborators for "${repos.length}" repos`)
    for (let repo of repos) {
      collaborators = collaborators.concat(await this.fetchCollaboratorsFor(repo.name))
    }

    const uniqueCollaborators = this.filterUnique(collaborators)
    await outputJSON(this.application.makePath('content/collaborators.json'), uniqueCollaborators)

    this.logger
      .action('update')
      .succeeded(`contents/collaborators.json with "${uniqueCollaborators.length}" collaborators`)
  }
}
