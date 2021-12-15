---
summary: Getting started by creating and running a new AdonisJS application
---

AdonisJS is a Node.js framework, and hence it requires Node.js to be installed on your computer. To be precise, we need at least the latest release of `Node.js v14`.

You can check the Node.js and npm versions by running the following commands.

```sh
# check node.js version
node -v
```

If you don't have Node.js installed, you can [download the binary](https://nodejs.org/en/download) for your operating system from the official website.

If you are comfortable with the command line, then we recommend using [Volta](https://volta.sh) or [Node Version Manager](https://github.com/nvm-sh/nvm) to install and run multiple versions of Node.js on your computer.

## Creating a new project
You can create a new project using [npm init](https://docs.npmjs.com/cli/v7/commands/npm-init), [yarn create](https://classic.yarnpkg.com/en/docs/cli/create) or [pnpm create](https://pnpm.io/tr/next/cli/create). These tools will download the AdonisJS starter package and starts the installation process.

:::codegroup

```sh
// title: npm
npm init adonis-ts-app@latest hello-world
```

```sh
// title: yarn
yarn create adonis-ts-app hello-world
```

```sh
// title: pnpm
pnpm create adonis-ts-app hello-world
```
:::

The installation process prompts for the following selections.

#### Project structure
You can choose between one of the following project structures.

- `web` project structure is ideal for creating classic server-rendered applications. We configure the support for sessions and also install the AdonisJS template engine.
- `api` project structure is ideal for creating an API server.
- `slim` project structure creates the smallest possible AdonisJS application and does not install any additional packages, except the framework core.

---

#### Project name
The name of the project. We define the value of this prompt inside the `package.json` file.

---

#### Configure eslint/prettier
Optionally, you can configure eslint and prettier. Both the packages are configured with the opinionated settings used by the AdonisJS core team.

---

#### Configure Webpack Encore
Optionally, you can also configure [Webpack Encore](./http/assets-manager.md) to bundle and serve frontend dependencies.

Please do note, AdonisJS is a backend framework and does not concern itself with front-end build tools. Hence the Webpack setup is optional.

## Starting the development server
After creating the application, you can start the development server by running the following command.

```sh
node ace serve --watch
```

- The `serve` command starts the HTTP server and performs an in-memory compilation of TypeScript to JavaScript.
- The `--watch` flag is meant to watch the file system for changes and restart the server automatically.

By default, the server starts on port 3333 (defined inside the .env file). You can view the welcome page by visiting: http://localhost:3333.

## Compiling for production
You must always deploy the compiled JavaScript on your production server. You can create the production build by running the following command:

```sh
node ace build --production
```

The compiled output is written to the `build` folder. You can `cd` into this folder and start the server by directly running the `server.js` file. Learn more about the [TypeScript build process](./fundamentals/typescript-build-process.md)

```sh
cd build
node server.js
```
