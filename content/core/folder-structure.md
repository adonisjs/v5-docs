In this guide, we will take a tour of the important files and folders created by AdonisJS during the installation process. 

We ship with a thoughtful default folder structure that helps you keep your projects tidy and easy to refactor. However, you have all the freedom to diverge and have a folder structure that works well for your team and project.

## The `.adonisrc.json` file

The `.adonisrc.json` file is used to configure the workspace and some of the runtime settings of your application.

In this file, you can register providers, define command aliases, specify the files to copy to the production build, and much more.

We have a dedicated guide on the [AdonisRC file](./adonisrc-file.md), covering all the options in detail.


## The `ace` file

The `ace` file boots the command-line framework that is local to your app. Every time you run an ace command, it goes through this file.

If you notice, the ace file ends with a `.js` extension. We want to run this file directly using the `node` binary without compiling it first or using any loaders.

## The `server.ts` file

The `server.ts` file is the entry point for the HTTP server. During development, this file is imported by the `node ace serve` command.

In production, we compile this file to `.js` and then run it using the node binary. `node build/server.js`.

## The `test.ts` file

The `test.ts` file is the entry point for the testing framework. The `node ace test` command imports this file behind the scenes before running the tests.

## The sub-path imports

AdonisJS uses the [sub-path imports](https://nodejs.org/dist/latest-v19.x/docs/api/packages.html#subpath-imports) from Node.js to define import aliases. For example, the following import aliases are pre-configured within the `package.json` file.

```json
{
  "imports": {
    "#controllers/*": "./app/controllers/*.js",
    "#models/*": "./app/models/*.js",
    "#services/*": "./app/services/*.js",
    "#exceptions/*": "./app/exceptions/*.js",
    "#listeners/*": "./app/listeners/*.js",
    "#middleware/*": "./app/middleware/*.js",
    "#validators/*": "./app/validators/*.js"
  }
}
```

The internals of the framework does not rely on any of the aliases. Therefore, you can edit the paths, rename the aliases, or even remove them altogether.

## Scaffolding directories

AdonisJS scaffolding commands like `make:controller` or `make:model` uses the conventional directory names to create files for you.

If you run the following command, a `posts.ts` file will be created within the `./app/controllers` directory.

```sh
node ace make:controller posts

# Create: app/controllers/posts.ts
```

You can override the directories used by the scaffolding commands within the `.adonisrc.json` file. For example, you can define a custom path for controllers as follows.

```json
{
  "directories": {
    "controllers": "./app/actions"
  }
}
```

To view all the available directories, run the following ace commands.

```sh
node ace dump:rcfile
```

## The `app` directory

The `app` directory organizes code for the domain logic of your application. For example, the controllers, models, services, etc., all live within the `app` directory.

```
├── app
│  └── controllers
│  └── exceptions
│  └── middleware
│  └── models
│  └── validators
```


## The `resources` directory

The `resources` directory contains the Edge templates, alongside the source files of your frontend code. In other words, the code for the presentation layer of your app lives within the `resources` directory.

```
├── resources
│  └── views
│  └── js
│  └── css
│  └── fonts
│  └── images
```

## The `start` directory

The `start` directory contains the files you want to import during the boot lifecycle of the application. For example, the files to register routes and define event listeners should live within the `start` directory.

```
├── start
│  ├── kernel.ts
│  ├── routes.ts
│  ├── validator.ts
│  ├── events.ts
```

AdonisJS does not auto-import files from the `start` directory. It is merely used as a convention to group similar files.

We recommend reading about [preload files]() and the [application boot lifecycle]() to have a better understanding of which files to keep under the `start` directory.

## The `public` directory

The `public` directory is used to host publicly available static assets. 

If you are using Vite, the compiled output of Vite will be written to the public directory. Otherwise, you can manually create files within the `public` directory.

The files within the `public` directory are served directly by their filename. So, for example, if you have a `public/style.css` file, you can access it using the `http://localhost:3333/style.css` URL.


## The `database` directory

The `database` directory contains files for database migrations and seeders. 

```
├── database
│  └── migrations
│  └── seeders
```


## The `commands` directory

The `commands` directory stores the [custom ace commands](../digging-deeper/ace-commandline.md). You can create commands inside this folder by running `node ace make:command`.


## The `config` directory

The `config` directory contains the runtime configuration files for your application. 

The installed packages use these config files to configure themselves. However, you can also create new files inside this directory and use them within your app.

```
├── config
│  ├── app.ts
│  ├── bodyparser.ts
│  ├── cors.ts
│  ├── database.ts
│  ├── drive.ts
│  ├── hash.ts
│  ├── logger.ts
│  ├── session.ts
│  ├── static.ts
```


## The `types` directory

The `types` directory contains custom TypeScript interfaces or types used within your application. 

We create a few files to infer the environment variables and middleware types. However, you can also store application-specific types within this directory.

```
├── types
│  ├── drive.ts
│  ├── env.ts
│  ├── events.ts
│  ├── hash.ts
│  ├── http_server.ts
│  ├── logger.ts
│  ├── tests.ts
```

## The `providers` directory

The `providers` directory is used to store the [service providers]() used by your application. You can create new providers using the `node ace make:provider` command.

```
├── providers
│  └── app_provider.ts
│  └── http_server_provider.ts
```

## The `tmp` directory

The temporary files generated by your application are stored within the `tmp` directory. These could be user-uploaded files (generated during development) or logs written to the disk.

The `tmp` directory must be ignored by the `.gitignore` rules, and you should not copy it to the production server either.

## The `tests` directory

The `tests` directory organizes your application tests. Further, sub-directories are created for `unit` and `functional` tests.

```
├── tests
│  ├── bootstrap.ts
│  └── functional
│  └── regression
│  └── unit
```
