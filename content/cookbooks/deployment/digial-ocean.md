---
datetime: 2020-04-22
author: Virk
avatarUrl: https://res.cloudinary.com/adonis-js/image/upload/v1619103621/adonisjs-authors-avatars/DYO4KUru_400x400_shujhw.jpg
summary: Cookbook to deploy AdonisJS application to Digital ocean apps platform
---

This guide covers the action steps for deploying an AdonisJS application to [Digital ocean apps platform](https://docs.digitalocean.com/products/app-platform/).

Deploying an AdonisJS application is no different from deploying a standard Node.js application. You just have to keep a few things in mind:

- You build your TypeScript source to JavaScript, before deploying the app.
- You will have to start the server from the `build` folder and not the project root. Same is true for running migrations any other Node.js apps.

You can build your project for production by running the following ace command. Learn more about the [TypeScript build process](../../guides/fundamentals/typescript-build-process.md)

```sh
node ace build --production

# OR use the npm script
npm run build
```

## Configuring the DO App

At the time of deploying your application to the DO apps platform, you will be prompted to provide the environment. You can consult the development `.env` file for the variables you must define.

- Define the `PORT` environment variable same as **HTTP port** you have selected in the settings.
- Make sure to generate the app key by running the `node ace generate:key` command on your local machine and define it as `APP_KEY` environment variable.
- Save the `APP_KEY` securely. If you lose this key, all the encryption data, cookies, and sessions will become invalid.
- Make sure to change the **run command** to start the server from the build folder. `node build/server.js`.

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1619105542/v5/do-start-screen.jpg)

## Using database
You can also add the database as a component to your app and then update the environment variables with the database credentials.

We find Digital ocean database environment variables very generic and recommend re-mapping them as follows:

#### Digital ocean injected env variables
```dotenv
HOSTNAME=
PORT=
USERNAME=
PASSWORD=
DATABASE=
```

#### Re-mapping them to be specific
You must re-map the environment variables to be more specific. For example

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1619105542/v5/do-remmaped-env-vars.jpg)

### Running migrations
Once you have added the database, you will have to add a new component of **"Job type"** and make sure to select **"Before every deploy"** as its lifecycle.

Digital ocean will make you repeat the same process of a adding a new component, re-selecting repository and re-define the environment variables. However, this time we are adding a job and not a web service.

Also, make sure to update the **Run command** to `node build/ace make:migration --force`.

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1619105809/v5/do-job-component.jpg)

## Managing user uploaded files
Digital ocean apps do not have persistent storage and hence you cannot save the user uploaded files on the server filesystem. This leaves you with only one option of saving the uploaded files to an external service like Digital ocean spaces.

We are currently working on a module that allows you to use the local filesystem during development and then switch to an external filesystem like Digital ocean spaces for production. Do all this without changing a single line of code.
