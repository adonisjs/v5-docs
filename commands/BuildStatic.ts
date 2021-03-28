import { outputFile } from 'fs-extra'
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

  private async generateHtmlFile(doc) {
    const Content = (await import('App/Services/Content')).default
    const filePath = `${doc.url}.html`

    const { html, error } = await Content.render(doc.url)

    if (error) {
      return this.logger.action('Create').failed(filePath, error)
    }

    await outputFile(this.application.publicPath(filePath), html)
    this.logger.action('Create').succeeded(filePath)
  }

  public async run () {
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
  }
}
