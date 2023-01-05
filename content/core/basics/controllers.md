
HTTP controllers offer an abstraction layer to organize the route handlers inside dedicated files. So, instead of expressing all the request-handling logic within the routes file, you move it to controller classes.

The controllers are stored within the `./app/controllers` directory, representing each controller as a plain JavaScript class. You can create a new controller by running the following command.


:::note

The `make:controller` command appends the `controller` keyword at the end of the filename. So, this convention might help you search all the controllers within your code editor by typing the keyword **controller**.

:::

```sh
node ace make:controller users
```

A newly created controller is scaffolded with the `class` declaration, and you can manually create methods inside it. For this example, let's create an `index` method and return an array of users from it.

```ts
import { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async index(ctx: HttpContext) {
    return [
      {
        id: 1,
        username: 'virk'
      },
      {
        id: 2,
        username: 'romain'
      },
    ]
  }
}
```

Finally, let's bind this controller to a route. We will import the controller using the `#controllers` alias. The aliases are defined using [subpath imports feature of Node.js](../folder-structure.md#subpath-imports).

```ts
// title: start/routes.ts
import router from '@adonisjs/core/services/router'
import UsersController from '#controllers/users_controller'

router.get('users', [UsersController, 'index'])
```

As you might have noticed, we do not create an instance of the controller class and instead pass it directly to the route. Doing so allows AdonisJS to:

- Create a fresh instance of the controller for each request.
- And also construct the class using the [IoC container](../fundamentals/ioc-container.md), which allows you to leverage automatic dependency injection.

:::danger

#### Not recommended

If you want, you can manually create an instance of the controller and execute the method. However, it is not recommended because you will write more boilerplate code and lose the IoC container benefits.

```ts
// 🫤 Naah
router.get('users', (ctx) => {
  return new UsersController().index(ctx)
})
```

:::


## Lazy loading controllers

As your codebase grows, you will notice it starts impacting the boot time of your application. A common reason for that is importing all the controllers inside the routes file.

Since controllers handle HTTP requests, they often import other modules like models, services, validators, third-party packages, etc.

Your routes file becomes this central point of importing the entire codebase when booting the application. **To prevent this from happening, we recommend lazy loading the controllers.**

Lazy loading is as simple as moving the import statement behind a function and using dynamic imports.

```ts
import router from '@adonisjs/core/services/router'
// delete-start
import UsersController from '#controllers/users_controller'
// delete-end
// insert-start
const UsersController = () => import('#controllers/users_controller')
// insert-end

router.get('users', [UsersController, 'index'])
```

### Using magic strings

Another way of lazy loading the controllers is to reference the controller and its method as a string. We call it a magic string because the string itself has no meaning, and it's just the router uses it to look up the controller and imports it behind the scenes.

In the following example, we do not have any import statements within the routes file, and we bind the controller import path + method as a string to the route.

```ts
import router from '@adonisjs/core/services/router'

router.get('users', '#controllers/users_controller.index')
```

The only downside of magic strings is they are not type-safe. If you make a typo in the import path, your code editor will not give you any feedback.

On the upside, magic strings can clean up all the visual clutter inside your routes file because of the import statements.

Using magic strings is subjective, and you can decide if you want to use them personally or as a team.

## Dependency injection 

The controller classes are instantiated using the [IoC container](../fundamentals/ioc-container.md); therefore, you can type hint dependencies inside the controller constructor or a controller method.

Given you have a `UserService` class, you can inject an instance of it inside the controller as follows.

```ts
export default class UserService {
  async all() {
    // return users from db
  }
}
```

```ts
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

import UserService from '#services/user_service'

@inject()
export default class UsersController {
  constructor(protected userService: UserService) {}
  
  index() {
    return this.userService.all()
  }
}
```

### Method injection

You can inject an instance of `UserService` directly inside the controller method using method injection. In this case, you must apply the `@inject` decorator on the method name.

The first parameter passed to the controller method is always the HttpContext. Therefore, you must type-hint the `UserService` as the second parameter.

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

### Tree of dependencies 

Automatic resolution of dependencies is not only limited to the controller. Any class injected inside the controller can also type-hint dependencies, and the IoC container will construct the tree of dependencies for you.

For example, let's modify the `UserService` class to accept an instance of the [HttpContext](./http-context.md) as a constructor dependency.

```ts
// highlight-start
import { inject } from '@adonisjs/core'
// highlight-end
import { HttpContext } from '@adonisjs/core/http'

// highlight-start
@inject()
// highlight-end
export default class UserService {
  // highlight-start
  constructor(protected ctx: HttpContext) {}
  // highlight-end

  async all() {
    console.log(this.ctx.auth.user)
    // return users from db
  }
}
```

After this change, the `UserService` will automatically receive an instance of the `HttpContext` class. Also, no changes are required in the controller.

## Resource driven controllers

For most conventional [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) applications, a controller should only be designed to manage a single resource. A resource is usually an entity in your application. For example, a User resource or a Post resource.

Let's take the example of a Post resource. You may define the following controller methods to perform CRUD operations on the Post resource.


:::note

You can create a controller with resource methods pre-defined by running the following ace command.

```sh
node ace make:controller posts --resource
```

:::

```ts
export default class PostsController {
  async index() {}

  async create() {} 
  
  async store() {}
  
  async show() {}

  async edit() {}
  
  async update() {}
  
  async destroy() {}
}
``` 

Next, let's create a route resource and bind `PostsController` to it. The `router.resource` method accepts the resource's name as the first argument and the controller reference as the second argument.

```ts
import router from '@adonisjs/core/services/router'
const PostsController = () => import('#controllers/posts_controller')

router.resource('posts', PostsController)
```

