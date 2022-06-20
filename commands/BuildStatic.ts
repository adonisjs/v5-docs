import { outputFile, copy } from 'fs-extra'
import { ProcessedDoc } from '@dimerapp/content'
import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class BuildStatic extends BaseCommand {
  /**
   * Command Name is used to run the command
   */
  public static commandName = 'build:static'

  /**
   * Command Name is displayed in the "help" output
   */
  public static description = ''

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process
     */
    stayAlive: false,
  }

  /**
   * Write file to the disk
   */
  private async writeFile(filePath: string, html: string) {
    await outputFile(this.application.publicPath(filePath), html)
    this.logger.action('Create').succeeded(filePath)
  }

  /**
   * Generate the html file from the processed doc
   */
  private async generateHtmlFile(doc: ProcessedDoc) {
    const Content = (await import('App/Services/Content')).default
    const filePath = `${doc.url}.html`

    const { html, error } = await Content.render(doc.url)
    if (error) {
      return this.logger.action('Create').failed(filePath, error)
    }

    await this.writeFile(filePath, html!)
  }

  /**
   * Create the static error pages
   */
  private async createErrorPages() {
    const View = this.application.container.use('Adonis/Core/View')
    const html = await View.render('errors/404')
    await this.writeFile('404.html', html!)
  }

  /**
   * Copies the _redirects file from root to the public
   * folder
   */
  private async createRedirectsFile() {
    await copy(this.application.makePath('_redirects'), this.application.publicPath('_redirects'))
    this.logger.action('COPY').succeeded('_redirects')
  }

  /**
   * Run command
   */
  public async run() {
    const Content = (await import('App/Services/Content')).default
    const docs: any[] = []

    Object.keys(Content.zonesTree).forEach((zone) => {
      const groups = Content.zonesTree[zone]
      groups.forEach((group) => {
        group.categories.forEach((category) => {
          category.docs.forEach((doc) => docs.push(doc))
        })
      })
    })

    for (let doc of docs) {
      await this.generateHtmlFile(doc)
    }

    if (this.application.env.get('COPY_REDIRECTS_FILE')) {
      await this.createRedirectsFile()
    }

    await this.createErrorPages()
  }
}
