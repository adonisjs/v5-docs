---
summary: An introduction to the HTTP middleware pipeline. AdonisJS divides middleware into route middleware and global middleware.
---

Middleware are a series of functions that are executed during an HTTP request before it reaches the route handler. Every function in the chain has the ability to end the request or forward it to the `next` function.

## Basic Example

The simplest way to test a middleware is to attach it to the route using the `Route.middleware` method. For example:

```ts
Route
  .get('/users/:id', async () => {
    return 'Show user'
  })
  // highlight-start
  .middleware(async (ctx, next) => {
    console.log(`Inside middleware ${ctx.request.url()}`)
    await next()
  })
  // highlight-end
```

::video{url="https://res.cloudinary.com/adonis-js/video/upload/f_auto,q_auto/v1610089298/v5/route-middleware.mp4" controls}

## Middleware classes

Writing middleware as inline functions is fine for some quick testing. However, we recommend extracting the middleware logic to its own file.

You can create a new middleware by running the following Ace command.

```sh
node ace make:middleware LogRequest

# CREATE: app/Middleware/LogRequest.ts
```

### About middleware class

Middleware classes are stored (but not limited to) inside the `app/Middleware` directory and each file represents a single middleware.

Every middleware class must implement the `handle` method to handle the HTTP request and call the `next` method to forward the request to the next middleware or the route handler.

```ts
// title: app/Middleware/LogRequest.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LogRequest {
  public async handle(
    { request }: HttpContextContract,
    next: () => Promise<void>
  ) {
    console.log(`-> ${request.method()}: ${request.url()}`)
    await next()
  }
}
```

Also, you can terminate requests from the middleware by raising an exception or sending the response using the `response.send` method. 

:::note

Make sure you do NOT call the `next` method when decided to end the request.

:::

```ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Auth {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    if (notAuthenticated) {
      response.unauthorized({ error: 'Must be logged in' })
      return
    }

    await next()
  }
}
```

## Registering middleware

For the middleware to take effect, it must be registered as a **global middleware** or a **named middleware** inside the `start/kernel.ts` file.

### Global middleware

Global middleware are executed for all the HTTP requests in the same sequence as they are registered.

You register them as an array inside the `start/kernel.ts` file, as shown below:

```ts
// title: start/kernel.ts
Server.middleware.register([
  () => import('@ioc:Adonis/Core/BodyParser'),
  // highlight-start
  () => import('App/Middleware/LogRequest')
  // highlight-end
])
```

### Named middleware

Named middleware allows you to selectively apply middleware on your routes/group of routes. You begin by registering them with a unique name and later reference it on the route by that name.

```ts
// title: start/kernel.ts
Server.middleware.registerNamed({
  auth: () => import('App/Middleware/Auth')
})
```

Now, you can attach the `auth` middleware to a route as shown in the following example.

```ts
Route
  .get('dashboard', 'DashboardController.index')
  .middleware('auth') // 👈
```

The middleware can be applied to one or multiple actions for resource routes. Learn more about [applying middleware to resourceful routes](./controllers.md#applying-middleware).

You can also define multiple middleware on a route by passing them as an array or calling the middleware method multiple times.

```ts
Route
  .get('dashboard', 'DashboardController.index')
  .middleware(['auth', 'acl', 'throttle'])
```

```ts
Route
  .get('dashboard', 'DashboardController.index')
  .middleware('auth')
  .middleware('acl')
  .middleware('throttle')
```


## Passing config to named middleware

Named middleware can also accept runtime config through the `handle` method as the third argument. For example:

```ts
export default class Auth {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>,
    // highlight-start
    guards?: string[]
    // highlight-end
  ) {
    await next()
  }
}
```

In the above example, the Auth middleware accepts an optional `guards` array. The user of the middleware can pass the guards as follows:

```ts
Route
  .get('dashboard', 'DashboardController.index')
  .middleware('auth:web,api')
```

## FAQs

<details>
<summary> How to disable middleware on a given HTTP request? </summary>
  
You cannot disable middleware for a given HTTP request. However, the middleware can accept the runtime config to ignore certain requests. 

A great example of this is the bodyparser middleware. It [ignores all the requests not matching the whitelisted](https://github.com/adonisjs/bodyparser/blob/develop/src/BodyParser/index.ts#L108-L111) methods inside the `config/bodyparser.ts` file.

</details>

<details>
<summary> Are middleware executed on requests with no routes? </summary>
  
AdonisJS does not execute the middleware chain, if there is no registered route for the current HTTP request.

</details>
