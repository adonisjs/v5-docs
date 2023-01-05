Before creating a new application, you should ensure that you have `Node.js` and `npm` installed on your computer. AdonisJS needs `Node.js >= 18`.

You can install Node.js using either the [official installers](https://nodejs.org/en/download/) or [Volta](https://docs.volta.sh/guide/getting-started). Volta is a cross-platform package manager to install and run multiple Node.js versions on your computer.

```sh
// title: Verify Node.js version
node -v
# v18.12.0
```


## Quick start

You may create a new project using [npm init](https://docs.npmjs.com/cli/v7/commands/npm-init), [yarn create](https://classic.yarnpkg.com/en/docs/cli/create) or [pnpm create](https://pnpm.io/tr/next/cli/create). These tools will download the [create-adonisjs](http://npmjs.com/create-adonisjs) initializer package and begins the installation process.

During the installation process, you will have to select a [starter kit](#starter-kits) for the initial project structure. 


:::codegroup

```sh
// title: npm
npm init adonisjs hello-world
```

```sh
// title: yarn
yarn create adonisjs hello-world
```

```sh
// title: pnpm
pnpm create adonisjs hello-world
```


:::

## Starter kits

Starter kits serve as a starting point for creating applications using AdonisJS. They come with an [opinionated folder structure](./folder-structure.md), pre-configured AdonisJS packages, and the necessary tooling you need during development.


:::note

The official starter kits use ES modules and TypeScript. This combination allows you to use modern JavaScript constructs and leverage static-type safety.


:::

### Web starter kit

The Web starter kit is tailored for creating traditional server renderer web apps. However, do not let the keyword **"traditional"** discourage you. We recommend this starter kit, if you are creating a web app with limited frontend interactivity.

The web starter kit comes with the following packages.

| Package | Description |
|--------|--------------|
| `@adonisjs/core` | The framework's core has the baseline features you might reach for when creating backend applications. |
| `@adonisjs/view` | The view layer uses the [edge](https://edge.adonisjs.com) template engine for composing HTML pages. |
| `@adonisjs/lucid` | Lucid is a SQL ORM maintained by the AdonisJS core team. |
| `@adonisjs/auth` | The authentication layer of the framework. It is configured to use sessions. |
| `@adonisjs/shield` | A set of security primitives to keep your web apps safe from web attacks like **CSRF** and **‌ XSS**. |
| `vite` | [Vite](https://vitejs.dev/) is used for compiling the frontend assets. |

You can drop certain packages using the following command-line flags.

```sh
npm init adonisjs -- --no-auth --no-orm --no-assets
```

- `--no-auth`: Removes the `@adonisjs/auth` package along with its config files.
- `--no-orm`: Removes both the `@adonisjs/lucid` and the `@adonisjs/auth` package. The authentication layer needs the ORM to find users.
- `--no-assets`: Removes the Vite assets bundler.

### API starter kit

The API starter kit is tailored for creating JSON API servers. It is a trimmed-down version of the `web` starter kit.  In this starter kit:

- We remove support for serving static files.
- Do not configure the views layer and vite.
- Turn off XSS and CSRF protection, and enable CORS protection.
- Use the [ContentNegotiation]() middleware to force send HTTP responses in JSON.

The API starter kit uses [opaque tokens]() for user authentication. Opaque tokens are best when you have multiple API clients like a web app, a mobile app or external API consumers.

If your API will be used by a frontend application on the same domain, then we recommend using session auth for better security.

You can setup session auth using the `--session-auth` flag.

```sh
npm init adonisjs -- --session-auth
```

## Starting the dev server

You can start the development server by running the `node ace serve` command.

Ace is a command line framework bundled inside the framework's core. The `--watch` flag monitors the file system and restarts the development server on file change.

```sh
node ace serve --watch
```

Once you have the development server running, you can visit [http://localhost:3333](http://localhost:3333) to access your application. Next, you might want to get familiar with the framework's [folder structure](./folder-structure.md) or learn about [routing](../basics/routing.md).

## Building for production

Since AdonisJS applications are written in TypeScript, they must be compiled into JavaScript in production. 

You may create the JavaScript output by running the `node ace build` command.The JavaScript output is written to the `build` directory. 

When Vite is configured, this command also compiles the frontend assets using Vite and write the output to the `build/public` folder.

```sh
node ace build --production
```

You might want to read about the [TypeScript build process]() and the [Deployment process]().

## Configuring the development environment

While AdonisJS takes care of building the end user applications, you might need additional tools to enjoy the development process and have consistency in your coding style.

Following are some of the recommendations for you.

### ESLint

When creating a new application, you will be prompted to configure [ESLint](https://eslint.org/). If you accept the prompt, we will define an [opinionated set](https://github.com/adonisjs-community/eslint-plugin-adonis/blob/develop/lib/ts-app.json) of ESLint rules inside the `package.json` file.

### Prettier

Next, you will be prompted to configure [prettier](https://prettier.io). If you accept the prompt, we will define the prettier rules inside the `package.json` file.

You can format source files by running `npm run format` command or configure your code editor with prettier extension. 

### AdonisJS VSCode extension

If you are a VSCode user, we recommended installing the official [VSCode extension](https://marketplace.visualstudio.com/items?itemName=jripouteau.adonis-vscode-extension) to supercharge your development environment. 

### Japa VSCode extension

Japa is the testing framework used by AdonisJS. The [Japa VSCode extension](https://marketplace.visualstudio.com/items?itemName=jripouteau.japa-vscode) allows you to run tests within VSCode either using keyboard shortcuts or code lenses.
