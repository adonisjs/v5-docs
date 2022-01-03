---
datetime: 2020-04-22
author: Virk
avatarUrl: https://res.cloudinary.com/adonis-js/image/upload/v1619103621/adonisjs-authors-avatars/DYO4KUru_400x400_shujhw.jpg
summary: Cookbook to deploy AdonisJS application to Heroku
---

This guide covers the action steps for deploying an AdonisJS application to [Heroku](https://devcenter.heroku.com/articles/deploying-nodejs).

Deploying an AdonisJS application is no different from deploying a standard Node.js application. You just have to keep a few things in mind:

- You build your TypeScript source to JavaScript, before deploying the app.
- You will have to start the server from the `build` folder and not the project root. Same is true for running migrations any other Node.js apps.

You can build your project for production by running the following ace command. Learn more about the [TypeScript build process](../../guides/fundamentals/typescript-build-process.md)

```sh
node ace build --production

# OR use the npm script
npm run build
```

## Adding the Procfile
Before you push your code to Heroku for deployment, make sure to create a [Procfile](https://devcenter.heroku.com/articles/procfile#deploying-to-heroku) in the root of your application.

The file instructs Heroku always to run the migrations during the release and start the server from the `build` folder.

```text
web: node build/server.js
release: node build/ace migration:run --force
```

## Defining environment variables
You must also define the environment variables in the Heroku dashboard. You can consult the development `.env` for the variables you have to define with Heroku.

- Do not define the `PORT` environment variable. Heroku will define it for you automatically.
- Make sure to generate the app key by running the `node ace generate:key` command and define it as `APP_KEY` environment variable.
- Save the `APP_KEY` securely. If you lose this key, all the encryption data, cookies, and sessions will become invalid.

![](https://res.cloudinary.com/adonis-js/image/upload/f_auto,q_auto/v1619085409/v5/heroku-env-vars.jpg)

## Time to deploy
You can now push your code to Heroku by running the `git push heroku master` command. Heroku will perform the following steps for you.

- It will detect your application as a Node.js app and use the `heroku/nodejs` buildpack to build and deploy it.
- It will detect the `build` script inside the `package.json` file and build your TypeScript code to JavaScript. **You must always run the JavaScript code in production**.
- Post-build, it will [prune](https://docs.npmjs.com/cli/v7/commands/npm-prune) the development dependencies.
- Runs the `release` script defined inside the `Procfile`.
- Runs the `web` script defined inside the `Procfile`.

## Using database
You can use the Heroku add-ons to add a database to your application. Just make sure to define the required environment variables for AdonisJS to connect to your database.

Again, you can again consult the development `.env` to view the name of the environment variables you are using for database connection.

:::note

If you are using PostgreSQL and getting `pg_hba.conf` error. Then make sure to enable SSL certificates for your app. If you cannot enable SSL, you must update the database connection to allow non-SSL connections.

```ts
// title: config/database.js
pg: {
  client: 'pg',
  connection: {
    // ....
    ssl: {
      rejectUnauthorized: false
    }
  }
}
```

:::

## Managing user uploaded files
Heroku does not have [persistent storage](https://help.heroku.com/K1PPS2WM/why-are-my-file-uploads-missing-deleted), and you cannot save the user uploaded files on the server filesystem. This leaves you with only one option of saving the uploaded files to an external service like S3.

We are currently working on a module that allows you to use the local filesystem during development and then switch to an external filesystem like S3 for production. Do all this without changing a single line of code.
