A fresh instance of [HTTP Context class]() is generated for every HTTP request and passed along to the route handler, middleware, and exception handler.

HTTP Context holds all the information you might need related to an HTTP request. For example:

- You can access the request body, headers, and query params using the [ctx.request](#the-request-object) property.
- You can respond to the HTTP request using the [ctx.response](#the-response-object) property.
- Access the currently logged-in user using the [ctx.auth]() property.
- Or, authorize the user access using the [ctx.bouncer]() property.

In a nutshell, the context is a request-specific store holding all the information for the ongoing request.

## Getting access to the HTTP context

The HTTP context is passed by reference to the route handler, middleware, and exception handler, and you can access it as follows.

### Route handler

The [router handler](to-router) receives the HTTP context as the first parameter.

```ts
Route.get('/', (ctx) => {
  console.log(ctx.inspect())
})

// Destructure properties
Route.get('/', ({ request, response }) => {
  console.log(request.url())
  console.log(request.headers())
  console.log(request.qs())
  console.log(request.body())
  
  response.send('hello world')
  response.send({ hello: 'world' })
})
```

### Controller method

The [controller method](to-controller) (similar to the router handler) receives the HTTP context as the first parameter.

```ts
import { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  async index({ request, response }: HttpContext) {
  }
}
```

### Middleware class

The `handle` method of the [middleware class](to-middleware) receives HTTP context as the first parameter. 

```ts
import { HttpContext } from '@adonisjs/core/http'

export default class AuthMiddleware {
  async handle({ request, response }: HttpContext) {
  }
}
```

### Exception handler class

The `handle` and the `report` methods of the [global exception handler](to-ex-handler) class receives HTTP context as the second parameter. The first parameter is the `error` property.

```ts
import {
  HttpContext,
  HttpExceptionHandler
} from '@adonisjs/core/http'

export default class ExceptionHandler extends HttpExceptionHandler {
  async handle(error: any, ctx: HttpContext) {
    return super.handle(error, ctx)
  }

  async report(error: any, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
```

## Injecting Http Context using Dependency Injection

If you use Dependency injection throughout your application, you can inject the HTTP context to a class or a method by type hinting the `HttpContext` class.

:::note

Learn more about the `@inject` decorator in the [IoC container](../fundamentals/ioc-container.md) guide.

:::

```ts
// title: app/services/user_service.ts
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UserService {
  constructor(protected ctx: HttpContext) {}
  
  all() {
    // method implementation
  }
}
```

For automatic dependency resolution to work, you must inject the `UserService` inside your controller. Remember, the first argument to a controller method will always be the context, and the rest will be injected using the IoC container.

```ts
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import UserService from '#services/user_service'

export default class UsersController {
  @inject()
  index(ctx: HttpContext, userService: UserService) {
    return userService.all()
  }
}
```

That's all! The `UserService` will now automatically receive an instance of the ongoing HTTP request. You can repeat the same process for nested dependencies as well. 

## Accessing HTTP context from anywhere inside your application

Dependency injection is one way to accept the HTTP context as a class constructor or a method dependency and then rely on the container to resolve it for you.

However, it is not a hard requirement to restructure your application and use Dependency injection everywhere. You can also access the HTTP context from anywhere inside your application using the [Async local storage](https://nodejs.org/dist/latest-v16.x/docs/api/async_context.html#class-asynclocalstorage) provided by Node.js. 

We have a [dedicated guide](https://docs.adonisjs.com/guides/async-local-storage) on how Async local storage works and how AdonisJS uses it to provide global access to the HTTP context.

In the following example, the `UserService` class uses the `HttpContext.getOrFail` method to get the HTTP context instance for the ongoing request.

```ts
// title: app/services/user_service.ts
import { HttpContext } from '@adonisjs/core/http'

export default class UserService {
  all() {
    const ctx = HttpContext.getOrFail()
    console.log(ctx.request.url())
  }
}
```

The following code block shows the usage of the `UserService` class inside the `UsersController`.

```ts
import { HttpContext } from '@adonisjs/core/http'
import UserService from '#services/user_service'

export default class UsersController {
  index(ctx: HttpContext) {
    const userService = new UserService()
    return userService.all()
  }
}
```

## HTTP Context properties

Following is the list of properties you can access through the HTTP context. As you install new packages, they may also add additional properties to the context.

<table>
    <thead>
        <tr>
            <th width="120px">Property</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>ctx.request</code></td>
            <td>Reference to an instance of the <a href="">HTTP Request class</a>.</td>
        </tr>
        <tr>
            <td><code>ctx.response</code></td>
            <td>Reference to an instance of the <a href="">HTTP Response class</a>.</td>
        </tr>
        <tr>
            <td><code>ctx.logger</code></td>
            <td>Reference to a <a href="">child logger</a> instance created for a given HTTP request.</td>
        </tr>
        <tr>
            <td><code>ctx.route</code></td>
            <td>The matched route for the current HTTP request. The <code>route</code> property is an object of type <a href="https://github.com/adonisjs/http-server/blob/next/src/types/route.ts#L54"><code>StoreRouteNode</code></a></td>
        </tr>
        <tr>
            <td><code>ctx.params</code></td>
            <td>An object of route params</td>
        </tr>
        <tr>
            <td><code>ctx.subdomains</code></td>
            <td>An object of route subdomains. Only exists when the route is part of a dynamic subdomain</td>
        </tr>
        <tr>
            <td><code>ctx.session</code></td>
            <td>Reference to an instance of the <a href="">Session class</a>. The property is contributed by the <code>adonisjs/session</code> package.</td>
        </tr>
        <tr>
            <td><code>ctx.auth</code></td>
            <td>Reference to an instance of the <a href="">Auth class</a>. The property is contributed by the <code>adonisjs/auth</code> package.</td>
        </tr>
        <tr>
            <td><code>ctx.view</code></td>
            <td>Reference to an instance of the <a href="">View class</a>. The property is contributed by the <code>adonisjs/view</code> package.</td>
        </tr>
        <tr>
            <td><code>ctx\.ally</code></td>
            <td>Reference to an instance of the <a href="">SocialAuth class</a>. The property is contributed by the <code>adonisjs/ally</code> package.</td>
        </tr>
        <tr>
            <td><code>ctx.bouncer</code></td>
            <td>Reference to an instance of the <a href="">Bouncer class</a>. The property is contributed by the <code>adonisjs/bouncer</code> package.</td>
        </tr>
        <tr>
            <td><code>ctx.i18n</code></td>
            <td>Reference to an instance of the <a href="">I18n class</a>. The property is contributed by the <code>adonisjs/i18n</code> package.</td>
        </tr>
    </tbody>
</table>

## Additional reading

- Extend HTTP context
- Extend Request class
- Extend Response class
- Request class API reference
- Response class API reference
- Configure trusted proxies
- Learn more about response serialization
