---
summary: After almost five months from the last release and over one year from the initial preview release. I am happy to announce that we are going out of preview, and v5 will be the main version of the framework.
---

Finally 😅

After almost five months from the last release and over one year from the initial preview release, I am happy to announce that we are going out of preview, and v5 will be the main version of the framework starting today.

:::note

If you are using v4 of the framework, we do not recommend upgrading existing applications since there is no easy upgrade path from v4 to v5.

The documentation for v4 has been moved to https://legacy.adonisjs.com. We will continue pushing security updates and minor patches to v4 for the entire 2021 

:::

To ensure we have a smooth journey moving forward, I have to come up with a few breaking changes in this release. Most of the changes are small, and TypeScript static type checking will also help you along the way. 

**But first, let's celebrate new additions to the framework.**

## Social authentication
You can implement social authentication in your applications using the `@adonisjs/ally` package. Just like everything else, the API for ally is boilerplate-free and straightforward.

```ts
Route.get('/github/redirect', async ({ ally }) => {
  return ally.use('github').redirect()
})

Route.get('/github/callback', async ({ ally }) => {
  const github = ally.use('github')
  const user = await github.user()
})
```

Also, we make sure to provide IntelliSense for the available scopes for a given OAuth provider. 

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1619637422/v5/ally-intellisense.jpg)

<div class="doc-cta-wrapper">

[Read ally documentation →](../guides/auth/social.md)

</div>

## Authorization
The `@adonisjs/bouncer` packages add support for authorizing user actions. The main goal of the bouncer package is to help you extract the authorization logic to the Bouncer actions or policies vs. writing it everywhere in your codebase.

Following is an example of expressing the authorization checks as bouncer actions.

```ts
export const { actions } = Bouncer
  .define('viewPost', (user: User, post: Post) => {
    return post.userId === user.id
  })
  .define('editPost', (user: User, post: Post) => {
    return post.userId === user.id
  })
  .define('deletePost', (user: User, post: Post) => {
    return post.userId === user.id && post.status !== 'published'
  })
```

You can authorize the currently logged in user against the defined actions as follows:

```ts
import Route from '@ioc:Adonis/Core/Route'
import Post from 'App/Models/Post'

Route.get('posts/:id', async ({ bouncer, request }) => {
  const post = await Post.findOrFail(request.param('id'))
  await bouncer.authorize('viewPost', post)
})
```

<div class="doc-cta-wrapper">

[Read authorization documentation →](../guides/digging-deeper/authorization.md)

</div>

## Assets manager
You can optionally configure webpack encore to bundle your frontend assets. 

We use package detection to check if `@symfony/webpack-encore` is installed and start the webpack dev server from the `node ace serve --watch` command. Meaning, you can start both the AdonisJS development server and the webpack dev server from a single command.

Also, we have added new tags and helper methods to reference the compiled assets inside Edge templates. Following is a standard template to reference the frontend assets inside the edge templates.

```edge
<!DOCTYPE html>
<html lang="en">
  <head>
    @entryPointScripts('app')
    @entryPointStyles('app')
  </head>

  <body>
  </body>
</html>
```

<div class="doc-cta-wrapper">

[Read assets manager documentation →](../guides/http/assets-manager.md)

</div>

## Ace command aliases
You can now define the aliases for the ace commands inside the `.adonisrc.json` file. The goal is to help you create short and memorizable aliases.

Following is an example of defining the `migrate` alias for the `migration:run` command.

```json
{
  "migrate": "migration:run"
}
```

And now run the migrations as follows.

```sh
node ace migrate
```

## Helpers module
We have collected all the small utilities used by the framework and the ecosystem packages to a helpers module and make it available to your apps.

