In this guide, we will learn how AdonisJS boots your application and what lifecycle hooks you can use to change the application state before it is considered ready.

The lifecycle of an application greatly depends upon the environment in which it is running. For example, a long-lived process started to serve HTTP requests is managed differently from a short-lived ace command.

So let's understand the application lifecycle for every supported environment.

## The boot phase

The boot phase remains the same for all the environments except the `console` environment. In `console` environment the executed command decides whether to boot the application or not.

You cannot use the container bindings and services until the application is booted.

![](assets/images/boot-phase-flow-chart.png)

## The start phase

The start phase varies between the `web`, `console`, and the `test` environment.

![](assets/images/start-phase-flow-chart.png)

### During the web environment

In the web environment, we create a long-lived HTTP connection to listen for incoming requests, and the application stays in the `ready` state until the server crashes or the process receives a signal to shut down.

### During the test environment

In the test environment, the **pre-start** and the **post-start** actions are executed together. Post that, we import the test files and execute the tests.

### During the console environment

In the `console` environment, the executed command decides whether to start the application.

A command can start the application by enabling the `settings.startApp` flag. As a result, the **pre-start** and the **post-start** actions will run before the command's `run` method.

```ts
import { BaseCommand } from '@adonisjs/core/ace'

export default class GreetCommand extends BaseCommand {
  static settings = {
    startApp: true
  }
  
  async run() {
    console.log(this.app.isStarted) // true
  }
}
```

## The termination phase

The termination of the application varies greatly between short-lived and the long-lived processes. 

A short-lived command or the tests process begins the termination as soon as the main operation ends.

Whereas, a long lived HTTP server process waits for the exit signals like `SIGTERM` to begin the termination process.

![](termination-phase-flow-chart.png)

### Responding to process signals

We begin the graceful shutdown process in all environments when the process receives a `SIGTERM` signal. We also listen for the `SIGINT` event when the application is managed by [pm2](https://pm2.keymetrics.io/docs/usage/signals-clean-restart/).

### During the web environment

In the web environment, we forcefully kill the application when the underlying HTTP server crashes.

### During the tests environment

The gracefully termination begins after all the tests have been executed.

### During the console environment

In the `console` environment the termination of the app depends on the executed command.

The app will terminate as soon as the command is executed, unless the `settings.staysAlive` flag is enabled and in this case the command should explicitly terminate the app.

```ts
import { BaseCommand } from '@adonisjs/core/ace'

export default class GreetCommand extends BaseCommand {
  static settings = {
    startApp: true,
    staysAlive: true,
  }
  
  async run() {
    await runSomeProcess()
    
    // Terminate the process
    await this.kernel.terminate()
  }
}
```

Commands can also disable automatic signals handling by enabling the `settings.handlesSignalFlags` flag.

```ts
import { BaseCommand } from '@adonisjs/core/ace'

export default class GreetCommand extends BaseCommand {
  static settings = {
    startApp: true,
    staysAlive: true,
    handlesSignalFlags: true,
  }
  
  #listenForSignals() {
    this.app.listen('SIGTERM', () => {
      this.kernel.terminate()
    })
  }
  
  async run() {
    this.#listenForSignals()

    await runSomeProcess()
  }
}
```

## Lifecycle hooks

Lifecycle hooks allow you to hook into the application bootstrap process and perform actions as the app goes through different states.

You can listen for hooks using the service provider classes or define them inline on the application class.

### Inline callbacks

You should register lifecycle hooks as soon as an application instance is created. 

The entry points `server.ts`, `ace.js`, and `test.ts` all create a fresh application instance for different environments, and you can register inline callbacks within these files.

```ts
const app = new Application(new URL('./', import.meta.url))

// highlight-start
app.booted(() => {
  console.log('invoked after the app is booted')
})

app.ready(() => {
  console.log('invoked after the app is ready')
})

app.terminating(() => {
  console.log('invoked before the terminate starts')
})
// highlight-end

await app.init()
await app.boot()
// ...
```

- `booted`: The booted hook is invoked after all the service providers have been registered and booted.
- `ready`: The started hook is invoked after the application is ready.
- `terminating`: The terminating hook is invoked once the graceful exit process begins. For example, you can use this hook to close database connections or end opened streams.

### Using service providers

Services providers defines the lifecycle hooks as methods in the provider class. We recommend using service providers over inline callbacks, as they keep everything neatly organized.

Following is the list of available lifecycle methods.

```ts
import { Application } from '@adonisjs/core/app'

export default class AppProvider {
  constructor(protected app: Application) {}
  
  register() {
  }
  
  async boot() {
  }
  
  async start() {
  }
  
  async ready() {
  }
  
  async shutdown() {
  }
}
```

- `register`: The register method registers bindings within the container. This method is synchronous by design.
- `boot`: The boot method is used to boot or initialize the bindings you have registered inside the container.
- `start`: The start method runs just before the `ready` method. It allows you to perform actions that the `ready` hook actions might need.
- `ready`: The ready method runs after the application is considered ready.
- `shutdown`: The shutdown method is invoked when the application begins the graceful shutdown. You can use this method to close database connections, or end opened streams.
