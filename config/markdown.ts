import Core from '../content/core/menu.json'

/*
|--------------------------------------------------------------------------
| Base URL for the content file
|--------------------------------------------------------------------------
|
| The URL is used to generate the links to edit the current doc
|
*/
export const docsRepoBaseUrl = 'https://github.com/adonisjs/docs.adonisjs.com/blob/develop'

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
export const codeBlocksTheme = 'material-darker'

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
    title: 'Core',
    baseUrl: '/guides',
    template: 'docs',
    contentPath: './content/core',
    menu: Core,
  }
]
