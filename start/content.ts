/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/

import visit from 'unist-util-visit'
import View from '@ioc:Adonis/Core/View'
import { Renderer } from '@dimerapp/edge'
import Content from 'App/Services/Content'
import Application from '@ioc:Adonis/Core/Application'
import AssetsManager from '@ioc:Adonis/Core/AssetsManager'
import { zones, codeBlocksTheme, markdownLanguages, docsRepoBaseUrl } from 'Config/markdown'

View.global('getFileURL', function (doc: any) {
  return `${docsRepoBaseUrl}${doc.path.replace(Application.appRoot, '')}`
})

const manifest = AssetsManager.manifest()

/**
 * Renderer makes the markdown AST and convert them to HTML by processing
 * each node through edge templates. This allows you hook into the
 * rendering process and use custom templates for any node
 */
const dimerRenderer = new Renderer().use((node) => {
  /**
   * Render images using "elements/img.edge" file
   */
  if (node.tagName === 'img') {
    return ['elements/img', { node }]
  }

  /**
   * Render anchor tags using "elements/a.edge" file
   */
  if (node.tagName === 'a') {
    return ['elements/a', { node }]
  }

  /**
   * Render pre tags using "elements/code.edge" file
   */
  if (node.tagName === 'pre') {
    return ['elements/code', { node }]
  }

  /**
   * Render tables using "elements/tables.edge" file
   */
  if (node.tagName === 'table') {
    return ['elements/table', { node }]
  }

  if (!Array.isArray(node.properties!.className)) {
    return
  }

  /**
   * Render codegroup using "elements/codegroup.edge" file
   */
  if (node.properties!.className.includes('codegroup')) {
    return ['elements/codegroup', { node }]
  }

  /**
   * Render anchor tags using "elements/a.edge" file
   */
  if (node.properties!.className.includes('alert')) {
    return ['elements/alert', { node }]
  }
})

/**
 * Cache markup and do not re-compile unchanged files
 */
Content.cache('markup')

/**
 * Registering zones with the `@dimerapp/content` module.
 */
zones.forEach(({ title, baseUrl, template, menu, contentPath }) => {
  const zone = Content.zone(title)
  markdownLanguages.forEach((lang) => zone.loadLanguage({ ...lang }))

  zone
    .baseUrl(baseUrl)
    .baseContentPath(contentPath)
    .template(template)
    .useTheme(codeBlocksTheme)
    .docs(menu)
    .before('compile', (file) => {
      file.macro('danger', (node) => {
        node.data = node.data || {}
        node.data.hName = 'div'
        node.data.hProperties = {
          class: ['alert', 'alert-danger'],
        }
      })

      file.macro('important', (node) => {
        node.data = node.data || {}
        node.data.hName = 'div'
        node.data.hProperties = {
          class: ['alert', 'alert-important'],
        }
      })

      file.transform(() => {
        return (tree) => {
          visit(tree, 'image', (node: any) => {
            if (!node.url.startsWith('http')) {
              if (!manifest[node.url]) {
                file.report(`Cannot find image "${node.url}"`, node.position)
                return
              }

              node.url = AssetsManager.assetPath(node.url)
            }
          })
        }
      })
    })
    .renderer('dimerRenderer', dimerRenderer)
    .register()
})