The following set of routes are automatically created by the `router.resource` method.

| Route | Method | Purpose |
|--------------------|------------|------------|
| `GET /posts` | `index` | Display a collection of posts. |
| `GET /posts/create` | `create` | Render the form to create a new post |
| `POST /posts` | `store` | Handle form submission to create a new post |
| `GET /posts/:id` | `show` | Display a single post by id. |
| `GET /posts/:id/edit` | `edit` | Render the form to edit an existing post by its id. |
| `PUT /posts/:id` | `update` | Handle the form submission to update a specific post by id |
| `DELETE /posts/:id` | `destroy` | Handle the form submission to delete a specific post by id. |

### Nested resources

Nested resources can be created by specifying the parent and the child resource name separated using the dot `.` notation.

In the following example, we create routes for the `comments` resource nested under the `posts` resource.

```ts
router.resource('posts.comments', CommentsController)
```

| HTTP method | Route | Controller method |
|--------|--------------------|------------|
| GET | `/posts/:post_id/comments` | index |
| GET | `/posts/:post_id/comments/create` | create |
| POST | `‌/posts/:post_id/comments` | store |
| GET | `/posts/:post_id/comments/:id` | show |
| GET | `/posts/:post_id/comments/:id/edit` | edit |
| PUT | `/posts/:post_id/comments/:id` | update |
| DELETE | `/posts/:post_id/comments/:id` | destroy |

### Shallow resources

When using nested resources, the routes for the child resource are always prefixed with the parent resource name and its id. For example:

- The `/posts/:post_id/comments` route displays a list of all the comments for a given post.
- And, the `/posts/:post_id/comments/:id` route displays a single comment by its id.

The existence of `/posts/:post_id` in the second route is irrelevant, as you can look up the comment by its id.

A shallow resource registers its routes by keeping the URL structure flat (wherever possible). Let's continue with the `posts.comments` resource and register routes using a shallow resource this time.

```ts
router.shallowResource('posts.comments', CommentsController)
```

| HTTP method | Route | Controller method |
|--------|--------------------|------------|
| GET | `/posts/:post_id/comments` | index |
| GET | `/posts/:post_id/comments/create` | create |
| POST | `‌/posts/:post_id/comments` | store |
| GET | `/comments/:id` | show |
| GET | `/comments/:id/edit` | edit |
| PUT | `/comments/:id` | update |
| DELETE | `/comments/:id` | destroy |

### Naming resource routes

The routes created using the `router.resource` method are named after the resource name and the controller action. First, we convert the resource name to snake case and concatenate the action name using the dot `.` separator.

| Resource | Action name | Route name |
|--------|--------------------|------------|
| posts | index | `posts.index` |
| userPhotos | index | `user_photos.index` |
| group-attributes | show | `group_attributes.index` |


You can rename the prefix for all the routes using the `resource.as` method. In the following example, we rename the `group_attributes.index` route name to `attributes.index`.

```ts
router
  .resource('group-attributes', GroupAttributesController)
  .as('attributes')
```

The prefix given to the `resource.as` method is transformed into snake case. If you want, you can turn off the transformation, as shown below.

```ts
router
  .resource('group-attributes', GroupAttributesController)
  .as('groupAttributes', false)
```


### Registering API only routes

When creating an API server, the forms to create and update a resource are rendered by a front-end client or a mobile app. Therefore, creating routes for these endpoints is redundant.

You can use the `resource.apiOnly` method to remove the `create` and the `edit` routes. As a result, only five routes will be created. 

```ts
router
  .resource('posts', PostsController)
  .apiOnly()
```

### Registering only specific routes

To remove to register only specific routes, you can use the `resource.only` or the `resource.except` methods.

The `resource.only` method accepts an array of action names and removes all other routes except those mentioned. In the following example, only the routes for the `index`, `store`, and `destroy` actions will be registered.

```ts
router
  .resource('posts', PostsController)
  .only(['index', 'store', 'destroy'])
```

The `resource.except` method is the opposite of the `only` method and removes the routes for the mentioned action names.

```ts
router
  .resource('posts', PostsController)
  .except(['destroy'])
```

### Renaming resource params

The routes generated by the `router.resource` method use `id` for the param name. For example, `GET /posts/:id` to view a single and `DELETE /post/:id` to delete the post.

You can rename the param from `id` to something else using the `resource.params` method.

```ts
router
  .resource('posts', PostsController)
  .params({
    posts: 'post'
  })
```

The above change will generate the following routes *(showing partial list)*.

| HTTP method | Route | Controller method |
|--------|--------------------|------------|
| GET | `/posts/:post` | show |
| GET | `/posts/:post/edit` | edit |
| PUT | `/posts/:post` | update |
| DELETE | `/posts/:post` | destroy |

You can also rename params when using nested resources.

```ts
router
  .resource('posts.comments', PostsController)
  .params({
    posts: 'post',
    comments: 'comment'
  })
```

### Assigning middleware to resource routes

Using the `resource.tap` method, you can assign middleware to resource routes. The tap method allows you to access the underlying instances of routes registered by the resource class.

In the following example, we register the auth middleware to all the post resource routes.

```ts
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router
  .resource('posts', PostsController)
  .tap((route) => {
    route.use(middleware.auth())
  })
```

You can tap into specific routes by defining an array of action names as the first argument.

In the following example, we assign the `auth` middleware to the `store`, `update`, and the `destroy` routes.

```ts
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router
  .resource('posts', PostsController)
  .tap(['store', 'update', 'destroy'], (route) => {
    route.use(middleware.auth())
  })
```
