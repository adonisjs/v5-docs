import Guides from '../content/guides/menu.json'
import Releases from '../content/releases/menu.json'
import Cookbooks from '../content/cookbooks/menu.json'
import Reference from '../content/reference/menu.json'

/*
|--------------------------------------------------------------------------
| Additional markdown languages
|--------------------------------------------------------------------------
|
| Additional set of VScode languages to beautify the documentation code
| blocks.
|
| The path is relative from the project root.
|
*/
export const markdownLanguages = [
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
  },
]

/*
|--------------------------------------------------------------------------
| Theme used for codeblocks
|--------------------------------------------------------------------------
|
| Themes used for codeblocks
|
*/
export const codeBlocksTheme = 'material-palenight'

/*
|--------------------------------------------------------------------------
| Content zones
|--------------------------------------------------------------------------
|
| Following is the content zones with the base template they use for rendering
| the markdown nodes and a menu tree for rendering the header nav and the
| documentation sidebar.
|
*/
export const zones = [
  {
    title: 'Guides',
    baseUrl: '/guides',
    template: 'docs',
    contentPath: './content/guides',
    menu: Guides,
  },
  {
    title: 'Reference',
    baseUrl: '/reference',
    template: 'docs',
    contentPath: './content/reference',
    menu: Reference,
  },
  {
    title: 'Cookbooks',
    baseUrl: '/cookbooks',
    template: 'docs',
    contentPath: './content/cookbooks',
    menu: Cookbooks,
  },
  {
    title: 'Releases',
    baseUrl: '/releases',
    template: 'docs',
    contentPath: './content/releases',
    menu: Releases,
  },
]
