<div align="center">
  <img src="https://res.cloudinary.com/adonisjs/image/upload/q_100/v1558612869/adonis-readme_zscycu.jpg" width="600px">
</div>

<br />

<div align="center">
  <h3>AdonisJS official documentation</h3>
  <p>Source code and documentation for the official documentation website hosted on <a href="https://docs.adonisjs.com">docs.adonisjs.com</a></p>
</div>

## Setup
Follow the below mentioned steps to setup the project on your local.

- Fork the repo
- Pull the repo on your local
- Install all dependencies using `npm install`.
- Start the AdonisJS development server using `node ace serve --watch`

**We do not follow any build process for rendering markdown to HTML**. Instead, we compile markdown files on every page request. This ensures, we do not have to run any background compilers to compile markdown and then re-compile everything on a single change. The process is as simple as

```
--> New HTTP request --> Finding markdown file for the url --> Compile and serve it
```

## Environment variables

Following environment variables are required to start the development server or create the production build.

```
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=iPbHJ0Wdr8_hA4DLTj83lKedQP9I5rJO
CACHE_VIEWS=false
DEBUG_DOCS=true
ALGOLIA_API_KEY=
COPY_REDIRECTS_FILE=false
```

The `ALGOLIA_API_KEY` environment variable is optional and required only if you want to enable search.

If you are deploying a translated version of the docs, then set the `COPY_REDIRECTS_FILE=false`. Since the redirects file is applicable only for the official documentation to avoid breaking the `preview.adonisjs.com` URLs.

## Content structure

The markdown content is saved inside the `content` directory and each documentation type (we call them zones) has its own subfolder. 

The navigation for the website header and the sidebar is driven by the `menu.json` file inside each zone's subdirectory.

```
content
├── cookbooks
│   ├── menu.json
├── guides
│   ├── menu.json
├── reference
│   └── menu.json
└── releases
    ├── menu.json
```

The `menu.json` file has the following structure

```json
{
  "name": "Database",
  "categories": [
    {
      "name": "root",
      "docs": [
        {
          "title": "Connection",
          "permalink": "database/connection",
          "contentPath": "database/connection.md",
        }
      ]
    }
  ]
}
```

- The top level object is the group name. You can have one or more groups inside a zone and they will be listed in a dropdown in the header nav.
- If there is no only one group. You can name it as `root`.
- Each group can have one or more `categories`. The categories are listed inside the sidebar.
- The category with name `root` will not be printed in the HTML.
- Each category can have one or more `docs`.
- The docs further have a `title`, `permalink` and the path to the content file. **The path is relative from the zone root.**

## Rendering HTML

We make use of a self written [@dimerapp/content](https://npm.im/@dimerapp/content) module to render markdown to HTML using Edge templates in the middle.

We begin by first converting Markdown to an AST and then render each node of the AST using Edge templates. This allow to spit custom markup. Checkout the [./resources/views/elements](./resources/views/elements) directory to see how we are using it.

The code blocks are rendered using the [shiki](https://github.com/shikijs/shiki). The module uses VsCode grammar and themes to process the code blocks. Also, code blocks are processed on the backend and the client receives formatted HTML.


## Configuring `@dimerapp/content`

The `@dimerapp/content` module does not come with any CLI or opinions on how the content should be structured. 

So we have to self configure `@dimerapp/content` module. This is done inside the `start/content.ts` file, which relies on the `config/markdown.ts` file.


## CSS and frontend JavaScript

The styles are written in Vanilla CSS and stored inside the `./resources/css` directory. To organize things a bit, we have split them inside multiple `.css` files.

We also make use of Alpine.js for adding small interactive components, like the header nav dropdown and the codegroup toggle.

The `@hotwire/turbo` is used to navigate between pages without doing a complete refresh.

### Custom JS Hacks

Re-rendering HTML pages resets the scroll position of the sidebar, which is kind of annoying. So we make use of turbo  events `turbo:before-render` and `turbo:render` to store the sidebar position and then restore it after navigation.

On first page visit, we scroll the active sidebar item into the view using the `scrollIntoView` method.

## Deployment

Run the following command to create the production build. 

```
npm run build
```

The output is written to the `public` directory and you can deploy it on any host capable of serving static files.

The official website is hosted on [pages.cloudflare.com](https://pages.cloudflare.com/)

### Important environment variables

The `ALGOLIA_API_KEY` environment variable is optional and required only if you want to enable search.

If you are deploying a translated version of the docs, then set the `COPY_REDIRECTS_FILE=false`. Since the redirects file is applicable only for the official documentation to avoid breaking the `preview.adonisjs.com` URLs.

## Translating docs to different languages

You are free to fork this repo and translate docs to different languages and publish them on a separate subdomain.

> Disclaimer: The translated documentation is considered a community effort. The website and translations are/will never be supported or maintained by the core team.

### Process for translating docs

- Notify everyone about the translated docs on this [pinned issue](https://github.com/adonisjs/docs.adonisjs.com/issues/1).
- We can issue you a subdomain for the language once you have translated more than 50% of the docs.
- As the documentation is updated on the official website, we will drop a link to the PR on the [pinned issue](https://github.com/adonisjs/docs.adonisjs.com/issues/1) and you can pull back those changes.
- We recommend not localizing the URLs. Just translate the docs content.
- Feel free to send a PR to Algolia for indexing the translated website. Here is a [reference to algolia config](https://github.com/algolia/docsearch-configs/blob/master/configs/adonisjs_next.json) for the official website.
