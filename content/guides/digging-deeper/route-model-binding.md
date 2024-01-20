---
summary:  Bind the route parameters with Lucid models and automatically query the database
---

AdonisJS provides a powerful route model binding feature, which allows you to bind the route parameters with Lucid models and automatically query the database.

The package must be installed and configured separately. You can install it by running the following command.

:::div{class="setup"}

:::codegroup

```sh
// title: 1. Install
npm i @adonisjs/route-model-binding@1.0.1
```

```sh
// title: 2. Configure
node ace configure @adonisjs/route-model-binding

# UPDATE: tsconfig.json { types += "@adonisjs/route-model-binding/build/adonis-typings" }
# UPDATE: .adonisrc.json { providers += "@adonisjs/route-model-binding/build/providers/RmbProvider" }
```

```ts
// title: 3. Register middleware
/**
 * Make sure to add the following global middleware inside
 * the start/kernel.ts file
 */
Server.middleware.register([
  // ...other middleware
  () => import('@ioc:Adonis/Addons/RmbMiddleware'),
])
```
 
:::


:::div{class="features"}

- Works with all Database drivers
- Customizable lookup logic

&nbsp;

- [View on npm](https://www.npmjs.com/package/@adonisjs/route-model-binding)
- [View on GitHub](https://github.com/adonisjs/route-model-binding)

:::

## Example

Route model binding is a neat way to remove one-liner Lucid queries from your codebase and use conventions to query the database during HTTP requests.

In the following example, we connect the route params `:post` and `:comments` with the arguments accepted by the `show` method.

- The value of the first param from the URL will be used to query the first typed hinted model on the `show` method (i.e., Post).
- Similarly, the value of the second param will be used to query the second typed hinted model (i.e., Comment).

:::note
The params and models are connected using the order they appear and not the name. This is because TypeScript decorators cannot know the names of the arguments accepted by a method.
:::

```ts
// Routes file
Route.get('posts/:post/comments/:comment', 'PostsController.show')
```

```ts
// Controller
import { bind } from '@adonisjs/route-model-binding'
import Post from 'App/Models/Post'
import Comment from 'App/Models/Comment'

export default class PostsController {
  @bind()
  public async show({}, post: Post, comment: Comment) {
    return { post, comment }
  }
}
```


:::note
**Are you a visual learner**? Checkout [these screencasts](https://learn.adonisjs.com/series/route-model-binding/introduction) to learn about Route model binding, its setup, and usage.
:::


## Basic usage
Start with the most basic example and tune the complexity level to serve different use cases.

In the following example, we will bind the `Post` model with the first parameter in the `posts/:id` route.

```ts
Route.get('/posts/:id', 'PostsController.show')
```

```ts
import { bind } from '@adonisjs/route-model-binding'
import Post from 'App/Models/Post'

export default class PostsController {
  @bind()
  public async show({}, post: Post) {
    return { post }
  }
}
```

:::warning
Ensure you always import your model with an `import` and not an `import type`. Otherwise, the `bind` decorator will not be able to retrieve the class of your model, and it will not work.

**ESLint user?** - Take a look [here](#compatibility-with-eslint)
:::

The params and models are matched in the order they are defined. So the first param in the URL matches the first type-hinted model in the controller method.

The match is not performed using the name of the controller method argument because TypeScript decorators cannot read them (so the technical limitation leaves us with the order-based matching only).

## Changing the lookup key
By default, the model's primary key is used to find a matching row in the database. You can change that globally or for just one specific route.

### Change lookup key globally via model
After the following change, the post will be queried using the `slug` property, not the primary key. In a nutshell, the `Post.findByOrFail('slug', value)` query is executed.

```ts
class Post extends BaseModel {
  public static routeLookupKey = 'slug'
}
```

### Change the lookup key for a single route.
The following example defines the lookup key directly on the route enclosed with parenthesis.

```ts
Route.get('/posts/:id(slug)', 'PostsController.show')
```

**Did you notice that our route now reads a bit funny?**\
The param is written as `:id(slug)`, which does not translate well. Therefore, with Route model binding, we recommend using the model name as the route param because we are no longer dealing with the `id`. Instead, we are fetching model instances from the database.

Following is the better way to write the same route.

```ts
Route.get('/posts/:post(slug)', 'PostsController.show')
```

## Change lookup logic
You can change the lookup logic by defining a static `findForRequest` method on the model itself. The method receives the following parameters.

- `ctx` - The HTTP context for the current request
- `param` - The parsed parameter. The parameter has the following properties.
    - `param.name` - The normalized name of the parameter.
    - `param.param` - The original name of the parameter defined on the route.
    - `param.scoped` - If `true`, the parameter must be scoped to its parent model.
    - `param.lookupKey` - The lookup key defined on the route or the model.
    - `param.parent` - The name of the parent param.
- `value` - The value of the param during the current request.

In the following example, we query only published posts. Also, ensure that this method either returns an instance of the model or raises an exception.

```ts
class Post extends BaseModel {
  public static findForRequest(ctx, param, value) {
    const lookupKey = param.lookupKey === '$primaryKey' ? 'id' : param.lookupKey

    return this
      .query()
      .where(lookupKey, value)
      .whereNotNull('publishedAt')
      .firstOrFail()
  }
}
```

## Scoped params
When working with nested route resources, you might want to scope the second param as a relationship with the first param.

A great example is finding a post comment by id and ensuring that it is a child of the post mentioned within the same URL.

The `posts/1/comments/2` should return 404 if the post id of the comment is not `1`.

You can define scoped params using the `>` greater than a sign or famously known as the [breadcrumb sign](https://www.smashingmagazine.com/2009/03/breadcrumbs-in-web-design-examples-and-best-practices/#:~:text=You%20also%20see%20them%20in,the%20page%20links%20beside%20it.)

```ts
Route.get('/posts/:post/comments/:>comment', 'PostsController.show')
```

```ts
import { bind } from '@adonisjs/route-model-binding'
import Post from 'App/Models/Post'
import Comment from 'App/Models/Comment'

export default class PostsController {
  @bind()
  public async show({}, post: Post, comment: Comment) {
    return { post, comment }
  }
}
```

For the above example to work, you must define the `comments` as a relationship on the `Post` model. The type of relationship does not matter.

```ts
class Post extends BaseModel {
  @hasMany(() => Comment)
  public comments: HasMany<typeof Comment>
}
```

The name of the relationship is looked up, converting the param name to `camelCase`. We will use both plural and singular forms to find the relationship.

### Customizing relationship lookup
By default, the relationship is fetched using the lookup key of the bound child model. Effectively the following query is executed.

```ts
await parent
  .related('relationship')
  .query()
  .where(lookupKey, value)
  .firstOrFail()
```

However, you can customize the lookup by defining the `findRelatedForRequest` method on the model (note, this is not a static method).

```ts
class Post extends BaseModel {
  public findRelatedForRequest(ctx, param, value) {
    /**
     * Have to do this weird dance because of
     * https://github.com/microsoft/TypeScript/issues/37778
     */
    const self = this as unknown as Post
    const lookupKey = param.lookupKey === '$primaryKey' ? 'id' : param.lookupKey

    if (param.name === 'comment') {
      return self
      .related('comments')
      .query()
      .where(lookupKey, value)
      .firstOrFail()
    }
  }
}
```

## Unbound params
You will often have parameters that are raw values and cannot be tied to a model. In the following example, the `version` is a regular string value and not backed using the database.

```ts
Route.get(
  '/api/:version/posts/:post',
  'PostsController.show'
)
```

You can represent the `version` as a string on the controller method, and we will perform no database lookup. For example:

```ts
import { bind } from '@adonisjs/route-model-binding'
import Post from 'App/Models/Post'

class PostsController {
  @bind()
  public async show({}, version: string, post: Post) {}
}
```

Since the route params and the controller method arguments are matched in the same order they are defined, you will always have to type-hint all the parameters.

## Compatibility with ESLint

If you use the rule `@typescript-eslint/consistent-type-imports`, you will notice that it will automatically replace your `import` with `import type`. Unfortunately, this will ultimately break the route model binding, as the types will be removed at runtime, so the `bind` decorator cannot retrieve the class from your model.

You will need to enable type-aware linting. You can follow this document:

https://typescript-eslint.io/docs/linting/typed-linting/
