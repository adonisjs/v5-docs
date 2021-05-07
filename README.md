# AdonisJS Docs
> The repo contains the documentation and source code for [docs.adonisjs.com](https://docs.adonisjs.com)

It is an AdonisJS project that renders the markdown to HTML using the edge templates during development. In production, we pre-compile everything to HTML and deploy it to Cloudflare pages.

## Setup
Follow the below mentioned steps to setup the project on your local.

- Fork the repo
- Pull the repo on your local
- Install all dependencies using `npm install`.
- Start the AdonisJS development server using `node ace serve --watch`.

**We do not follow any build process for rendering markdown to HTML**. Instead, we compile markdown files on every pages request. This ensures, we do not have to run any background compilers to compile markdown and then re-compile everything on a single change. The process is as simple as

```
--> New HTTP request --> Finding markdown file for the url --> Compile and serve it
```

