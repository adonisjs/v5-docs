---
summary: HTTP request context holds all the relevant information related to a given HTTP request.
---

HTTP context is a request-specific object that holds the information like the `request body`, `cookies`, `headers`, the currently `logged in user`, and much more for a given HTTP request.

The HTTP context is passed by reference to the route handler, middleware, HTTP hooks, and the exception handler.

```ts
Route.get('/', ({ request, auth, response }) => {
  /**
   * Request url
   */
  console.log(request.url())

  /**
   * Request body + query params
   */
  console.log(request.all())

  /**
   * Send response
   */
  response.send('hello world')
  response.send({ hello: 'world' })

  /**
   * Available when auth is configured
   */
  console.log(auth.user)
})
```

Make sure to define the HTTP context type explicitly when accessing the context inside a controller method.

```ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

class HomeController {
  public async index({ request, response }: HttpContextContract) {

  }
}
```

## Differences from the express `req` and `res` objects?

You will not see any `req` or `res` objects in AdonisJS. Everything, including the request and the response is part of the HTTP context.

Also, you are encouraged to add your custom properties to the `ctx` object and NOT to the `request` object.

## Http Context Properties

Following is the list of properties available on the HTTP context. As you will install new packages, they may also add more properties to this object.

![Output of ctx.inspect({ depth: 0 })](https://res.cloudinary.com/adonis-js/image/upload/f_auto,q_auto/v1609928565/v5/context-inspect.png)

### request

Reference to the [HTTP request](./request.md)

```ts
Route.get('/', async ({ request }) => {})
```

---

### response

Reference to the [HTTP response](./response.md)

```ts
Route.get('/', async ({ response }) => {})
```

---

### logger

Reference to the logger instance. A [child logger](../digging-deeper/logger.md#child_logger) instance with a unique [request id](./request.md#request-id) is created for every HTTP request.

```ts
Route.get('/', async ({ logger }) => {})
```

---

### route

Reference to the matched route for the current HTTP request. The route object has the following properties.

- `pattern`: The route pattern
- `handler`: The route handler
- `middleware`: An array of route middleware
- `name`: Route name (if any)

```ts
Route.get('/', async ({ route }) => {})
```

---

### params

An object of route params.

```ts
Route.get('users/:id', async ({ params }) => {
  console.log(params.id)
})
```

---

### subdomains

An object of route subdomains. Only available when the route is registered with a domain.

```ts
Route.group(() => {
  Route.get('/', async ({ subdomains }) => {
    console.log(subdomains.tenant)
  })
}).domain(':tenant.adonisjs.com')
```

---

### session

Reference to the [session object](./session.md). Available only when `@adonisjs/session` package is installed.

```ts
Route.get('/', async ({ session }) => {
  session.get('cart_value')
})
```

---

### auth

Reference to the [auth object](../auth/introduction.md). Available only when `@adonisjs/auth` package is installed.

```ts
Route.get('/', async ({ auth }) => {
  console.log(auth.user)
})
```

---

### view

Reference to the [view renderer object](../views/introduction.md). Available only when `@adonisjs/view` package is installed.

```ts
Route.get('/', async ({ view }) => {
  return view.render('welcome')
})
```

---

### ally

Reference to the [ally object](../auth/social.md). Available only when `@adonisjs/ally` package is installed.

```ts
Route.get('/', async ({ ally }) => {
  return ally.use('github').redirect()
})
```

---

### bouncer

Reference to the [bouncer object](../digging-deeper/authorization.md). Available only when `@adonisjs/bouncer` package is installed.

```ts
Route.get('/', async ({ bouncer }) => {
  await bouncer.authorize('viewPost', post)
})
```

## Extending Context

The HTTP context object is meant to be extended by other packages or your own application code. A common use case is to attach custom properties inside a middleware. For example:

```ts
// highlight-start
import geoip from 'geoip-lite'
// highlight-end
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UserLocationMiddleware {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    // highlight-start
    ctx.location = geoip.lookup(ctx.request.ip())
    // highlight-end
    await next()
  }
}
```

Here we have added a custom `location` property to the `ctx`, which you can access inside the route handler or the upcoming middleware.

### Informing typescript about the custom property

The `location` property is added at the runtime; hence TypeScript does not know about it. To inform the TypeScript, we will use [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces) and add the property to the `HttpContextContract` interface.

Create a new file at path `contracts/context.ts` (the filename is not important) and paste the following contents inside it.

```ts
// title: contracts/context.ts
declare module '@ioc:Adonis/Core/HttpContext' {
  import { Lookup } from 'geoip-lite'

  interface HttpContextContract {
    location: Lookup | null
  }
}
```

That's all! Now, TypeScript will not complain about the missing property on the `ctx` object.

### Using getters and macros

You can also use getters and macros for adding custom properties to the `ctx` object. In the previous example, we added an **instance property** to the `ctx` object. However, getters and macros add the property on the **prototype of the class**.

Also, there is no need to create a middleware this time since you need to define the macros/getters only once, and they are available for all the instances of the HttpContext class.

Open the pre-existing `providers/AppProvider.ts` file and paste the following code inside the `boot` method.

```ts
// highlight-start
import geoip from 'geoip-lite'
// highlight-end
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  public static needsApplication = true

  constructor(protected app: ApplicationContract) {}

  // highlight-start
  public async boot() {
    const HttpContext = this.app.container.use('Adonis/Core/HttpContext')

    HttpContext.getter('location', function location() {
      return geoip.lookup(this.request.ip())
    })
  }
  // highlight-end
}
```

By default, the getters are evaluated on every access. However, you can also mark them as a singleton, as shown in the following example.

```ts
HttpContext.getter(
  'location',
  function location() {
    return geoip.lookup(this.request.ip())
  },
  true // 👈 register as singleton
)
```

### Macros

Getters are always accessible as properties. However, macros can be both properties and methods.

```ts
HttpContext.macro('getLocation', function location() {
  return geoip.lookup(this.request.ip())
})

// Access it as
ctx.getLocation()
```

Or attach a literal value.

```ts
HttpContext.macro('pid', process.pid)

// Access it as
ctx.pid
```
