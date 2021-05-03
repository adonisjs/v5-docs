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
import Cookbooks from '../content/cookbooks/menu.json'
import Application from '@ioc:Adonis/Core/Application'

const CODE_BLOCKS_THEME = 'material-theme-palenight'
const ADDITIONAL_LANGUAGES = [
  {
    path: './resources/vscode/edge.tmLanguage.json',
    scopeName: 'text.html.edge',
    id: 'edge',
  },
  {
    path: './resources/vscode/shell.tmLanguage.json',
    scopeName: 'source.shell',
    id: 'sh',
  },
  {
    path: './resources/vscode/dotenv.tmLanguage.json',
    scopeName: 'source.env',
    id: 'dotenv',
  }
]

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

/**
 * Guides
 */
const GuidesZone = Content.zone('Guides')
ADDITIONAL_LANGUAGES.forEach((lang) => GuidesZone.loadLanguage({ ...lang }))
GuidesZone
  .baseUrl('guides')
  .baseContentPath('./content/guides')
  .template('docs')
  .useTheme(CODE_BLOCKS_THEME)
  .docs(Guides)
  .renderer('dimerRenderer', dimerRenderer)
  .register()

/**
 * Api docs
 */
const ApiZone = Content.zone('Reference')
ADDITIONAL_LANGUAGES.forEach((lang) => ApiZone.loadLanguage({ ...lang }))
ApiZone
  .baseUrl('reference')
  .baseContentPath('./content/api')
  .template('docs')
  .useTheme(CODE_BLOCKS_THEME)
  .docs(Api)
  .renderer('dimerRenderer', dimerRenderer)
  .register()

/**
 * Cook books
 */
const CookbooksZone = Content.zone('Cookbooks')
ADDITIONAL_LANGUAGES.forEach((lang) => CookbooksZone.loadLanguage({ ...lang }))
CookbooksZone
  .baseUrl('cookbooks')
  .baseContentPath('./content/cookbooks')
  .template('docs')
  .useTheme(CODE_BLOCKS_THEME)
  .docs(Cookbooks)
  .renderer('dimerRenderer', dimerRenderer)
  .register()
