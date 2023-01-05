The [Application](https://github.com/adonisjs/application/blob/next/src/application.ts) class does all the heavy lifting of wiring together an AdonisJS application. You can use this class to learn about the environment in which your app is running, get the current state of the application, or make paths to specific directories.

In this guide, we will cover the API of the application class. Also, we have another dedicated guide on [application lifecycle](./application-lifecycle.md).

## Environment 

The environment refers to the application runtime environment. The application is always booted in one of the following known environments. 

- `web` environment refers to the process started for the HTTP server.
- `console` environment refers to the Ace commands except for the REPL command.
- `repl` environment refers to the process started using the `node ace repl` command.
- Finally, the `test` environment refers to the process started using the `node ace test` command.

You can access the application environment using the `getEnvironment` method.

```ts
import app from '@adonisjs/core/services/app'

console.log(app.getEnvironment())
```

You can also switch the application environment before it has been booted. A great example of this is the REPL command. 

The `node ace repl` command starts the application in the `console` environment, but then the command internally switches the environment to `repl` before booting the app and presenting the REPL prompt.

```ts
if (!app.isBooted) {
  app.setEnvironment('repl')
}
```

## Version

You can access the application and framework versions using the `version` and `adonisVersion` properties.

The `version` property refers to the version inside your app's `package.json` file. The `adonisVersion` property refers to the installed version of the `@adonisjs/core` package.

```ts
import app from '@adonisjs/core/services/app'

console.log(app.version!.toString())
console.log(app.adonisVersion!.toString())
```

The version properties are represented as objects with the `major`, `minor`, and the `patch` sub-properties.

```ts
console.log(app.version!.major)
console.log(app.version!.minor)
console.log(app.version!.patch)
```

## Node environment

You can access the Node.js environment using the `nodeEnvironment` property. The value is a reference to the `NODE_ENV` environment variable. However, the value is further normalized to be consistent.

```ts
import app from '@adonisjs/core/services/app'

console.log(app.nodeEnvironment)
```

| NODE_ENV | Normalized to |
|------------|----------------|
| dev | development |
| develop | development |
| stage | staging |
| prod | production |
| testing | test |

Also, you can use the following properties as a shorthand to know the current environment.

- `inProduction`: Check if the application is running in the production environment.
- `inDev`: Check if the application is running in the development environment.
- `inTest`: Check if the application is running in the test environment.

```ts
import app from '@adonisjs/core/services/app'

// Is in production
app.inProduction
app.nodeEnvironment === 'production'

// Is in development
app.inDev
app.nodeEnvironment === 'development'

// Is in the test
app.inTest
app.nodeEnvironment === 'test'
```

## State

The state refers to the current state of the application. The framework features you can access significantly depend upon the current state of the application. For example, you cannot access the [container bindings]() or [container services]() until the app is in a `booted` state.

The application is always in one of the following known states.

- `created`: It is the default state of the application.
- `initiated`: In this state, we parse/validate the environment variables, process the `.adonisrc.json` file, import the config files, and so on.
- `booted`: The application service providers are registered and booted at this state.
- `ready`: The ready state varies between different environments. For example, in the `web` environment, the ready state means the application is ready to accept new HTTP requests.
- `terminated`: The application has been terminated, and the process will exit shortly. The application will not accept any new HTTP requests in the `web` environment.

```ts
import app from '@adonisjs/core/services/app'

console.log(app.getState())
```

You can also use the following shorthand properties to know whether the application is in a given state.

```ts
import app from '@adonisjs/core/services/app'

// App is booted
app.isBooted
app.getState() !== 'created' && app.getState() !== 'initiated'

// App is ready
app.isReady
app.getState() === 'ready'

// gracefully attempting to terminate the app
app.isTerminating

// App has been terminated
app.isTerminated
app.getState() === 'terminated'
```

## Listening for process signals

You can listen for [POSIX signals](https://man7.org/linux/man-pages/man7/signal.7.html) using the `app.listen`, or `app.listenOnce` methods. Under the hood, we register the listener with the Node.js `process` object.

```ts
import app from '@adonisjs/core/services/app'

// Listen for a SIGTERM signal
app.listen('SIGTERM', () => {
})

// Listen once for a SIGTERM signal
app.listenOnce('SIGTERM', () => {
})
```

At times, you might want to register the listeners conditionally. For example, listen to the `SIGINT` signal when running inside the pm2 environment.

You can use the `listenIf` or `listenOnceIf` methods to register a listener conditionally. The listener is only registered when the value of the first argument is truthy.

```ts
import app from '@adonisjs/core/services/app'

app.listenIf(app.managedByPm2, 'SIGTERM', () => {
})

app.listenOnceIf(app.managedByPm2, 'SIGTERM', () => {
})
```

## Notifying parent process

If your application starts as a child process, you can send messages to the parent process using the `app.notify` method. Under the hood, we use the `process.send` method.

```ts
import app from '@adonisjs/core/services/app'

app.notify('ready')

app.notify({
  isReady: true,
  port: 3333,
  host: 'localhost'
})
```

## Making URLs and paths to project files

Instead of self-constructing absolute URLs or paths to project files, we highly recommend using the following helpers.

### makeURL(...paths: string[])

The make URL method returns a file URL to a given file or directory within the project root. You must always generate a URL when planning to import a file.

```ts
import app from '@adonisjs/core/services/app'

const files = [
  './tests/welcome.spec.ts',
  './tests/maths.spec.ts'
]

await Promise.all(files.map((file) => {
  return import(app.makeURL(file).href)
}))
```

### makePath(...paths: string[])

The `makePath` method returns an absolute path to a given file or directory within the project root.

```ts
import app from '@adonisjs/core/services/app'

app.makePath('app/middleware/auth.ts')
```

### All other methods

| Method | Returned path |
|--------|----------------|
| `configPath('shield.ts')` | `/root/config/shield.ts` |
| `publicPath('style.css')` | `/root/public/style.css` |
| `providersPath('app_provider.ts')` | `/root/providers/app_provider.ts` |
| `factoriesPath('user.ts')` | `/root/database/factories/user.ts` |
| `migrationsPath('users.ts')` | `/root/database/migrations/users.ts` |
| `seedersPath('users.ts')` | `/root/database/seeders/users.ts` |
| `languageFilesPath('en/messages.json')` | `/root/resources/lang/en/messages.json` |
| `viewsPath('welcome.edge')` | `/root/resources/views/welcome.edge` |
| `startPath('routes.ts')` | `/root/start/routes.ts` |
| `tmpPath('logs/mails.txt')` | `/root/tmp/logs/mails.txt` |
| `contractsPath('auth.ts')` | `/root/types/auth.ts` |
| `httpControllersPath('users_controller.ts')` | `/root/app/controllers/users_controller.ts` |
| `modelsPath('user.ts')` | `/root/app/models/user.ts` |
| `servicesPath('user.ts')` | `/root/app/services/user.ts` |
| `exceptionsPath('handler.ts')` | `/root/app/exceptions/handler.ts` |
| `mailersPath('verify_email.ts')` | `/root/app/mailers/verify_email.ts` |
| `middlewarePath('auth.ts')` | `/root/app/middleware/auth.ts` |
| `policiesPath('posts.ts')` | `/root/app/polices/posts.ts` |
| `validatorsPath('create_user.ts')` | `/root/app/validators/create_user.ts` |
| `commandsPath('greet.ts')` | `/root/commands/greet.ts` |
