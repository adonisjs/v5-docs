---
summary: The application module of AdonisJS is responsible for booting the app and managing its lifecycle.
---

The application module of AdonisJS is responsible for booting the app in different known environments.

When you start the HTTP server from the `server.ts` file or run the `node ace serve` command, the application is booted for the **web** environment.

Whereas running the `node ace repl` command boots the application in the **repl** environment. All other commands boot the application in the **console** environment.

The environment of the application plays an essential role in deciding which actions to perform. For example, The **web** environment does not register or boot the Ace providers.

You can access the current environment of the application using the `environment` property. Following is the list of known application environments.

- `web` environment refers to the process started for the HTTP server.
- `console` environment refers to the Ace commands except for the REPL command.
- `repl` environment refers to the process started using `node ace repl` command.
- `test` environment referes to the process started using the `node ace test` command.

```ts
import Application from '@ioc:Adonis/Core/Application'
console.log(Application.environment)
```

## Boot lifecycle

Following is the boot lifecycle of the application. 

::img[]{src="https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1617132548/v5/application-boot-lifecycle.png" width="300px"}

<!--

graph TD
A[state:unknown] - ->|Begin boot process| B(state:initiated)
B - ->|Load and validate env variables<br />Load config<br />Configure logger and profiler | C(state:setup)
C - ->|Register providers| D(state:registered)
D - ->|Boot providers <br />Import preload files| E(state:booted)
E - ->|Execute providers ready method| F(state:ready)
F - -> G[[Run main code]]
G - -> H[/Shutdown method invoked/]
H - ->|Execute providers shutdown method| I(state:shutdown)

-->

You can access the IoC container bindings once the application state is set to `booted` or `ready`. An attempt to access the container bindings before the booted state results in an exception.

For example, if you have a service provider who wants to resolve the container's bindings, you should write the import statements inside the `boot` or the `ready` methods.

:::caption{for="error"}
Top-level import will not work
:::

```ts
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import Route from '@ioc:Adonis/Core/Route'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public async boot() {
    Route.get('/', async () => {})
  }
}
```

:::caption{for="success"}
Move import inside the boot method
:::

```ts
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public async boot() {
    const { default: Route } = await import('@ioc:Adonis/Core/Route')
    Route.get('/', async () => {})
  }
}
```

## Version

You can access the application and the framework version using the `version` and `adonisVersion` properties.

The `version` property refers to the version inside the `package.json` file of your app. The `adonisVersion` property refers to the installed version of the `@adonisjs/core` package.

```ts
import Application from '@ioc:Adonis/Core/Application'

console.log(Application.version!.toString())
console.log(Application.adonisVersion!.toString())
```

Both the version properties are represented as an object with the `major`, `minor`, and the `patch` sub-properties.

```ts
console.log(Application.version!.major)
console.log(Application.version!.minor)
console.log(Application.version!.patch)
```

## Node environment

You can access the node environment using the `nodeEnvironment` property. The value is a reference to the `NODE_ENV` environment variable. However, the value is further normalized to be consistent.

```ts
import Application from '@ioc:Adonis/Core/Application'

console.log(Application.nodeEnvironment)
```

| NODE_ENV | Normalized to | 
|------------|----------------|
| dev | development |
| develop | development |
| stage | staging |
| prod | production |
| testing | test |

Also, you can make use of the following properties as a shorthand to know the current environment.

### inProduction
```ts
Application.inProduction

// Same as
Application.nodeEnvironment === 'production'
```

---

### inDev
```ts
Application.inDev

// Same as
Application.nodeEnvironment === 'development'
```

---

### inTest
```ts
Application.inTest

// Same as
Application.nodeEnvironment === 'test'
```

## Make paths to project directories

You can make use of the Application module to make an absolute path to known project directories.

### configPath
Make an absolute path to a file inside the `config` directory.

```ts
Application.configPath('shield.ts')
```

---

### publicPath
Make an absolute path to a file inside the `public` directory.

```ts
Application.publicPath('style.css')
```

---

### databasePath
Make an absolute path to a file inside the `database` directory.

```ts
Application.databasePath('seeders/Database.ts')
```

---

### migrationsPath
Make an absolute path to a file inside the `migrations` directory.

```ts
Application.migrationsPath('users.ts')
```

---

### seedsPath
Make an absolute path to a file inside the `seeds` directory.

```ts
Application.seedsPath('Database.ts')
```

---

### resourcesPath
Make an absolute path to a file inside the `resources` directory.

```ts
Application.resourcesPath('scripts/app.js')
```

---

### viewsPath
Make an absolute path to a file inside the `views` directory.

```ts
Application.viewsPath('welcome.edge')
```

---

### startPath
Make an absolute path to a file inside the `start` directory.

```ts
Application.startPath('routes.ts')
```

---

### tmpPath
Make an absolute path to a file inside the application `tmp` directory.

```ts
Application.tmpPath('uploads/avatar.png')
```

---

### makePath

Make an absolute path from the root of the application.

```ts
Application.makePath('app/Middleware/Auth.ts')
```

## Other properties

Following is the list of properties on the application module.

### appName

Name of the application. It refers to the `name` property inside the `package.json` file of your application.

```ts
Application.appName
```

---

### appRoot

Absolute path to the application root directory.

```ts
Application.appRoot
```

---

### rcFile

Reference to the parsed [AdonisRc file](./adonisrc-file.md).

```ts
Application.rcFile.providers
Application.rcFile.raw
```

---

### container

Reference to the IoC container instance.

```ts
Application.container
```

---

### helpers

Reference to the helper's module.

```ts
Application.helpers.string.snakeCase('helloWorld')
```

You can also access the helpers module directly.

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.snakeCase('helloWorld')
```

---

### logger

Reference to the application logger. 

```ts
Application.logger.info('hello world')
```

You can also access the logger module directly.

```ts
import Logger from '@ioc:Adonis/Core/Logger'

Logger.info('hello world')
```

---

### config

Reference to the config module. 

```ts
Application.config.get('app.secret')
```

You can also access the config module directly.

```ts
import Config from '@ioc:Adonis/Core/Config'

Config.get('app.secret')
```

---

### env

Reference to the env module. 

```ts
Application.env.get('APP_KEY')
```

You can also access the env module directly.

```ts
import Env from '@ioc:Adonis/Core/Env'

Env.get('APP_KEY')
```

---

### isReady

Find if the application is in the ready state. It is used internally to stop accepting new HTTP requests when `isReady` is false.

```ts
Application.isReady
```

---

### isShuttingDown

Find if the application is in the shutdown process. 

```ts
Application.isShuttingDown
```
