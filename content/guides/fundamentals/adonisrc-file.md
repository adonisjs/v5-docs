---
previewCode: >
  // View file contents + defaults
  node ace dump:rcfile
summary: The adonisrc.json file configures the workspace and some of the runtime settings of an AdonisJS application. It also allows you to override the default conventions around the file structure.
---

The `.adonisrc.json` file is stored inside the root of your project. It configures the workspace and some of the runtime settings of your AdonisJS application.

The file only contains the minimum required configuration to run your application. However, you can view the complete file contents by running the following Ace command.

```sh
node ace dump:rcfile
```

```json
// title: Output
{
  "typescript": true,
  "directories": {
    "config": "config",
    "public": "public",
    "contracts": "contracts",
    "providers": "providers",
    "database": "database",
    "migrations": "database/migrations",
    "seeds": "database/seeders",
    "resources": "resources",
    "views": "resources/views",
    "start": "start",
    "tmp": "tmp",
    "tests": "tests"
  },
  "exceptionHandlerNamespace": "App/Exceptions/Handler",
  "preloads": [
    {
      "file": "./start/routes",
      "optional": false,
      "environment": [
        "web",
        "console",
        "test"
      ]
    },
    {
      "file": "./start/kernel",
      "optional": false,
      "environment": [
        "web",
        "console",
        "test"
      ]
    },
    {
      "file": "./start/views",
      "optional": false,
      "environment": [
        "web",
        "console",
        "test"
      ]
    },
    {
      "file": "./start/events",
      "optional": false,
      "environment": [
        "web"
      ]
    }
  ],
  "namespaces": {
    "models": "App/Models",
    "middleware": "App/Middleware",
    "exceptions": "App/Exceptions",
    "validators": "App/Validators",
    "httpControllers": "App/Controllers/Http",
    "eventListeners": "App/Listeners",
    "redisListeners": "App/Listeners"
  },
  "aliases": {
    "App": "app",
    "Config": "config",
    "Database": "database",
    "Contracts": "contracts"
  },
  "metaFiles": [
    {
      "pattern": "public/**",
      "reloadServer": false
    },
    {
      "pattern": "resources/views/**/*.edge",
      "reloadServer": false
    }
  ],
  "commands": [
    "./commands",
    "@adonisjs/core/build/commands",
    "@adonisjs/repl/build/commands"
  ],
  "commandsAliases": {
  },
  "tests": {
    "suites": [
      {
        "name": "functional",
        "files": [
          "tests/functional/**/*.spec.ts"
        ],
        "timeout": 30000
      }
    ]
  },
  "providers": [
    "./providers/AppProvider",
    "@adonisjs/core",
    "@adonisjs/session",
    "@adonisjs/view"
  ],
  "aceProviders": [
    "@adonisjs/repl"
  ],
  "testProviders": [
    "@japa/preset-adonis/TestsProvider"
  ]
}
```

### typescript
The `typescript` property informs the framework and the Ace commands that your application is using TypeScript. Currently, this value is always set to `true`. However, we will later allow applications to be written in JavaScript as well.

---

### directories
An object of known directories and their pre-configured paths. You can change the path to match your requirements.

Also, all the Ace `make` commands references the `.adonisrc.json` file before creating the file.

```json
{
  "directories": {
    "config": "config",
    "public": "public",
    "contracts": "contracts",
    "providers": "providers",
    "database": "database",
    "migrations": "database/migrations",
    "seeds": "database/seeders",
    "resources": "resources",
    "views": "resources/views",
    "start": "start",
    "tmp": "tmp",
    "tests": "tests"
  }
}
```

---

### exceptionHandlerNamespace
The namespace to the class that handles exceptions occurred during an HTTP request.

```json
{
  "exceptionHandlerNamespace": "App/Exceptions/Handler"
}
```

---

### preloads
An array of files to load at the time of booting the application. The files are loaded right after booting the service providers.

You can define the environment in which to load the file. The valid options are:

- `web` environment refers to the process started for the HTTP server.
- `console` environment refers to the Ace commands except for the `repl` command.
- `repl` environment refers to the process started using the `node ace repl` command.
- Finally, `test` environment is reserved for the future when AdonisJS will have the inbuilt test runner.

Also, you can mark the file as optional, and we will ignore it if the file is missing on the disk.

:::note

You can create and register a preloaded file by running the `node ace make:prldfile` command.

:::

```json
{
  "preloads": [
    {
      "file": "./start/routes",
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

---

### namespaces
An object of namespaces for the known entities.

For example, you can change the controller's namespace from `App/Controllers/Http` to `App/Controllers` and keep the controllers inside the `./app/Controllers` directory.

```json
{
  "namespaces": {
    "controllers": "App/Controllers"
  }
}
```

---

### aliases
The `aliases` property allows you to define the import aliases for specific directories. After defining the alias, you will be able to import files from the root of the aliases directory.

In the following example, the `App` is an alias for the `./app` directory, and the rest is the file path from the given directory.

```ts
import 'App/Models/User'
```

AdonisJS aliases are for runtime only. You will also have to register the same alias inside the `tsconfig.json` file for the TypeScript compiler to work.

```json
{
  "compilerOptions": {
    "paths": {
      "App/*": [
        "./app/*"
      ],
    }
  }
}
```

---

### metaFiles
The `metaFiles` array accepts the files you want AdonisJS to copy to the `build` folder when creating the production build.

- You can define the file paths as a glob pattern, and we will copy all the matching files for that pattern.
- You can also instruct the development server to reload any files inside the matching pattern changes.

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

---

### commands
An array of paths to lookup/index Ace commands. You can define a relative path like `./command` or path to an installed package.

```json
{
  "commands": [
    "./commands",
    "@adonisjs/core/build/commands"
  ]
}
```

---

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

---

### tests
The `test` object holds the collection of test suites used by your application. You can add/remove suites as per your application requirements.

```json
{
 "tests": {
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

---

### providers
An array of service providers to load during the application boot cycle. The providers mentioned inside this array are loaded in all the environments.

```json
{
  "providers": [
    "./providers/AppProvider",
    "@adonisjs/core"
  ],
}
```

---

### aceProviders
An array of providers required the ace commands.

```json
{
  "aceProviders": [
    "@adonisjs/repl"
  ]
}
```

---

### testProviders
An array of providers loaded only during the testing.

```json
{
  "testProviders": [
    "@japa/preset-adonis/TestsProvider"
  ]
}
```
