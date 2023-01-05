The users of your website or web application can visit different URLs like `/`, `/about`, or `/posts/1`. To make these URLs work, you have to define routes.

Routes are defined inside the `start/routes.ts` file. A route is a combination of a URI pattern and a handler to handle requests for that specific route. For example:

```ts
import router from '@adonisjs/core/services/router'

router.get('/', () => {
  return 'Hello world from the home page'
})

router.get('/about', () => {
  return 'This is the about page'
})

router.get('/posts/:id', ({ params }) => {
  return `This is post with id ${params.id}`
})
```

The last route in the above example uses a dynamic URI pattern. The `:id` is a way to tell the router to accept any value for the id. We call them route params.

## Route params

Route params allow you to define URIs that can accept dynamic values. Each param captures the value of a URI segment, and you can access this value within the route handler.

A route param always starts with a colon `:`, followed by the param's name.

```ts
import router from '@adonisjs/core/services/router'

router.get('/posts/:id', ({ params }) => {
  return params.id
})
```

| URL               | Id        |
| ----------------- | --------- |
| `‌/posts/1`       | `1`       |
| `‌/posts/100`     | `100`     |
| `‌/posts/foo-bar` | `foo-bar` |

A URI can also accept multiple params. Each param should have a unique name.

```ts
import router from '@adonisjs/core/services/router'

router.get('/posts/:id/comments/:commentId', ({ params }) => {
  console.log(params.id)
  console.log(params.commentId)
})

// URL: /posts/1/comments/4 (params.commentId = 4)
```

| URL                           | Id        | Comment Id |
| ----------------------------- | --------- | ---------- |
| `‌/posts/1/comments/4`        | `1`       | `4`        |
| `‌/posts/foo-bar/comments/22` | `foo-bar` | `22`       |

### Optional params

The route params can also be optional by appending a question mark `?` at the end of the param name. The optional params should always come after all the required params.

```ts
import router from '@adonisjs/core/services/router'

router.get('/posts/:id?', ({ params }) => {
  if (!params.id) {
    return 'Showing all posts'
  }

  return `Showing post with id ${params.id}`
})
```

### Wildcard params

To capture all the segments of a URI, you can define a wildcard param. The wildcard param is specified using a special `*` keyword and must always be defined at the last position.

```ts
import router from '@adonisjs/core/services/router'

router.get('/docs/:category/*', ({ params }) => {
  console.log(params.category)
  console.log(params['*'])
})
```

| URL                  | Category | Wildcard param   |
| -------------------- | -------- | ---------------- |
| `/docs/http/context` | `http`   | `['context']`    |
| `/docs/api/sql/orm`  | `api`    | `['sql', 'orm']` |

### Params matchers

The router inherently has no knowledge about the format of the param data you want to accept. For example, a request with URI `/posts/foo-bar` and `/posts/1` will match the same route. However, you can explicitly validate the params values using param matchers.

A matcher is registered using the `router.where` method. The first argument is the param name, and the second argument is the matcher object.

In the following example, we define a regex to validate the id as a valid number. The route will be skipped in case the validation fails.

```ts
import router from '@adonisjs/core/services/router'

router
  .get('/posts/:id', ({ params }) => {})
  .where('id', {
    match: /^[0-9]+$/,
  })
```

Alongside the `match` regex, you can also define a `cast` function to convert the param value to its correct data type. In this example, we can convert the id to a number.

```ts
import router from '@adonisjs/core/services/router'

router
  .get('/posts/:id', ({ params }) => {
    console.log(typeof params.id)
  })
  .where('id', {
    match: /^[0-9]+$/,
    cast: (value) => Number(value),
  })
```

### Inbuilt matchers

The router ships with the following helper methods for commonly used data types.

```ts
import router from '@adonisjs/core/services/router'

// Validate id to be numeric + cast to number data type
router.where('id', route.matchers.number())

// Validate id to be a valid uuid
router.where('id', route.matchers.uuid())

// Validate slug to match a given slug regex: regexr.com/64su0
router.where('slug', route.matchers.slug())
```

### Global matchers

The route matchers can also be defined globally on the router instance. A global match is applied on all the routes unless explicitly overridden at the route level.

```ts
import router from '@adonisjs/core/services/router'

// Global matcher
router.where('id', route.matchers.uuid())

router
  .get('/posts/:id', () => {})
  // Overridden at route level
  .where('id', route.matchers.number())
```

## HTTP methods

The `router.get` method creates a route that responds to [GET HTTP method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET). Similarly, you can use the following methods to register routes for different HTTP methods.

```ts
// POST method
router.post('users', () => {})

// PUT method
router.put('users/:id', () => {})

// PATCH method
router.patch('users/:id', () => {})

// DELETE method
router.delete('users/:id', () => {})
```

