---
summary: Learn how to use controllers and resourceful routes in AdonisJS
---

Controllers are the de facto way of handling HTTP requests in AdonisJS. They enable you to clean up the routes file by moving all the inline route handlers to their dedicated controller files.

In AdonisJS, the controllers are stored inside (but not limited to) the `app/Controllers/Http` directory and each file represents a single controller. 

Do you want to extract a complex controller method to its own file? 

Use a [Single Action Controller](https://docs.adonisjs.com/guides/controllers#single-action-controllers)!

```ts
// title: app/Controllers/Http/PostsController.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PostsController {
  public async index(ctx: HttpContextContract) {
    return [
      {
        id: 1,
        title: 'Hello world',
      },
      {
        id: 2,
        title: 'Hello universe',
      },
    ]
  }
}
```

You will have to reference it as a route handler inside the `start/routes.ts` file to use this controller.

```ts
Route.get('posts', 'PostsController.index')
```

## Controllers location

Conventionally, the controllers are stored inside the `app/Controllers/Http` directory, but it is not a hard rule, and you can modify their location inside the `.adonisrc.json` file.

```json
{
  "namespaces": {
    "httpControllers": "App/Controllers"
  }
}
```

Now, AdonisJS will find the controllers inside the `App/Controllers` directory. Also, the `make:controller` command will create them inside the correct location.

:::note
Your controller does not need to be inside only one directory. You can freely move them around inside your application structure.
Ensure to require them in your route declaration correctly.
:::

### Route namespacing

When having different locations for your controller, it may be convenient to define the namespace of your controllers using route groups.

```ts
Route.group(() => {
  Route.get('cart', 'CartController.index')
  Route.put('cart', 'CartController.update')
}).namespace('App/Modules/Checkout')
```

The `CartController` will be imported from `App/Modules/Checkout` in this example.

:::note
The namespace should be an absolute path from the root of your application.
:::

## Make controller command

You can make use of the following `node ace` command to create a new controller.

```sh
node ace make:controller Post

# CREATE: app/Controllers/Http/PostsController.ts
```

If you notice, in the above command, we mentioned the word `Post` as singular, whereas the generated file name is in the plural form and has a `Controller` suffix.

AdonisJS applies these transformations to ensure that the filenames are consistent throughout your project. However, you can instruct the CLI not to apply these transformations using the `--exact` flag.

![Output of "node ace make:controller --help"](https://res.cloudinary.com/adonis-js/image/upload/f_auto,q_auto/v1611555570/v5/controller-help-exact-flag.png)

## Controller routes reference

As you can notice, the controllers are referenced on routes as a string expression, i.e., `'Controller.method'`. We opted for this approach intentionally in favor of lazy loading controllers and less verbose syntax.

Let's see how the routes file may look if we decide **NOT TO use** the string expression.

```ts
import Route from '@ioc:Adonis/Core/Route'
import PostsController from 'App/Controllers/Http/PostsController'

Route.get('/posts', async (ctx) => {
  return new PostsController().index(ctx)
})
```

In the above example, we import the `PostsController` within the routes file. Then, create an instance and run the `index` method, passing the `ctx` object.

Now imagine an application with 40-50 different controllers. Each controller has its set of imports, all getting pulled down inside a single routes file, making the routes file a choke point.

### Lazy loading

Lazy loading the controllers is a perfect solution to the problem mentioned above. There is no need to import everything at the top level; instead, import the controllers as they are needed.

```ts
import Route from '@ioc:Adonis/Core/Route'

Route.get('/posts', async (ctx) => {
  const { default: PostsController } = await import(
    'App/Controllers/Http/PostsController'
  )
  return new PostsController().index(ctx)
})
```

Manually importing the controller, instantiating the class instance is still too much code, considering a decent-sized application can go over 100 routes.

### Betting on the TypeScript future

The string-based reference provides the best of both worlds. The controllers are lazy-loaded, and the syntax is concise.

However, it comes with the downside of not being type-safe. IDE doesn't complain if the controller or the method is missing or has a typo.

On the brighter side, making the string expression type-safe is not impossible. TypeScript is already making progress in that direction. We need two things to achieve type safety when referencing the `'Controller.method'` string expression.

- The ability to tokenize the string expression and create a full path to the controller and its method. It is achievable with TypeScript 4.1 and onwards. For example, here is a [proof of concept](https://www.typescriptlang.org/play?ts=4.1.3#code/MYewdgzgLgBASiArlApjAvDA3gKBjAcxSgB4AJAQzABMAbFAJxhQA9UaIZoGBLMAgHwAKAA4UoqBmABcXKL34AaGAAsqdRrMo16DAJSyY2jU1btqnAAYASLHwBmjGAEEAvgDpbDpwCFXlmAB+bDx8GFAweRBaXVlLZxERAHoAYXAomMYIJLIJZNs3S0VQ-ABbYhUQalkfUNcYWUQwAGswEAB3MBxXHF6kpKMQADcnYacoFTQAIgYkVCmYIYpeCgAjehh1LhQ0CfEYdrRlo-XdkBgxBggjuQUCGD4oc6fmlEgcCOgYWeQ0TARfu4iFAhAByJKg5SgsggcppSKzTIMdx8aisUF6IA) for the same.
- Next is the ability to have an Import type with support for generics. There is [an open issue](https://github.com/microsoft/TypeScript/issues/31090), and we are optimistic that it will make its way to the TypeScript in the future, as it adheres to the TypeScript design goals.


## Single action controllers

AdonisJS provides a way to define a single action controller. It's an effective way to wrap up functionality into clearly named classes. To accomplish this, you need to define a `handle` method inside the controller.

```ts
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RegisterNewsletterSubscriptionController {
  public async handle({}: HttpContextContract) {
    // ...
  }
}
```

Then, you can reference the controller on the route as a string expression.

```ts
Route.post('/newsletter', 'RegisterNewsletterSubscriptionController')
```

## CRUD operations

The principles of [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) provides a great way to map CRUD operations with HTTP methods without making the URLs verbose.

For example, The URL `/posts` can be used to **view all the posts** and **create a new post**, just by using the correct HTTP method.

```ts
Route.get('/posts', () => {
  return 'List of posts'
})

// 👇
Route.post('/posts', () => {
  return 'Create a new post'
})
```

Here's the list of all the routes to perform CRUD operations.

```ts
Route.get('/posts', () => {
  return 'List all posts'
})

Route.get('/posts/create', () => {
  return 'Display a form to create a post'
})

Route.post('/posts', async () => {
  return 'Handle post creation form request'
})

Route.get('/posts/:id', () => {
  return 'Return a single post'
})

Route.get('/posts/:id/edit', () => {
  return 'Display a form to edit a post'
})

Route.put('/posts/:id', () => {
  return 'Handle post update form submission'
})

Route.delete('/posts/:id', () => {
  return 'Delete post'
})
```

## Resourceful routes and controllers

Since the [above mentioned](#crud-operations) routes are using a pre-defined convention. AdonisJS provides a shortcut to register all the routes together using the `Route.resource` method.

```ts
Route.resource('posts', 'PostsController')
```

Following is the list of registered routes.

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1611651446/v5/routes-list.png)

### Naming routes

As you can notice, each route registered by the resource is given a name. The route name is created by combining the **resource name** and the **action** performed by the route. For example:

- `posts.create` signifies a route to display the form to create a new post
- `posts.store` represents a route to create a new post, and so on.

Using the `.as` method, you can change the prefix before the action name.

```ts
Route.resource('posts', 'PostsController').as('articles')
```

```txt
articles.index
articles.create
articles.store
articles.show
articles.edit
articles.update
articles.destroy
```

### Filtering routes

In many situations, you would want to prevent some of the resourceful routes from getting registered. For example, You decide to restrict the users of your blog from **updating** or **deleting** their comments, and hence routes for the same are not required.

```ts
Route
  .resource('comments', 'CommentsController')
  .except(['update', 'destroy']) // 👈
```

The opposite of the `except` method is the `only` method. It only registers the routes with the given action names.

```ts
Route
  .resource('comments', 'CommentsController')
  .only(['index', 'show', 'store']) // 👈
```

### API only routes

When creating an API server, the routes to display the forms are redundant, as you will be making those forms within your frontend or the mobile app. You can remove those routes by calling the `apiOnly` method.

```ts
Route.resource('posts', 'PostsController').apiOnly() // 👈
```

### Applying middleware

The `.middleware` method also applies middleware on all or selected sets of routes registered by a given resource.

```ts
Route.resource('users', 'UsersController').middleware({
  '*': ['auth'],
})
```

Or apply middleware to selected actions only. In the following example, the object key has to be the action name.

```ts
Route.resource('users', 'UsersController').middleware({
  create: ['auth'],
  store: ['auth'],
  destroy: ['auth'],
})
```

### Renaming resource param name
The param to view a single instance of a resource is named as `id`. However, you can rename it to something else using the `paramFor` method.

```ts
Route
  .resource('users', 'UsersController')
  // highlight-start
  .paramFor('users', 'user')
  // highlight-end
```

The above example will generate the following routes.

```sh
# Showing routes with params only

GET /users/:user
GET /users/:user/edit
PUT,PATCH /users/:user
DELETE /users/:user
```

You can also rename nested and shallow resources. For example:

```ts
Route
  .resource('posts.comments', 'CommentsController')
  .paramFor('posts', 'post')
  .paramFor('comments', 'comment')
```

## Nested resources

You can also register nested resources by separating each resource with a `dot notation (.)`. For example:

```ts
Route.resource('posts.comments', 'CommentsController')
```

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1611673295/v5/nested-resource.png)

As you can notice, the parent resource id is prefixed with the resource name. ie `post_id`.

## Shallow resources

In nested resources, every child resource is prefixed with the parent resource name and its id. For example:

- `/posts/:post_id/comments`: View all comments for the post
- `/posts/:post_id/comments/:id`: View all comment by id.

The existence of `:post_id` in the second route is irrelevant, as you can look up the comment directly by its id.

To keep the URL structure flat (wherever possible), you can use shallow resources.

```ts
Route.shallowResource('posts.comments', 'CommentsController')
```

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1612004976/v5/shallow-resource.png)

## Re-using controllers

Many developers tend to make the mistake of attempting to re-use controllers by importing them inside other controllers.

If you want to re-use some logic within your application, you must extract that piece of code to its class or object, often known as service objects.

We strongly recommend treating your controllers as **traffic hops**, whose job is to **accept the HTTP request**, **assign work** to the other parts of the application, and **return a response**. All of the reusable logic must live outside the controller.
