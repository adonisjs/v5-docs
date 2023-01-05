Services providers are plain JavaScript classes with lifecycle methods to perform actions during different phases of the application.

A service provider can register [bindings into the container](), [extend existing bindings](), [run actions after the HTTP server starts](), or [add custom methods to the REPL]().

You can think of Service providers as the entry point to an AdonisJS application with the ability to modify the application state before it is considered ready.

The providers are registered inside the `.adonisrc.json` file under the `providers` array. The value is a path to a module that can be resolved using `import.meta.resolve` method.

```json
{
  "providers": [
    "@adonisjs/core/providers/app_provider",
    "#providers/app_provider"
  ]
}
```

By default, a provider is loaded in all the runtime environments. However, you can also limit the provider to run under certain environments only.

```json
{
  "providers": [
    "@adonisjs/core/providers/app_provider",
    {
      "file": "#providers/app_provider",
      "environments": ["web", "repl"]
    }
  ]
}
```

## Writing service providers

You can create a service provider inside the `providers` directory within your application or package. 

The provider module must have a `export default` returning the provider class. The class constructor receives an instance of the [Application]() class.

```ts
import { Application } from '@adonisjs/core/app'

export default class AppProvider {
  constructor(protected app: Application) {
  }
}
```

Following are the lifecycle methods you can implement to perform different actions.

```ts
export default class AppProvider {
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

### register

The `register` method is called right after an instance of the provider class is created. You can use the `register` method to register bindings within the IoC container. 

The `register` is synchronous, so cannot use Promises inside this method.

```ts
export default class AppProvider {
  register() {
    this.app.container.bind('db', () => {
      return new Database()
    })
  }
}
```

### boot

The `boot` method is called after all the bindings have been registered to the IoC container. Inside this method, you can resolve bindings from the container to extend/mutate them.

```ts
export default class AppProvider {
  async boot() {
   const validator = await this.app.container.make('adonisjs/validator')
    
   // Add custom validation rules
   validator.rule('foo', () => {})
  }
}
```

When extending bindings, it is a good practice to only extend them when they are resolved from the container.


:::caption(Avoid eagerly resolving bindings){for="error"}

In the following example, we are eagerly resolving `validator` from the container regardless of whether is ever used in the application.


:::


```ts
async boot() {
  const validator = await this.app.container.make('validator')
}
```


:::caption(Listen for resolving hook){for="success"}

Instead, you must listen for the `resolving` lifecycle hook.

:::


```ts
async boot() {
  this.app.container.resolving('validator', (validator) => {
    validator.rule('foo', () => {})
  })
}
```

### start

The `start` method is after the `boot` and before the `ready ` method. It allows you to perform actions that the `ready` hook actions might need.

### ready

The `ready` method gets called at different stages based upon the environment of the application.

<table>
    <tr>
        <td width="100">`web`</td>
        <td>The `ready` method is called after the HTTP server has been started and ready to accept requests.</td>
    </tr>
    <tr>
        <td width="100">`console`</td>
        <td>The `ready` method is called just before the `run` method of the main command.</td>
    </tr>
    <tr>
        <td width="100">`test`</td>
        <td>The `ready` method is called just before running all the tests. However, the test files are imported before the `ready` method.</td>
    </tr>
    <tr>
        <td width="100">`repl`</td>
        <td>The `ready` method is called just before the REPL prompt is displayed on the terminal.</td>
    </tr>
</table>

```ts
export default class AppProvider {
  async start() {
    if (this.app.environment === 'web') {
    }

    if (this.app.environment === 'console') {
    }

    if (this.app.environment === 'test') {
    }

    if (this.app.environment === 'repl') {
    }
  }
}
```

### shutdown

The `shutdown` method is called when AdonisJS is in the middle of gracefully exiting the application.

The event to exit the application largely depends upon the environment in which the app is running and how the application process got started. Please read the application lifecycle guide to know more about it.

```ts
export default class AppProvider {
  async shutdown() {
    // perform cleanup
  }
}
```