You can use the `route.any` method to create a route that responds to all common HTTP methods.

```ts
router.any('reports', () => {})
```

Finally, you can create a route for custom HTTP methods using the `route.route` method.

```ts
router.route('/', ['TRACE'], () => {})
```

### Router handler

The route handler handles the request by returning a response or raising an exception to abort the request.

A handler can be an inline callback (as seen in this guide) or a reference to a controller method.

#### Inline callback

```ts
router.post('users', () => {})
```

#### Controller reference

In the following, we import the `UsersController` class and bind it to the route. After that, AdonisJS will automatically create an instance of this class using its IoC container and run the `store` method.

:::note

We have a [dedicated guide](./controllers.md) on using controllers. Make sure to read that for complete understanding.

:::

```ts
import UsersController from '#controllers/users_controller'

router.post('users', [UsersController, 'store'])
```

## Route middleware

You can define a middleware on a route by calling the `route.use` method. The method accepts an inline callback or a reference to a named middleware.

Following is a minimal example of defining a route middleware. We recommend reading the [dedicated guide on middleware](./middleware.md) to explore all the available options and the execution flow of middleware.

```ts
router
  .get('posts', () => {
    console.log('Inside route handler')

    return 'Viewing all posts'
  })
  .use((_, next) => {
    console.log('Inside middleware')
    return next()
  })
```

## Route identifier

