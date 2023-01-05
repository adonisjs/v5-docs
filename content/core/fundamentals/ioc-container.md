At the heart of every AdonisJS application is an IoC container to automatically resolve dependencies without manually constructing individual classes.

The IoC container in an AdonisJS app serves two primary use cases.

- Exposing API for first and third-party packages to register and resolve bindings from the container (More on bindings later).
- Automatically resolve and inject dependencies to a class constructor or class methods.

## Injecting dependencies

Let's start with automatically injecting dependencies to a class using the container. With the help of [TypeScript decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) and [Reflection metadata](https://www.npmjs.com/package/reflect-metadata), we can inspect the dependencies of a class with zero config.

### Step 1. Create the Service class
Start by creating a new Service class inside the `app/services` folder.

```ts
// title: app/services/echo.ts
export default class Echo {
  respond() {
    return 'hello'
  }
}
```

### Step 2. Inject the service inside the controller

Create a new HTTP controller inside the `app/controllers` folder. Alternatively, you can use the `node ace make:controller home` command.

Notice the use of `@inject` decorator in the following example. The decorator is needed to inspect the class dependencies and inject them at the time of constructing the class.

```ts
// title: app/controllers/home_controller.ts
import Echo from '#services/echo'
import { inject } from '@adonisjs/core'

@inject()
export default class HomeController {
  constructor(protected echo: Echo) {
  }
  
  handle() {
    return this.echo.respond()
  }
}
```

That is all!

If you bind this controller to a route and make an HTTP request, the `HomeController` will receive an instance of the `Echo` class constructed behind the scenes using the container.

## Adding dependencies to the Echo class

Right now, the `Echo` class is very simple, and using a container to create an instance of it might seem overkill.

So, let's make things a little bit complicated and accept an instance of `HttpContext` inside the `Echo` class constructor.

```ts
// title: app/services/echo.ts
// insert-start
import { HttpContext, inject } from '@adonisjs/core'
// insert-end

// insert-start
@inject()
// insert-end
export default class Echo {
  // insert-start
  constructor(protected ctx: HttpContext) {
  }
  // insert-end

  respond() {
    return `Hello from ${this.ctx.request.url()}`
  }
}
```

Again, we have to use the `@inject` decorator to know which dependencies to inject inside the `Echo` class constructor.

Now, without changing a single line of code inside your controller, you can re-run the code and the `Echo` class will receive an instance of the `HttpContext` class.


:::bingo

The great thing about using the container is that you can have deeply nested dependencies, and the container can resolve the entire tree for you. The only deal is to use Dependency Injection and the `@inject` to collect the metadata about the required dependencies.


:::

## Using method injection

Currently, we are injecting an instance of the `Echo` class inside the controller constructor. However, not all the methods on the `HomeController` class may need the `echo` object.

So, let's move our dependency from the constructor to the `handle` method. Re-open the controller file and make the following modifications to it.

```ts
// title: app/controllers/home_controller.ts
import Echo from '#services/echo'
import { inject } from '@adonisjs/core'

// delete-start
@inject()
// delete-end
export default class HomeController {
  // delete-start
  constructor(private echo: Echo) {
  }
  // delete-end
  
  // insert-start
  @inject()
  handle(_, echo: Echo) {
    return echo.respond()
  }
  // insert-end
}
```

That is all you have to do. Move the `@inject` decorator from the class `constructor` to the `handle` method and type-hint the dependencies you want to inject.

## Using the container directly

Most of the classes within your AdonisJS application like **Controllers,** **Middleware**, **Ace commands**, **Event listeners**, **Validator classes**, and **Mailers** are constructed using the container and therefore you can leverage the `@inject` decorator for automatic dependency injection.

However, you can also use the container API directly for situations where you want to manually constructor a class and have similar DI behaviour.

In the following example, instead of calling `new SomeService()`, we will use the `container.make` method.

```ts
import { inject } from '@adonisjs/core'
import app from '@adonisjs/core/services/app'

class Echo {}

@inject()
class SomeService {
  constructor(public echo: Echo) {}
}

/**
 * Same as making a new instance of the class, but
 * will have the benefit of automatic DI
 */
const service = await app.container.make(SomeService)

console.log(service instanceof SomeService)
console.log(service.echo instanceof Echo)
```

To automatically inject dependencies inside a method, you can use the `container.call` method.

```ts
class Echo {}

class SomeService {
  @inject()
  run(echo: Echo) {
  }
}

const service = await app.container.make(SomeService)

/**
 * An instance of Echo class will get passed
 * the run method
 */
await app.container.call(service, 'run')
```

**Conclusion**

- You can inject dependencies to a class constructor or a method, and the container will resolve/inject them for you.
- For Reflection to work, you must use the `@inject` decorator.
- There is no 3rd point.

We have kept the API for dependency resolution simple and easy to work with. Moreover, it is optional to use Dependency injection and the container.

## When to use Dependency Injection

Usually, it is a good practice to leverage dependency injection for the following reasons.

