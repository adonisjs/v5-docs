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
import Api from '../content/api/menu.json'
import Guides from '../content/guides/menu.json'
import Application from '@ioc:Adonis/Core/Application'

const dimerRenderer = new Renderer().use((node) => {
  if (node.tagName === 'img') {
    return ['elements/img', { node }]
  }

  if (node.tagName === 'a') {
    return ['elements/a', { node }]
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

Content.cache(Application.inProduction ? 'full' : 'markup')

Content
  .zone('Guides')
  .baseUrl('guides')
  .baseContentPath('./content/guides')
  .template('docs')
  .loadLanguage({
    path: './resources/vscode/edge.tmLanguage.json',
    scopeName: 'text.html.edge',
    id: 'edge',
  })
  .loadLanguage({
    path: './resources/vscode/dotenv.tmLanguage.json',
    scopeName: 'source.env',
    id: 'dotenv',
  })
  .useTheme('material-theme-palenight')
  .docs(Guides)
  .renderer('dimerRenderer', dimerRenderer)
  .register()

Content
  .zone('API Docs')
  .baseUrl('api')
  .baseContentPath('./content/api')
  .template('docs')
  .loadLanguage({
    path: './resources/vscode/edge.tmLanguage.json',
    scopeName: 'text.html.edge',
    id: 'edge',
  })
  .loadLanguage({
    path: './resources/vscode/dotenv.tmLanguage.json',
    scopeName: 'source.env',
    id: 'dotenv',
  })
  .useTheme('material-theme-palenight')
  .docs(Api)
  .renderer('dimerRenderer', dimerRenderer)
  .register()
