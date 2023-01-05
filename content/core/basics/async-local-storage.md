As per the [Node.js official documentation](https://nodejs.org/docs/latest-v14.x/api/async_hooks.html): "AsyncLocalStorage is used to create asynchronous state within callbacks and promise chains. **It allows storing data throughout the lifetime of a web request or any other asynchronous duration. It is similar to thread-local storage in other languages**."

To simplify the explanation further, AsyncLocalStorage allows you to store a state when executing an async function and then make it available to all the code paths within that function. For example:

:::note
The following is an imaginary example. However, you can still follow along by creating an empty Node.js project.
:::

Let's create an instance of `AsyncLocalStorage` and export it from its module. This will allow multiple modules to access the same storage instance.

```ts
// title: storage.ts
import { AsyncLocalStorage } from 'async_hooks'
export const storage = new AsyncLocalStorage()
```

Create the main file. It will use the `storage.run` method to execute an async function with the initial state.

```ts
// title: main.ts
// highlight-start
import { storage } from './storage'
// highlight-end
import ModuleA from './ModuleA'

async function run(id) {
  // highlight-start
  const state = { id }

  return storage.run(state, async () => {
    await (new ModuleA()).run()
  })
  // highlight-end
}

run(1)
run(2)
run(3)
```

Finally, `ModuleA` can access the state using the `storage.getStore()` method.

```ts
// title: ModuleA.ts
// highlight-start
import { storage } from './storage'
// highlight-end
import ModuleB from './ModuleB'

export default class ModuleA {
  public async run() {
    // highlight-start
    console.log(storage.getStore())
    await (new ModuleB()).run()
    // highlight-end
  }
}
```

Like `ModuleA`, `ModuleB` can also access the same state using the `storage.getStore` method. 

In other words, the entire chain of operations has access to the same state initially set inside the `main.js` file during the `storage.run` method call.

## What is the need for Async Local Storage?
Unlike other languages like PHP, Node.js is not a threaded language.

In PHP, every HTTP request creates a new thread, and each thread has its memory. This allows you to store the state into the global memory and access it anywhere inside your codebase.

In Node.js, you cannot save data to a global object and keep it isolated between HTTP requests. This is impossible because Node.js runs in a single thread and shares the memory across all the HTTP requests.

This is where Node.js gains a lot of performance, as it does not have to boot the application for every single HTTP request.

However, it also means that you have to pass the state around as function arguments or class arguments, since you cannot write it to the global object. Something like the following:

```ts
http.createServer((req, res) => {
  const state = { req, res }
  await (new ModuleA()).run(state)
})

// Module A
class ModuleA {
  public async run(state) {
    await (new ModuleB()).run(state)
  }
}
```

> Async Local storage addresses this use case, as it allows isolated state between multiple async operations.

## How does AdonisJS uses ALS?

ALS stands for **AsyncLocalStorage**. AdonisJS uses the async local storage during the HTTP requests and set the [HTTP context](../http/context.md) as the state. The code flow looks similar to the following.

```ts
storage.run(ctx, () => {
  await runMiddleware()
  await runRouteHandler()
  ctx.finish()
})
```

The middleware and the route handler usually run other operations as well. For example, using a model to fetch the users.

```ts
export default class UsersController {
  public index() {
    await User.all()
  }
}
```

The `User` model instances now have access to the context since they are created within the code path of the `storage.run` method.

```ts
// highlight-start
import HttpContext from '@ioc:Adonis/Core/HttpContext'
// highlight-end

export default class User extends BaseModel {
  public get isFollowing() {
    // highlight-start
    const ctx = HttpContext.get()!
    return this.id === ctx.auth.user.id
    // highlight-end
  }
}
```

The model static properties (not methods) cannot access the HTTP context as they are evaluated when importing the model. So you must understand the code execution path and [use ALS carefully](#things-to-be-aware-of-when-using-als).

## Usage
To use ALS within your apps, you must enable it first inside the `config/app.ts` file. Feel free to create the property manually if it doesn't exist.

```ts
// title: config/app.ts
export const http: ServerConfig = {
  useAsyncLocalStorage: true,
}
```

Once enabled, you can access the current HTTP context anywhere inside your codebase using the `HttpContext` module.

:::note
Ensure the code path is called during the HTTP request for the `ctx` to be available. Otherwise, it will be `null`.
:::

```ts
import HttpContext from '@ioc:Adonis/Core/HttpContext'

class SomeService {
  public async someOperation() {
    const ctx = HttpContext.get()
  }
}
```

## How should it be used?
At this point, you can consider Async Local Storage as a request-specific global state. [Global state or variables are generally considered bad](https://wiki.c2.com/?GlobalVariablesAreBad) as they make testing and debugging a lot harder.

Node.js Async Local Storage can get even trickier if you are not careful enough to access the local storage within the HTTP request.

We recommend you still write your code as you were writing earlier (passing `ctx` by reference), even if you have access to the Async Local Storage. Passing data by reference conveys a clear execution path and makes it easier to test your code in isolation.

### Then why have you introduced Async Local Storage?
Async Local Storage shines with APM tools, which collect performance metrics from your app to help you debug and pinpoint problems.

Before ALS, there was no simple way for APM tools to relate different resources with a given HTTP request. For example, It could show you how much time was taken to execute a given SQL query but could not tell you which HTTP request executed that query.

After ALS, now all this is possible without you have to touch a single line of code. **AdonisJS is going to use ALS to collect metrics using its application-level profiler**.

## Things to be aware of when using ALS
You are free to use ALS if you think it makes your code more straightforward and you prefer global access instead of passing everything by reference.

However, be aware of the following situations that can easily lead to memory leaks or unstable behavior of the program.

### Top-level access
Never access the Async Local Storage at the top level of any module. For example:

#### ❌ Does not work
In Node.js, the modules are cached. So `HttpContext.get()` method will be executed only once during the first HTTP request and holds its `ctx` forever during the lifecycle of your process.

```ts
import HttpContext from '@ioc:Adonis/Core/HttpContext'
const ctx = HttpContext.get()

export default class UsersController {
  public async index() {
    ctx.request
  }
}
```

#### ✅ Works

Instead, you should move the `.get` call to within the `index` method.

```ts
export default class UsersController {
  public async index() {
    const ctx = HttpContext.get()
  }
}
```

### Inside static properties
The static properties (not methods) of any class are evaluated as soon that module is imported, and hence you should not access the `ctx` within the static properties.

#### ❌ Does not work

In the following example, when you import the `User` model inside a controller, the `HttpContext.get()` code will be executed and cached forever. So either you will receive `null`, or you end up caching the tenant connection from the first request.

```ts
import HttpContext from '@ioc:Adonis/Core/HttpContext'

export default class User extends BaseModel {
  public static connection = HttpContext.get()!.tenant.connection
}
```

#### ✅ Works
Instead, you should move the `HttpContext.get` call to inside the `query` method.

```ts
import HttpContext from '@ioc:Adonis/Core/HttpContext'

export default class User extends BaseModel {
  public static query() {
    const ctx = HttpContext.get()!
    return super.query({ connection: tenant.connection })
  }
}
```

### Event handlers
The handler of an event emitted during an HTTP request can get access to the request context using `HttpContext.get()` method. For example:

```ts
export default class UsersController {
  public async index() {
    const user = await User.create({})
    Event.emit('new:user', user)
  }
}
```

```ts
// title: Event handler
import HttpContext from '@ioc:Adonis/Core/HttpContext'

Event.on('new:user', () => {
  const ctx = HttpContext.get()
})
```

However, you should be aware of a couple of things when accessing the context from an event handler.

- The event must never try to send a response using `ctx.response.send()` because this is not what events are meant to do.
- Accessing `ctx` inside an event handler makes it rely on HTTP requests. In other words, the event is not generic anymore and should always be emitted during an HTTP request to make it work.