- It is easy to test your classes, since you can swap the class dependencies during testing.
- If a class constructor or method starts to accept too many dependencies, then you a receive visual feedback that the given class has too many responsibilities.
- Finally, if the class dependencies has sub-dependencies, then you do not have construct those dependencies inline. They can be constructed somewhere else and then injected into the class.

However, you also have to careful and not take the idea too far, that it starts to loose its benefits. A certain type of dependencies can be just imported directly. For example:

- It is okay to import `lodash` or any other helpers library directly vs accepting them as constructor dependencies.
- Same is true for framework's static services like the `router` service, or the `drive` service. You can just import them directly and interact with their APIs.

## Container bindings

Container bindings are one of the primary reasons for the Container to exist in AdonisJS. They act as a bridge between the packages you install and your application.

Usually, the container bindings are registered within the Service providers, so the following examples will assume that you are inside a Service provider.

```ts
import { Application } from '@adonisjs/core/app'

export default class MyAwesomePackageProvider {
  constructor(protected app: Application) {
  }

  register() {
    this.app.container.bind('db', async (resolver) => {
      const config = await resolver.make('config')

      return new Database(config.get('database'))
    })
  }
}
```

:::note

The binding name can be a `string`, a `symbol` or reference to a class constructor.

:::

You can register a binding using the `container.bind` method. It accepts a unique name for the binding and a factory function responsible for constructing the return value.

Once, a binding is inside the container. Any part of your application (including the packages) can ask the container for its value by calling the `container.make` method.

So, for example, if the `db` binding needs the encryption library to encrypt data, then it can simply ask for it from the container.

```ts
this.app.container.bind('db', async (resolver) => {
  const config = await resolver.make('config')
  // insert-start
  const encryption = await resolver.make('encryption')
  // insert-end

  return new Database(
    config.get('database'),
    // insert-start
    encryption
    // insert-end
  )
})
```

### Singletons

Singletons are bindings for which the factory function is called only once and then the return value is cached for the lifetime of the application

You can register a singleton binding using the `container.singleton` method.

```ts
this.app.container.singleton('db', async (resolver) => {
  const config = await resolver.make('config')
  const encryption = await resolver.make('encryption')

  return new Database(config.get('database'), encryption)
})
```

### Binding values

Similar to singletons, you can also register raw values inside the container as well.

```ts
const database = new Database(config, encryption)
this.app.container.bindValue('db', database)
```

### Resolve bindings

You can resolve bindings from the container by calling the `container.make` method. Just make sure you call this method after the application has been booted.

If you are inside a Service provider and need access to a binding, then write that code inside the `boot`, `start`, or the `ready` method.

Within your application codebase, you can grab the container instance from the `app` service.

```ts
import app from '@adonisjs/core/services/app'

const drive = await app.container.make('drive')
```

## Swapping implementations

When you rely on the container to resolve a tree of dependencies, you have less/no control over some of the classes in that tree. Therefore, mocking/faking those classes can become harder.

In the following example, the `UsersController.index` method accepts an instance of the `UserService` class.

```ts
import UserService from '#services/user_service'
import { inject } from '@adonisjs/core'

export default class UsersController {
  @inject()
  index(, service: UserService) {}
}
```

When writing tests, you will be interacting with the `UsersController` over an HTTP request. Since, you are not in the control of creating an instance of the controller, you cannot inject a dummy service to it.

To make things easier, container allows you to fake dependencies using the `container.swap` method.

```ts
import UserService from '#services/user_service'
import app from '@adonisjs/core/services/app'

test('get all users', async ({ client }) => {
  class FakeService extends UserService {
    all() {
      return [{ id: 1, username: 'virk' }]
    }
  }
    
  app.container.swap(UserService, () => {
    return new FakeService()
  })
    
  const response = await client.get('users')
  response.assertBody({
    data: [{ id: 1, username: 'virk' }]
  })
})
```

The `container.swap` method accepts the class constructor that you want to swap, followed by a factory function to return an alternative implementation.

To restore the original implementation, you must call the `container.restore` method.

```ts
app.container.restore(UserService)

// Restore all
app.container.restore()
```

## Container hooks

The container has a single `resolving` hook that you can use to modify/extend the return value of a given binding/class. 

Usually, you will be using hooks inside a service provider when trying to extend a particular binding. For example, the Database provider uses the `resolving` hook to register additional database driven validation rules.

```ts
import { Application } from '@adonisjs/core/app'

class DatabaseProvider {
  constructor(protected app: Application) {
  }

  boot() {
    this.app.container.resolving('validator', (validator) => {
      validator.rule('unique', implementation)
      validator.rule('exists', implementation)
    })
  }
}
```

## Container events

The container emits the `container:resolve` event that you can listen for to observe the bindings as they get resolved.

```ts
import event from '@adonisjs/core/services/event'

event.on('container:resolve', ({ binding, value }) => {
  console.log({ binding, value })
})
```

## See also

- [The container README file](https://github.com/adonisjs/fold/tree/next) covers the container API in the framework agnostic manner.
- [Why you need an IoC container?](https://github.com/thetutlage/meta/discussions/4) In this article, the creator of the framework shares his reasoning for using the IoC container.