Every route has a unique identifier you can use to reference the route elsewhere in your application. For example, you can generate a URL to a route using the [URL builder](./url-builder.md) or redirect to a route using the [response.redirect](./http-context.md#redirects) method.

By default, the route pattern is the route identifier (since it is always unique). However, you can also assign a unique, memorable name to the route using the `route.as` method.

```ts
router.get('users', () => {}).as('users.index')

router.post('users', () => {}).as('users.store')

router.delete('users/:id', () => {}).as('users.delete')
```

You can now construct URLs using the route name within your templates or using the URL builder.

```ts
const url = router.builder().make('users.delete', [user.id])
```

```edge
<form
  method='POST'
  action="{{
    route('users.delete', [user.id], { formAction: 'delete' })
  }}"
></form>
```

## Grouping routes

Grouping of routes is a convenience layer to bulk configure routes nested inside a group. You can create a group of routes using the `router.group` method.

```ts
router.group(() => {
  /**
   * All routes registered inside the callback
   * are part of the surrounding group
   */
  router.get('users', () => {})
  router.post('users', () => {})
})
```

Route groups can be nested inside each other, and AdonisJS will merge or override properties based on the behavior of the applied setting.

```ts
router.group(() => {
  router.get('posts', () => {})

  router.group(() => {
    router.get('users', () => {})
  })
})
```

### Prefixing routes inside a group

The URI pattern of routes inside a group can be prefixed using the `group.prefix` method. In the following example, the routes will have `/api/users` and `/api/payments` URI patterns.

```ts
router
  .group(() => {
    router.get('users', () => {})
    router.get('payments', () => {})
  })
  .prefix('api')
```

In the case of nested groups, the prefix will be applied from the outer to the inner group. The following example creates routes for `/api/v1/users` and `/api/v1/payments` URI patterns.

```ts
router
  .group(() => {
    router
      .group(() => {
        router.get('users', () => {})
        router.get('payments', () => {})
      })
      .prefix('v1')
  })
  .prefix('api')
```

### Naming routes inside a group

You can also prefix the route names inside a group, like prefixing the route pattern. Before calling the `group.as` method, make sure the route already has a name. Otherwise, an exception will be raised.

```ts
router
  .group(() => {
    route.get('users', () => {}).as('users.index') // final name - api.users.index
  })
  .prefix('api')
  .as('api')
```

In the case of nested groups, the names will be prefixed from the outer to the inner group.

```ts
router
  .group(() => {
    route.get('users', () => {}).as('users.index') // api.users.index

    router
      .group(() => {
        route.get('payments', () => {}).as('payments.index') // api.commerce.payments.index
      })
      .as('commerce')
  })
  .prefix('api')
  .as('api')
```

### Applying middleware to routes inside a group

You can assign middleware to routes inside a group using the `group.use` method. The group middleware are executed before the middleware applied on individual routes within the group.

In the case of nested groups, the middleware from the outermost group will run first. In other words, a group prepends middleware to the route middleware stack.

```ts
router
  .group(() => {
    router
      .get('posts', () => {})
      .use((_, next) => {
        console.log('logging from route middleware')
        return next()
      })
  })
  .use((_, next) => {
    console.log('logging from group middleware')
    return next()
  })
```

## Registering routes for a specific domain

AdonisJS allows you to register routes under a specific domain name. This is helpful when you have an application mapped to multiple domains and want to have a different set of routes for each of them.

In the following example, we define two sets of routes.

- Routes that are resolved for any domain/hostname. 
- Routes that only are matched when the domain/hostname matches by pre-defined domain name value.

```ts
router.group(() => {
  router.get('/users', () => {})
  router.get('/payments', () => {})
})

router.group(() => {
  router.get('/articles', () => {})
  router.get('/articles/:id', () => {})
}).domain('blog.adonisjs.com')
```

Once you deploy your application, the routes under the group with an explicit domain will only be matched if the request's hostname is `blog.adonisjs.com`.

### Dynamic subdomains

Using the `group.domain` method, you can also specify dynamic subdomains. Similar to the route params, the dynamic segment of a domain starts with a colon `:`.

In the following example, the `tenant` segment accepts any subdomain, and you can access its value using the `HttpContext.subdomains` object.

```ts
router
 .group(() => {
   router.get('users', ({ subdomains }) => {
     return `Listing users for ${subdomains.tenant}`
   })
 })
 .domain(':tenant.adonisjs.com')
```

## Render view from a route

If you have a route handler that only renders a view, you might use the `router.on.render` method. It is a convenient shortcut to render a view without defining an explicit handler.

In the following examples, the render method accepts the name of the edge template to render. Optionally, you can also pass data as the second argument.

```ts
import router from '@adonisjs/core/services/router'

router.on('/').render('home')
router.on('about').render('about', { title: 'About us' })
router.on('contact').render('contact', { title: 'Contact us' })
```

## Redirect from a route

If you are defining a route handler to redirect the request to another path or route, you might use the `router.on.redirect` or `router.on.redirectToPath` methods.

The `redirect` method accepts the route identifier. Whereas the `redirectToPath` method accepts a static path/URL.

```ts
import router from '@adonisjs/core/services/router'

// Redirect to a route
router.on('/posts').redirect('/articles')

// Redirect to a URL
router.on('/posts').redirectToPath('https://medium.com/my-blog')
```

### Forwarding params

In the following example, the value of `id` from the original request will be used to construct the `/articles/:id` route. So if a request comes for `/posts/20`, it will be redirected to `/articles/20`.

```ts
import router from '@adonisjs/core/services/router'

router.on('/posts/:id').redirect('/articles/:id')
```

### Explicitly specifying params

You can also specify the route params explicitly as the second argument. In this case, the params from the current request will be ignored.

```ts
import router from '@adonisjs/core/services/router'

// Always redirect to /articles/1
router.on('/posts/:id').redirect('/articles/:id', {
  id: 1
})
```

### With query string

The query string for the redirect URL can be defined within the options object.

```ts
import router from '@adonisjs/core/services/router'

router.on('/posts').redirect('/articles', {
  qs: {
    limit: 20,
    page: 1,
  }  
})
```

## Current request route

The route of the current request can be accessed using the [`HttpContext.route`](./http-context.md) property. It includes the **route pattern**, **name**, **reference to its middleware store**, and **reference to the route handler**.

```ts
router.get('payments', ({ route }) => {
  console.log(route)
})
```

You can also check if the current request is for a specific route or not using the `request.matchesRoute` method. The method accepts either the route URI pattern or the route name.

```ts
router.get('/posts/:id', ({ request }) => {
  if (request.matchesRoute('/posts/:id')) {
  }
})
```

```ts
router
  .get('/posts/:id', ({ request }) => {
    if (request.matchesRoute('posts.show')) {
    }
  })
  .as('posts.show')
```

You can also match against multiple routes. The method will return true as soon as it finds the first match.

```ts
if (request.matchesRoute(['/posts/:id', '/posts/:id/comments'])) {
  // do something
}
```

## How AdonisJS matches routes

The routes are matched in the same order as they are registered inside the routes file. We begin the match from the topmost route and stop at the first matching route.

You must first register the most specific route if you have two similar routes.

In the following example, the request for the URL `/posts/archived` will be handled by the first route (i.e., `/posts/:id` ) because the dynamic param `id` will capture the `archived` value.

```ts
import router from '@adonisjs/core/services/router'

route.get('posts/:id', () => {})
route.get('posts/archived', () => {})
```

This behavior can be fixed by re-ordering the routes by placing the most specific route before the route with a dynamic param.

```ts
route.get('posts/archived', () => {})
route.get('posts/:id', () => {})
```


### Defining a fallback handler

AdonisJS raises a 404 exception when no matching route is found for the current request's URL.

To display a 404 page to the user, either you can catch the `RouteNotFound` exception inside the [global exception handler](./handling-exceptions.md) or define a fallback handler for the same.

The `router.fallback` method accepts the fallback handler as the only argument. The handler receives an instance of the [HTTP context](./http-context.md) as the first parameter.

:::important

#### Note

Route middleware does not run for the fallback handler.

:::

```ts
router.fallback(({ view }) => {
  return view.render('errors/404')
})
```
