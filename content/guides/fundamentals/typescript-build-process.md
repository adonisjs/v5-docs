---
summary: Learn how AdonisJS builds your TypeScript application in both development and production both.
---

One of the framework's goals is to provide first-class support for TypeScript. This goes beyond the static types and IntelliSense you can enjoy while writing the code.

**We also ensure that you never have to install any additional build tools to compile your code during development or for production.**

:::note
This guide assumes that you have some knowledge about TypeScript and the build tools ecosystem.
:::

## Common bundling approaches
Following are some of the common approaches for developing a Node.js application written in TypeScript.

### Using tsc
The simplest way to compile your TypeScript code to JavaScript is using the official `tsc` command line.

- During development, you can compile your code in the watch mode using the `tsc --watch` command.
- Next, you may grab `nodemon` to watch the compiled output (JavaScript code) and restart the HTTP server on every change. By this time, you have two watchers running.
- Also, you may have to write [custom scripts to copy static files](https://github.com/microsoft/TypeScript/issues/30835) like **templates** to the build folder so that your runtime JavaScript code can find and reference it.

---

### Using ts-node
ts-node does improve the development experience, as it compiles code in memory and does not output it on the disk. Thus, you can combine `ts-node` and `nodemon` and run your TypeScript code as a first-class citizen.

However, for larger applications, `ts-node` may get slow as it has to recompile the entire project on every file change. In contrast, `tsc` was re-building only the changed file.

Do note, `ts-node` is a development-only tool. So you still have to compile your code to JavaScript using `tsc` and write custom scripts to copy static files for production.

---

### Using Webpack
After trying the above approaches, you may decide to give Webpack a try. Webpack is a build tool and has a lot to offer. But, it comes with its own set of downsides.

- Very first, using Webpack to bundle the backend code is an overkill. You may not even need 90% of the Webpack features created to serve the frontend ecosystem.
- You may have to repeat some of the configurations in the `webpack.config.js` config and `tsconfig.json` file mainly, which files to watch and ignore.
- Also, we are not even sure if you can instruct [Webpack NOT TO bundle](https://stackoverflow.com/questions/40096470/get-webpack-not-to-bundle-files) the entire backend into a single file.

## AdonisJS approach
We are not a big fan of over-complicated build tools and bleeding-edge compilers. Having a calm development experience is way more valuable than exposing config to tune every single knob.

We started with the following set of goals.

- Stick to the official compiler of TypeScript and do not use any other tools like `esbuild` or `swc`. They are great alternatives, but they don't support some of the TypeScript features (ex. [the Transformers API](https://levelup.gitconnected.com/writing-typescript-custom-ast-transformer-part-1-7585d6916819)).
- The existing `tsconfig.json` file should manage all the configurations.
- If the code runs in development, then it should run in production too. Meaning, do not use two completely different development and production tools and then teach people how to adjust their code.
- Add lightweight support for copying static files to the final build folder. Usually, these will be the Edge templates.
- **Make sure the REPL can also run the TypeScript code as a first-class citizen. All of the above approaches, except `ts-node`, cannot compile and evaluate the TypeScript code directly.**

## In-memory development compiler
Similar to ts-node, we created the [@adonisjs/require-ts](https://github.com/adonisjs/require-ts) module. It uses the TypeScript compiler API, meaning all the TypeScript features work, and your `tsconfig.json` file is the single source of truth.

However, `@adonisjs/require-ts` is slightly different from `ts-node` in the following ways.

- We do not perform any type-checking during development and expect you to rely on your code editor for the same.
- We store the [compiled output](https://github.com/adonisjs/require-ts/blob/develop/src/Compiler/index.ts#L185-L223) in a cache folder. So the next time when your server restarts, we do not recompile the unchanged files. This does improve the speed dramatically.
- The cached files have to be deleted at some point. The `@adonisjs/require-ts` module exposes the [helper methods](https://github.com/adonisjs/require-ts/blob/develop/index.ts#L43-L57) that AdonisJS file watcher uses to clear the cache for the recently changed file.
- Clearing cache is only essential for claiming the disk space. It does not impact the behavior of the program.

Every time you run `node ace serve --watch`, we start the HTTP server along with the in-memory compiler and watch the filesystem for file changes.

## Standalone production builds
You build your code for production by running the `node ace build --production` command. It performs the following operations.

- Clean the existing `build` directory (if any).
- Build your frontend assets using Webpack Encore (only if it is installed).
- Use the TypeScript compiler API to compile the TypeScript code to JavaScript and write it inside the `build` folder. **This time, we do perform type checking and report the TypeScript errors**.
- Copy all the static files to the `build` folder. The static files are registered inside the `.adonisrc.json` file under the `metaFiles` array.
- Copy the `package.json` and `package-lock.json`/`yarn.lock` to the `build` folder.
- Generate the `ace-manifest.json` file. It contains an index of all the commands your project is using.
- That is all.

---

#### Why do we call it a standalone build?
After running the `build` command, the output folder has everything you need to deploy your application in production.

You can copy the `build` folder without your TypeScript source code, and your application will work just fine.

Creating a standalone `build` folder does help in reducing the size of code that you deploy on your production server. This is usually helpful when you package your app as a Docker image. However, there is no need to have both the source and build output in your Docker image and keep it lightweight.

---

#### Points to keep in mind

- Post-build, the output folder becomes the root of your JavaScript application.
- You must always `cd` into the `build` folder and then run your app.
  ```sh
  cd build
  node server.js
  ```
- You must install production-only dependencies inside the `build` folder.
  ```sh
  cd build
  npm ci --production
  ```
- We do not copy the `.env` file to the output folder. Because the environment variables are not transferable, you must define environment variables for production separately.
