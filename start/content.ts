/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/

import { Renderer } from '@dimerapp/edge'
import Content from 'App/Services/Content'
import remarkCaptions from 'remark-captions'
import { zones, codeBlocksTheme, markdownLanguages } from 'Config/markdown'

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
   * Render collaborators using "elements/collaborators.edge" file
   */
  if (node.properties!.className.includes('collaborators')) {
    return ['elements/collaborators', { node }]
  }

  /**
   * Render captions using "elements/caption.edge" file
   */
  if (node.properties!.className.includes('caption')) {
    return ['elements/caption', { node }]
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
      file.macro('caption', (node) => {
        node.data = node.data || {}
        node.data.hName = 'div'
        node.data.hProperties = {
          class: ['caption', `caption-${node.attributes.for}`],
        }
      })

      file.macro('collaborators', (node) => {
        node.data = node.data || {}
        node.data.hName = 'div'
        node.data.hProperties = {
          class: ['collaborators'],
        }
      })

      file.transform(remarkCaptions, {
        external: {
          table: 'Table:',
          code: 'Code:',
          math: 'Equation:',
        },
        internal: {
          image: 'Figure:',
        },
      })
    })
    .renderer('dimerRenderer', dimerRenderer)
    .register()
})
