---
summary: Learn how to deploy your AdonisJS applications to a production server.
---

Deploying an AdonisJS application is no different than deploying a standard Node.js application. You need a server/platform that can install and run `Node.js >= 14.15.4`.

:::note
For a frictionless deployment experience, you can try Cleavr. It is a server provisioning service and has first-class support for [deploying AdonisJS apps](https://cleavr.io/adonis).

**Disclaimer - Cleavr is also a sponsor of AdonisJS**
:::

## Compiling TypeScript to JavaScript

AdonisJS applications are written in TypeScript and must be compiled to JavaScript during deployment. You can either compile your application directly on the production server or perform the build step in a CI/CD pipeline.

You can build your [code for production](./typescript-build-process.md#standalone-production-builds) by running the following ace command. The compiled JavaScript output is written to the `build` directory.

```sh
node ace build --production
```

If you have performed the build step inside a CI/CD pipeline, then you can move just the `build` folder to your production server and install the production dependencies directly on the server.

## Starting the production server

You can start the production server by running the `server.js` file.

If you have performed the build step on your production server, make sure to first `cd` into the build directory and then start the server.

```sh
cd build
npm ci --production

# Start server
node server.js
```

If the build step was performed in a CI/CD pipeline and **you have copied only the `build` folder to your production server**, then the `build` becomes the root of your application.

```sh
npm ci --production

# Start server
node server.js
```

### Using a process manager

It is recommended to use a process manager when managing a Node.js application on a bare bone server.

A process manager ensures to restart the application if it crashes during runtime. Some process managers like [pm2](https://pm2.keymetrics.io/docs/usage/quick-start/) can also perform graceful restarts when re-deploying the application.

Following is an example [ecosystem file](https://pm2.keymetrics.io/docs/usage/application-declaration/) for pm2.

```ts
module.exports = {
  apps: [
    {
      name: 'web-app',
      script: './build/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
    },
  ],
}
```

## Nginx reverse proxy
When running the AdonisJS application on a bare-bone server, you must put it behind Nginx (or a similar web server) for [many different reasons](https://medium.com/intrinsic/why-should-i-use-a-reverse-proxy-if-node-js-is-production-ready-5a079408b2ca), but SSL termination being an important one.

:::note
Make sure to read the [trusted proxies guide](../http/request.md#trusted-proxy) to ensure you can access the visitor's correct IP address, when running AdonisJS application behind a proxy server.
:::

Following is an example Nginx config to proxy requests to your AdonisJS application. **Make sure to replace the values inside the angle brackets `<>`**.

```sh
server {
  listen 80;

  server_name <APP_DOMAIN.COM>;

  location / {
      proxy_pass http://localhost:<ADONIS_PORT>;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_cache_bypass $http_upgrade;
  }
}
```

## Migrating database
You can migrate your production database using the `node ace migration:run --force` command. The `--force` flag is required when running migrations in the production environment.

### When to migrate

Also, you must always run the migrations before restarting the server. If the migration fails, then do not restart the server.

If you are using a managed service like Cleavr or Heroku, they can automatically handle this use case. Otherwise, you will have to run the migration script inside a CI/CD pipeline or run it manually by SSHing to the server.

### Do not rollback in production
The `down` method in your migration files usually contains destructive actions like **drop the table**, or **remove a column**, and so on. It is recommended to turn off rollbacks in production inside the `config/database.ts` file.

Disabling rollbacks in production will ensure that running the `node ace migration:rollback` command results in error.

```ts
{
  pg: {
    client: 'pg',
    migrations: {
      // highlight-start
      disableRollbacksInProduction: true,
      // highlight-end
    }
  }
}
```

### Avoid concurrent migration tasks
When deploying your AdonisJS application on multiple servers, make sure to run the migrations from only one server and not all of them.

For MySQL and PostgreSQL, Lucid will obtain [advisory locks](https://www.postgresql.org/docs/9.4/explicit-locking.html#ADVISORY-LOCKS) to ensure that concurrent migration is not allowed. However, it is better to avoid running migrations from multiple servers in the first place.

## Persistent storage for file uploads
Modern-day deployment platforms like AWS ECS, Heroku, or Digital ocean apps run your application code inside [ephemeral filesystem](https://devcenter.heroku.com/articles/dynos#ephemeral-filesystem), which means that each deployment will nuke the existing filesystem and creates a fresh one.

You will lose the user uploaded files if they are stored within the same storage as your application code. Hence, it is better to use [third party cloud storage](../http/file-uploads.md#moving-files-to-the-cloud-storage) for storing user-uploaded files.

:::note
We are currently working on a module that allows you to use the local filesystem during development and then switch to an external filesystem like S3 for production. Do all this without changing a single line of code.
:::

## Logging
The [AdonisJS logger](../digging-deeper/logger.md) write logs to `stdout` and `stderr` in JSON format. You can either set up an external logging service to read the logs from stdout/stderr or forward them to a local file on the same server.

The framework core and ecosystem packages write logs at the `trace` level. You must set the logging level to `trace` when you want to debug the framework internals.

## Debugging database queries
The Lucid ORM emits the `db:query` event when database debugging is turned on. You can listen to the event and debug the SQL queries using the Logger.

Following is an example of pretty-printing the database queries in development and using the Logger in production.

```ts
// title: start/event.ts
import Event from '@ioc:Adonis/Core/Event'
import Logger from '@ioc:Adonis/Core/Logger'
import Database from '@ioc:Adonis/Lucid/Database'
import Application from '@ioc:Adonis/Core/Application'

Event.on('db:query', (query) => {
  if (Application.inProduction) {
    Logger.debug(query)
  } else {
    Database.prettyPrint(query)
  }
})
```

## Environment variables
You must keep your production environment variables secure and do not keep them alongside your application code. If you are using a deployment platform like Cleavr, Heroku, and so on, you must manage environment variables from their web dashboard.

When deploying your code on a bare-bones server, you can keep your environment variables inside the `.env` file. The file can also live outside the application codebase. Make sure to inform AdonisJS about its location using the `ENV_PATH` environment variable.

```sh
cd build

ENV_PATH=/etc/myapp/.env node server.js
```

## Caching views
You must cache the edge templates in production using the `CACHE_VIEWS` environment variable. The templates are cached in memory at runtime, and no precompiling is required.

```dotenv
CACHE_VIEWS=true
```
