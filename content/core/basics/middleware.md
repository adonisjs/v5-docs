Middleware is a series of functions executed during an HTTP request before the request reaches the route handler. Every function in the chain can end the request or forward it to the next middleware.

A typical AdonisJS application uses middleware for **parsing request body**, **managing users sessions**, **authenticating requests**, **serving static assets**, etc.

You can also create custom middleware to perform additional tasks during an HTTP request.

## Middleware stacks

To give you better control over the execution of the middleware pipeline, AdonisJS split the middleware stack into three groups. They are called **Server middleware**, **Router/Global middleware**, and **Named middleware**.

### Server middleware stack

Server middleware runs on every HTTP request, even if you have not defined any route for the current request's URL. 

They are great for adding additional functionality to your app that does not rely on the routing system of the framework. For example, the Static assets middleware is registered as server middleware.


### Router middleware stack

Router middleware are also known as global middleware. They are executed on every HTTP request that has a matching route.

The Bodyparser, auth, and session middleware are registered under the router middleware stack.

### Named middleware collection

Named middleware are a collection of middleware that are not executed unless explicitly assigned to a route or a group.

Instead of defining middleware as an inline callback within the routes file, we recommend you create dedicated middleware classes, store them inside the named middleware collection and then assign them to the routes.

## Creating middleware

Middleware are stored inside the `./app/middleware` directory, and you can create a new middleware file by running the `make:middleware` ace command.

```sh
node ace make:middleware user_location
```

The above command will create the `user_location_middleware.ts` file under the middleware directory. 

A middleware is represented as a class with the `handle` method. During execution, AdonisJS will automatically call this method and give it the [HttpContext](./http-context.md) as the first argument.

```ts
// title: app/middleware/user_location_middleware.ts
import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

export default class UserLocationMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
  }
}
```

Within the `handle` method, a middleware has to decide whether to continue with the request, finish the request by sending a response or raise an exception to abort the request.


### Abort request

If a middleware raises an exception, all the upcoming middleware and the route handler will not be executed, and the exception will be given to the global exception handler.

```ts
import { HttpException } from '@adonisjs/core/http'

export default class UserLocationMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    throw new HttpException('Aborting request')
  }
}
```


### Continue with the request

You must call the `next` method to continue with the request. Otherwise, the rest of the actions inside the middleware stack will not be executed.

```ts
export default class UserLocationMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Call the `next` function to continue
    await next()      
  }
}
```

### Send a response, and do not call the next method

Finally, you can end the request by sending the response. In this case, do not call the `next` method.


```ts
export default class UserLocationMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // send response + do not call next
    ctx.response.send('Ending request')
  }
}
```

## Assigning middleware to middleware stacks

