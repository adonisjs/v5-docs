---
summary: Learn how to deploy your AdonisJS applications to a production server.
---

Deploying an AdonisJS application is no different than deploying any other Node.js application. First, you'll need a server/platform that can install and run the latest release of `Node.js v14`.

:::note
For a frictionless deployment experience, you can try Cleavr. It is a server provisioning service and has first-class support for [deploying AdonisJS apps](https://cleavr.io/adonis).

**Disclaimer: Cleavr is also a sponsor of AdonisJS.**
:::

## Compiling TypeScript to JavaScript

AdonisJS applications are written in TypeScript and must be compiled to JavaScript during deployment. You can compile your application directly on the production server or perform the build step in a CI/CD pipeline.

You can build your [code for production](./typescript-build-process.md#standalone-production-builds) by running the following Ace command. The compiled JavaScript output is written inside the `build` directory.

```sh
node ace build --production
```

If you have performed the build step inside a CI/CD pipeline, then you can move just the `build` folder to your production server and install the production dependencies directly on the server.

## Starting the production server

You can start the production server by running the `server.js` file.

If you have performed the build step on your production server, make sure to first `cd` into the `build` directory and then start the server.

```sh
cd build
npm ci --production

# Start server
node server.js
```

If the build step was performed in a CI/CD pipeline and **you have copied only the `build` folder to your production server**, the `build` directory becomes the root of your application.

```sh
npm ci --production

# Start server
node server.js
```

### Using a process manager

It is recommended to use a process manager when managing a Node.js application on a basic server.

A process manager ensures to restart the application if it crashes during runtime. In addition, some process managers like [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/) can also perform graceful restarts when re-deploying the application.

Following is an example [ecosystem file](https://pm2.keymetrics.io/docs/usage/application-declaration/) for PM2.

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

## NGINX reverse proxy
When running the AdonisJS application on a basic server, you must put it behind NGINX (or a similar web server) for [many different reasons](https://medium.com/intrinsic/why-should-i-use-a-reverse-proxy-if-node-js-is-production-ready-5a079408b2ca), with the SSL termination being one of the most important.

:::note
Make sure to read the [trusted proxies guide](../http/request.md#trusted-proxy) to ensure you can access the visitor's correct IP address when running the AdonisJS application behind a proxy server.
:::

Following is an example of NGINX config to proxy requests to your AdonisJS application. **Make sure to replace the values inside the angle brackets `<>`**.

```nginx
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
Using the `node ace migration:run --force` command, you can migrate your production database. The `--force` flag is required when running migrations in the production environment.

### When to migrate

Also, it would be best if you always run the migrations before restarting the server. Then, if the migration fails, do not restart the server.

Using a managed service like Cleavr or Heroku, they can automatically handle this use case. Otherwise, you will have to run the migration script inside a CI/CD pipeline or run it manually through SSH.

### Do not rollback in production
The `down` method in your migration files usually contains destructive actions like **drop the table**, or **remove a column**, and so on. It is recommended to turn off rollbacks in production inside the `config/database.ts` file.

Disabling rollbacks in production will ensure that the `node ace migration:rollback` command results in an error.

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
Modern-day deployment platforms like Amazon ECS, Heroku, or DigitalOcean apps run your application code inside an [ephemeral filesystem](https://devcenter.heroku.com/articles/dynos#ephemeral-filesystem), which means that each deployment will nuke the existing filesystem and creates a fresh one.

You will lose the user uploaded files if stored within the same storage as your application code. Hence, you must consider using [Drive](../digging-deeper/drive.md) to keep the user uploaded files on a cloud storage service like Amazon S3 or Google Cloud Storage.

## Logging
The [AdonisJS Logger](../digging-deeper/logger.md) writes logs to `stdout` and `stderr` in JSON format. You can either set up an external logging service to read the logs from stdout/stderr, or forward them to a local file on the same server.

The framework core and ecosystem packages write logs at the `trace` level. Therefore, you must set the logging level to `trace` when debugging the framework internals.

## Debugging database queries
The Lucid ORM emits the `db:query` event when database debugging is turned on. You can listen to this event and debug the SQL queries using the Logger.

Following is an example of pretty-printing the database queries in development and using the Logger in production.

```ts
// title: start/event.ts
import Event from '@ioc:Adonis/Core/Event'
import Logger from '@ioc:Adonis/Core/Logger'
import Database from '@ioc:Adonis/Lucid/Database'
import Application from '@ioc:Adonis/Core/Application'

Event.on('db:query', (query) => {
  if (Application.inProduction) {
    Logger.debug(query.sql)
  } else {
    Database.prettyPrint(query)
  }
})
```

## Environment variables
You must keep your production environment variables secure and do not keep them alongside your application code. If you are using a deployment platform like Cleavr, Heroku, and so on, you must manage environment variables from their web dashboard.

When deploying your code on a basic server, you can keep your environment variables inside the `.env` file. The file can also live outside the application codebase. Make sure to inform AdonisJS about its location using the `ENV_PATH` environment variable.

```sh
cd build

ENV_PATH=/etc/myapp/.env node server.js
```

## Caching views
You must cache the Edge templates in production using the `CACHE_VIEWS` environment variable. The templates are cached in memory at runtime, and no precompiling is required.

```dotenv
CACHE_VIEWS=true
```

## Serving static assets
Serving static assets effectively is essential for the performance of your application. Regardless of how fast your AdonisJS applications are, the delivery of static assets plays a massive role to a better user experience.

### Using a CDN service
The best approach is to use a CDN for delivering the static assets from your AdonisJS application.

The front-end assets compiled using [Webpack Encore](../http/assets-manager.md) are fingerprinted, and this allows your CDN server to cache them aggressively.

Depending upon the CDN service you are using and your deployment technique, you may have to add a step to your deployment process to move the static files to the CDN server. This is how it should work in a nutshell.

- Update `webpack.config.js` to use the CDN URL when creating the production build.
  ```js
  if (Encore.isProduction()) {
    Encore.setPublicPath('https://your-cdn-server-url/assets')
    Encore.setManifestKeyPrefix('assets/')
  } else {
    Encore.setPublicPath('/assets')
  }
  ```
- Build your AdonisJS application as usual.
- Copy the output of `public/assets` to your CDN server. For example, [here is a command](https://github.com/adonisjs-community/polls-app/blob/main/commands/PublishAssets.ts) we use to publish the assets to an Amazon S3 bucket.

---

### Using NGINX to deliver static files
Another option is to offload the task of serving assets to NGINX. If you use Webpack Encore to compile the front-end assets, you must aggressively cache all the static files since they are fingerprinted.

Add the following block to your NGINX config file. **Make sure to replace the values inside the angle brackets `<>`**.

```nginx
location ~ \.(jpg|png|css|js|gif|ico|woff|woff2) {
  root <PATH_TO_ADONISJS_APP_PUBLIC_DIRECTORY>;
  sendfile on;
  sendfile_max_chunk 2mb;
  add_header Cache-Control "public";
  expires 365d;
}
```

---

### Using AdonisJS static file server
You can also rely on the AdonisJS inbuilt static file server to serve the static assets from the `public` directory to keep things simple.

No additional configuration is required. Just deploy your AdonisJS application as usual, and the request for static assets will be served automatically. However, if you use Webpack Encore to compile your front-end assets, you must update the `config/static.ts` file with the following options.

```ts
// title: config/static.ts
{
  // ... rest of the config
  maxAge: '365d',
  immutable: true,
}
```