Since these utilities are already installed and used by the framework, the helpers module does not add any additional bloat to your `node_modules`.

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.camelCase('hello-world') // helloWorld
```

<div class="doc-cta-wrapper">

[Read helpers documentation →](../guides/digging-deeper/helpers.md)

</div>

## New documentation website
Improving documentation was a long pending task. With this release, I have almost rewritten the complete documentation from scratch and covered most topics.

To begin with, we have divided the documentation into multiple sub-groups, each trying to solve a specific use case.

- The **technical guides** are the in-depth documentation of the framework and cover every single topic and feature of the framework.
- Modules with larger API surfaces like **Database** and **Validator** are also documented inside the reference guides. Here you find all of the available validation methods, database query methods, and so on.
- **Cookbooks** are the actionable guides to help you achieve a practical task. Everything that was a blog post earlier will now be under cookbooks.

Since the documentation website is now decoupled with the main marketing website, individuals interested in translating the docs can fork the repo of the docs website and create a translated version of it.

## Upgrading to the latest versions
You can upgrade to the latest versions of all the packages using the `npm update` command or manually installing packages with the `@latest` tag.

:::note
Make sure to double-check the `package.json` file of your application and then only re-install the required packages.
:::

```sh
npm i @adonisjs/auth@latest
npm i @adonisjs/core@latest
npm i @adonisjs/lucid@latest
npm i @adonisjs/mail@latest
npm i @adonisjs/repl@latest
npm i @adonisjs/session@latest
npm i @adonisjs/view@latest
npm i @adonisjs/shield@latest

# Development only
npm i -D @adonisjs/assembler@latest
```

## Breaking changes
You will start receiving some errors right after upgrading the packages. It is alright, as we will walk through the breaking changes together and fix them.

As the first step, do check your Node.js version and ensure you are running `Node >= 14.15.4`. The preview release worked with Node 12 as well, but now **AdonisJS needs 14.15.4 and above**.

---

### Making middleware type-safe
Open the pre-existing `start/kernel.ts` file and remove the string based middleware references with the import statement as follows:

```ts
Server.middleware.register([
  // delete-start
  'Adonis/Core/BodyParserMiddleware',
  'Adonis/Addons/ShieldMiddleware',
  'App/Middleware/SilentAuth'
  // delete-end
  // insert-start
  () => import('@ioc:Adonis/Core/BodyParser'),
  () => import('@ioc:Adonis/Addons/Shield'),
  () => import('App/Middleware/SilentAuth')
  // insert-end
])
```

Similarly, update the auth middleware also to use import statements.

```ts
Server.middleware.registerNamed({
  // delete-start
  auth: 'App/Middleware/Auth',
  // delete-end
  // insert-start
  auth: () => import('App/Middleware/Auth')
  // insert-end
})
```

Import-based middleware ensures that the TypeScript compiler can report the invalid references in advance. 

---

### Rename `forceContentNegotiationToJSON` config property
Open the `config/app.ts` file and replace the `forceContentNegotiationToJSON` with the following code.

:::note
The change is only applicable if the `forceContentNegotiationToJSON` property was existing inside the config file. Feel free to configure the change if there is no property in the first place.
:::

```ts
{
  http: {
    // delete-start
    forceContentNegotiationToJSON: true
    // delete-end
    // insert-start
    forceContentNegotiationTo: 'application/json'
    // insert-end
  }
}
```

The old flag `forceContentNegotiationToJSON` forced the request `Accept` header to always be `application/json`. With the recent change, you can force it to any value to want.

---

### Async views rendering
The `view.render` method now returns a promise that resolves to a string value. Earlier, this method was synchronous.

The change was required because of the following reasons:

- Rendering templates synchronously block the event loop of Node.js and also limit the views from using the `await` keyword. 
- The [authorization checks](../guides/digging-deeper/authorization.md#usage-inside-the-edge-templates) are async and in order to use the `@can` and `@cannot` tags, we need async rendering of templates.

You have a couple of options to make this change. 

- Either you prefix all the `view.render` calls with the `await` keyword (recommended).
- Or, you can replace them with `view.renderSync` to opt into the old behavior.

If you decide to opt into async rendering, then you will have to also update the components using slots to `await` them. For example:

```edge
// delete-start
{{{ $slots.main() }}}
// delete-end
// insert-start
{{{ await $slots.main() }}}
// insert-end
```

---

### Removing the `orm` config property
The `orm` config property inside the `config/database.ts` file has been removed in favor of [Naming strategy](../reference/orm/naming-strategy.md)

You can define a custom naming strategy inside a preload file and assign it to the `BaseModel` to have the same impact as the `orm` config property.

```ts
import { BaseModel, NamingStrategyContract } from '@ioc:Adonis/Lucid/Orm'

