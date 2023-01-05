The `.adonisrc.json` file is used to configure the workspace and some of the runtime settings of your application. In this file, you can [register providers](#providers), define [command aliases](#commandsaliases), specify the [files to copy](#metafiles) to the production build, and much more.

The file only contains the minimum required configuration to run your application. However, you can view the complete file contents by running the following Ace command.

```sh
node ace dump:rcfile
```

You can access the parsed RCFile contents using the `app` service.

```ts
import app from '@adonisjs/core/services/app'

console.log(app.rcFile)
```

### typescript

The `typescript` property informs the framework and the Ace commands that your application is using TypeScript. Currently, this value is always set to `true`. However, we will later allow applications to be written in JavaScript as well.

### directories

A set of directories and their paths used by the scaffolding commands. If you decide to rename certain directories, then do update their new path inside the `directories` object to notify scaffolding commands.

```json
{
  "directories": {
    "config": "config",
    "commands": "commands",
    "contracts": "contracts",
    "public": "public",
    "providers": "providers",
    "languageFiles": "resources/lang",
    "migrations": "database/migrations",
    "seeders": "database/seeders",
    "factories": "database/factories",
    "views": "resources/views",
    "start": "start",
    "tmp": "tmp",
    "tests": "tests",
    "httpControllers": "app/controllers",
    "models": "app/models",
    "services": "app/services",
    "exceptions": "app/exceptions",
    "mailers": "app/mailers",
    "middleware": "app/middleware",
    "policies": "app/policies",
    "validators": "app/validators"
  }
}
```

### preloads
An array of files to import at the time of booting the application. The files are imported right after booting the service providers.

You can define the environment in which to import the file. The valid options are:

- `web` environment refers to the process started for the HTTP server.
- `console` environment refers to the Ace commands except for the `repl` command.
- `repl` environment refers to the process started using the `node ace repl` command.
- Finally, `test` environment refers to the process started for running the tests.

The preload files can also be marked optional. Optional files are imported only when they exist.


:::note

You can create and register a preload file by running the `node ace make:prldfile` command.


:::

```json
{
  "preloads": ["./start/view.js"]
}
```

```json
{
  "preloads": [
    {
      "file": "./start/routes.js",
      "optional": false,
      "environment": [
        "web",
        "console",
        "test"
      ]
    },
  ]
}
```

### metaFiles

The `metaFiles` array is a collection of files you want to copy to the `build` folder when creating the production build.

These are non TypeScript/JavaScript files that must exist in the production build for your application to work. For example, the Edge templates, i18n language files and so on.

- `pattern`: The [glob pattern](https://github.com/sindresorhus/globby#globbing-patterns) to find matching files. 
- `reloadServer`: Reload the development server when any of the matching files change.

```json
{
  "metaFiles": [
    {
      "pattern": "public/**",
      "reloadServer": false
    },
    {
      "pattern": "resources/views/**/*.edge",
      "reloadServer": false
    }
  ]
}
```

### commands
An array of paths to import ace commands. You can define a relative path like `./commands/main.js` or path to an installed package.

```json
{
  "commands": [
    "./commands/main.js",
    "@adonisjs/core/commands",
    "@adonisjs/lucid/commands"
  ]
}
```

### commandsAliases
A key-value pair of command aliases. This is usually to help you create memorable aliases for the commands that are harder to type or remember.

```json
{
  "commandsAliases": {
    "migrate": "migration:run"
  }
}
```

You can also define multiple aliases by adding multiple entries.

```json
{
  "commandsAliases": {
    "migrate": "migration:run",
    "up": "migration:run"
  }
}
```

### tests

The `tests` object registers the tests suites and some of the global settings for the tests runner.

```json
{
 "tests": {
    "timeout": 2000,
    "forceExit": false,
    "suites": [
      {
        "name": "functional",
        "files": [
          "tests/functional/**/*.spec.ts"
        ],
        "timeout": 30000
      }
    ]
  }
}
```



- `timeout`: Define the default timeout for all the tests.
- `forceExit`: Set it true to force exit the process as soon as the tests complete. Usually, it is a good practice to perform a graceful exit.
- `suite.name`: A unique name for the test suite.
- `suite.files`: An array of glob patterns to import the test files.
- `suite.timeout`: The default timeout for all the tests inside the suite.

### providers
An array of service providers to load during the application boot phase.

By default, the providers are loaded in all the environments. However, you can also define an explicit array of environments in which to import the provider.

- `web` environment refers to the process started for the HTTP server.
- `console` environment refers to the Ace commands except for the `repl` command.
- `repl` environment refers to the process started using the `node ace repl` command.
- Finally, `test` environment refers to the process started for running the tests.


:::note

Providers are loaded in the same order as they are registered inside the `providers` array.


:::

```json
{
  "providers": [
    "./providers/app_provider.js",
    "@adonisjs/core/providers/app_provider",
    "@adonisjs/core/providers/http_provider",
    "@adonisjs/core/providers/hash_provider"
  ]
}
```

```json
{
  "providers": [
    {
      "file": "./providers/app_provider.js",
      "environment": [
        "web",
        "console",
        "test"
      ]
    },
    {
      "file": "@adonisjs/core/providers/app_provider"
    },
    {
      "file": "@adonisjs/core/providers/http_provider",
      "environment": [
        "web"
      ]
    },
    {
      "file": "@adonisjs/core/providers/hash_provider"
    }
  ]
}
```