The middleware stacks are defined inside the `start/kernel.ts` file. Depending upon the nature of the middleware, you can assign it either to the [server middleware stack](#server-middleware-stack), [router middleware stack](#router-middleware-collection) or add it to the [named middleware collection](#named-middleware-collection).

The middleware are imported lazily using dynamic imports. For demonstration, we register the `UserLocationMiddleware` in all the stacks.

```ts
import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

/**
 * Server middleware stack
 */
server.use([
  () => import('#middleware/user_location_middleware')
])

/**
 * Router middleware stack
 */
router.use([
  () => import('#middleware/user_location_middleware')
])

/**
 * Named middleware collection
 */
export const middleware = router.named({
  userLocation: () => import('#middleware/user_location_middleware')
})
```

## Assigning middleware to routes and route groups

The named middleware collection is unused by default, and you must explicitly assign them to routes or the route groups.

In the following example, we first import the `middleware` collection and assign the `userLocation` middleware by calling it as a function.

```ts
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router
  .get('posts', () => {})
  .use(middleware.userLocation())
```

Multiple middleware can be applied either as an array or by calling the `use` method multiple times.

```ts
router
  .get('posts', () => {})
  .use([
    middleware.userLocation(),
    middleware.auth()
  ])
```

Similarly, you can assign middleware to a route group as well. The group middleware will be applied to all group routes automatically.

```ts
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.group(() => {

  router.get('posts', () => {})
  router.get('users', () => {})
  router.get('payments', () => {})

}).use(middleware.userLocation())
```

## Middleware parameters

Middleware registered under the named middleware collection can accept an additional parameter as part of the `handle` method arguments. For example, the `auth` middleware accepts the authentication guard as a configuration option.

```ts
type AuthGuards = 'web' | 'api'

export default class AuthMiddleware {
  async handle(ctx, next, options: { guard: AuthGuards }) {
  }
}
```

When assigning the middleware to the route, you can specify the guard to use.

```ts
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.get('payments', () => {}).use(
  middleware.auth({ guard: 'web' })
)
```

## Middleware execution flow

The middleware layer of AdonisJS is built on top of [Chain of Responsibility](https://refactoring.guru/design-patterns/chain-of-responsibility) design pattern. A middleware has two execution phases: the **downstream phase** and the **upstream phase**.

- The downstream phase is the block of code you write before calling the `next` method. In this phase, you handle the request.
- The upstream phase is the block of code you may write after calling the `next` method. In this phase, you can inspect the response or change it completely. 

![](./middleware-flow.jpeg)

## Dependency injection 

Middleware classes are instantiated using the [IoC container](../fundamentals/ioc-container.md); therefore, you can type-hint dependencies inside the middleware constructor, and the container will inject them for you.

Given you have a `GeoIpService` class to look up user location from the request IP, you can inject it into the middleware using the `@inject` decorator.

```ts
// title: app/services/geoip_service.ts
export default class GeoIpService {
  async lookup(ipAddress: string) {
    // lookup location and return
  }
}
```

```ts
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'
import GeoIpService from '#services/geoip_service'

@inject()
export default class UserLocationMiddleware {
  constructor(protected geoIpService: GeoIpService) {
  }

  async handle(ctx: HttpContext, next: NextFn) {
    const ip = ctx.request.ip()
    ctx.location = await this.geoIpService.lookup(ip)
  }
}
```

## Middleware and exception handling

AdonisJS automatically captures the exception raised by the middleware pipeline or the route handler and converts it into an HTTP response using the [global exception handler](./exception-handling.md).

As a result, you do not have to wrap the `next` function calls inside a `try/catch` statement. Instead, the automatic exception handling ensures that the upstream logic of middleware is always executed after the `next` function call.

## Mutating response from a middleware

The upstream phase of middleware can mutate the response body, headers, and status code. Doing so will discard the old response set by the route handler or any other middleware.

Before mutating the response, you must ensure you are dealing with the correct response type. Following is the list of response types that can exist on the `Response` class.

- **Standard response** refers to sending data values directly using the `response.send` method. Its value might be an `Array`, `Object`, `String`, `Boolean`, or `Buffer`.
- **Streaming response** refers to piping a stream to the response socket using the `response.stream` method. 
- **File download response** refers to downloading a file using the `response.download` method.

You will/will not have access to specific response properties based on the kind of response.

### Dealing with a standard response

When mutating a standard response, you can access it using the `response.content` property. Make sure to first check if the `content` exists or not.

```ts
import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

export default class {
  async handle({ response }: HttpContext, next: NextFn) {
    await next()
    
    if (response.hasContent) {
      console.log(response.content)
      console.log(typeof response.content)
      
      response.send(newResponse)
    }
  }
}
```

### Dealing with a streaming response

NEED TO RETHINK

The stream is piped to the outgoing [HTTP response](https://nodejs.org/api/http.html#class-httpserverresponse) after all the middleware has been executed. So technically, you can replace the existing stream with a new stream or monitor the stream.

```ts
import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

export default class {
  async handle({ response }: HttpContext, next: NextFn) {
    await next()
    
    if (response.hasStream) {
      console.log(response.)
      console.log(typeof response.content)
      
      response.send(newResponse)
    }
  }
}
```