class CamelCaseStrategy implements NamingStrategyContract {
  // implementation
}

BaseModel.namingStrategy = new CamelCaseStrategy()
```

Make sure to read the  [Naming strategy](../reference/orm/naming-strategy.md) doc to view the available methods.

---

### Application bootstrap process
The application bootstrap process has been changed to be completely async. This change will not impact you unless you manually booted the AdonisJS app for a specific use case. Make sure to read the [github release notes](https://github.com/adonisjs/application/releases/tag/v4.0.0) to understand the change and its impact.

Along with this change, the service providers now receive an instance of the [Application class](../guides/fundamentals/application.md) and not the IoC container. So make sure to update your service provider to reference the container as follows.

```ts
// delete-start
import { IocContract } from '@ioc:Adonis/Core/Application'
// delete-end
// insert-start
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
// insert-end

export default class AppProvider {
  // delete-start
  constructor(protected container: IocContract) {}
  // delete-end
  // insert-start
  constructor(protected app: ApplicationContract) {}
  // insert-end

  public register() {
    // delete-start
    this.container.bind('Binding', () => {})
    // delete-end
    // insert-start
    this.app.container.bind('Binding', () => {})
    // insert-end
  }
}

```

---

### Validator
We have renamed a few validation options and the `blacklist` rule to `notIn`. The changes are made to not use color for defining what is allowed and not allowed.

The `blacklist` rule has been renamed to `notIn`

```ts
{
  username: schema.string({}, [
    // delete-start
    rules.blacklist(['admin', 'super'])
    // delete-end
    // insert-start
    rules.notIn(['admin', 'super'])
    // insert-end
  ])
}
```

The `hostWhitelist` and `hostBlacklist` properties of the `url` validation rules have been renamed to `allowedHosts` and `bannedHosts`.

```ts
{
  twitterHandle: schema.string({}, [
    rules.url({
      // delete-start
      hostWhitelist: ['twitter']
      // delete-end
      // insert-start
      allowedHosts: ['twitter']
      // insert-end
    })
  ])
}
```

---

### Auth
Open the `config/auth.ts` file and rename the `list` property to `guards`. The **guards** keyword is more specific than the generic list keyword.

```ts
{
  guard: 'web',
  // delete-start
  list: {
  // delete-end
  // insert-start
  guards: {
  // insert-end
  }
}
```

---

### Route.makeUrl
The `route.makeUrl` was overloaded with too many options. We tried improving the API and also introduce a new URL builder API.

For the most common use case, there are no breaking changes. But a few, if you are generating URLs for a specific domain.

**The following examples will continue to work**

```ts
// Will continue to work
Route.makeUrl('PostsController.show', { id: 1 })
Route.makeUrl('PostsController.show', {
  id: 1,
  qs: { published: true }
})

// Will continue to work
Route.makeUrl('PostsController.show', { params: { id: 1 } })
Route.makeUrl('PostsController.show', {
  params: { id: 1 },
  qs: { published: true }
})
```

If you were creating the routes for a specific domain, you would have to make the following adjustments.

```ts
Route.makeUrl(
  'PostsController.show',
  { id: 1 },
  // delete-start
  'blog.adonisjs.com'
  // delete-end
  // insert-start
  {
    'blog.adonisjs.com'
  }
  // insert-end
)
```

Also, the `prefixDomain` and the `domainParams` have been removed, and you should use the prefixUrl option. Following is the new ideal API.

```ts
// Pass params as an array
Route.makeUrl('/posts/:id', [1])

// Pass params as an object
Route.makeUrl('/posts/:id', { id: 1 })

// Options as 3rd argument
Route.makeUrl(
  '/posts/:id',
  { id: 1 },
  { qs: { published: true } }
)
```

---

### Remove `X-Download-Options` and `X-XSS-Protection` headers support
Both the headers are deprecated by the HTTP standards. One must use CSP to protect against XSS attacks. AdonisJS already [supports CSP](../guides/security/web-security.md#csp)

---

### Change on `Model.query().count()` behaviour

The model query builder now always returns an array of models instances or directly a model instance and not plain objects.
The following code will not work anymore since it needs extra properties to access the count.

```ts
const count = await SomeModel.query().count('id')
console.log(count[0].count) // undefined
```

To make it work, you need to use the new [`pojo`](https://docs.adonisjs.com/reference/orm/query-builder#pojo) method.

```ts
const count = await SomeModel.query().pojo<{ total: number }>().count('id as total')
console.log(count[0].total) // X
```

## Additions
Following are the new additions to the existing packages.

---

### Convert empty strings to null
You can now configure bodyparser to convert empty strings to null. The goal of the addition is to handle the native behavior of the browsers.

Open the `config/bodyparser.ts` file and set the following option inside the `multipart` and `form` blocks.

```ts
{
  form: {
    convertEmptyStringsToNull: true
  },
  multipart: {
    convertEmptyStringsToNull: true
  }
}
```

---

### Pivot table timestamps and custom attributes
You can now enable timestamps for the pivot table using the `timestamps` property on the relationship. Read the [documentation](../guides/models/relationships.md#pivot-table-timestamps) for complete reference.

```ts
@manyToMany(() => Skill, {
  pivotTimestamps: true
})
public skills: ManyToMany<typeof Skill>
```

Also, during the `create` and `save` calls for a many to many relationship, you can also define pivot columns to insert. [Learn more](../reference/orm/relations/many-to-many.md#create)

---

### Http
Add `request.matchesRoute` method to check if the current request URL matches a route or not.

```ts
if (request.matchesRoute('PostsController.show')) {
}
```

Add `route.redirect` method to register a route that redirects to another route or a URL.

```ts
Route.get('guides/:doc', 'GuidesController.show')
Route.on('docs/:doc').redirect('GuidesController.show')
```

To redirect to an exact URL, you can make use of the `redirectToPath` method.

```ts
Route.on('blog/:slug').redirectToPath('https://medium.com/my-blog')
```

## Bug fixes and other small improvements

- Wrap relationship where constraints to its own group [6b55d5d8d4](https://github.com/adonisjs/lucid/commit/6b55d5d8d4bf56979f2be54cc17ed605ca527e01)
- add `withSchema` method insert query builder [c917fecb02fa4](https://github.com/adonisjs/lucid/commit/c917fecb02fa4675d86472151f479731373f2f71)
- deprecate `model.preload` in favor of `model.load` [be4e0d2f6b1a8](https://github.com/adonisjs/lucid/commit/be4e0d2f6b1a8f4846236f6acbd345ae1ee89253)
- add `withAggregate` query builder method [d59ed5c88ab](https://github.com/adonisjs/lucid/commit/d59ed5c88ab11b5e88828db85c917ad20fd81ebe)
- add support for `wherePivotNull` variant [b623f6b4388](https://github.com/adonisjs/lucid/commit/b623f6b4388028f91f802ef5199f81f8223785d7)
- add support to get `pojo` from model queries [4ef559215a0961](https://github.com/adonisjs/lucid/commit/4ef559215a09619ce848fe15cc94f3451a5d82f4)
- add option to sort migrations with naturalSort option [cbf0f3c88ce01](https://github.com/adonisjs/lucid/commit/cbf0f3c88ce01126408bb0a4872605e8c6540c9d)
- wrap relationship where clause to its own group [6b55d5d8d4bf](https://github.com/adonisjs/lucid/commit/6b55d5d8d4bf56979f2be54cc17ed605ca527e01)
- Fix issue where group middleware we applied in wrong order [334d0f92a530](https://github.com/adonisjs/http-server/commit/334d0f92a530c267c697d490d03ac2dc75bb4326)
- rename cookie name to all caps XSRF-TOKEN [789fd0d3ee](https://github.com/adonisjs/shield/commit/789fd0d3ee156910bb349b95dff7130271e843b0)
- redis pub/sub layer now accepts any data type [a2f2cc980f2573bbf](https://github.com/adonisjs/redis/commit/a2f2cc980f2573bbf137f42ed43ecc9906111e5d)
- auth - add support to define custom connection for tokens provider [ea71af573c85373](https://github.com/adonisjs/auth/commit/ea71af573c85373694d0ae75a5c88fa895df383b)
- add revoke method to api tokens guard [a48cee194596d](https://github.com/adonisjs/auth/commit/a48cee194596d0096de38fba86f5b39f5a759861)
