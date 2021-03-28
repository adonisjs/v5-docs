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
import Guides from '../content/guides/menu.json'
import Application from '@ioc:Adonis/Core/Application'

Content
  .cache(Application.inProduction ? 'full' : 'markup')
  .zone('Guides')
  .baseUrl('guides')
  .baseContentPath('./content/guides')
  .template('docs')
  .useTheme('material-theme-palenight')
  .docs(Guides)
  .renderer(
    'dimerRenderer',
    new Renderer().use((node) => {
      if (node.tagName === 'img') {
        return ['elements/img', { node }]
      }

      if (node.tagName === 'pre') {
        return ['elements/code', { node }]
      }

      if (!Array.isArray(node.properties!.className)) {
        return
      }

      if (node.properties!.className.includes('codegroup')) {
        return ['elements/codegroup', { node }]
      }
    })
  )
  .register()
