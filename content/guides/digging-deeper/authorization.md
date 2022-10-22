---
summary: Introduction to the AdonisJS authorization package `@adonisjs/bouncer`. Bouncer allows you to extract the authorization logic to standalone actions or policies.
---

:::tip
**Visual learner?** - Checkout the [AdonisJS Bouncer](https://adocasts.com/series/adonisjs-bouncer) free screencasts series from our friends at Adocasts.
:::

AdonisJS ships with an authorization framework to help you authorize user actions against a given resource. For example, checking if a logged-in user is allowed to edit a given post or not.

The support for authorization is added by the `@adonisjs/bouncer` package, and you must install it separately.

:::note

The `@adonisjs/bouncer` package needs the `@adonisjs/auth` package to look up the currently logged-in user. Make sure to configure the auth package first.

:::

:::div{class="setup"}

:::codegroup

```sh
// title: 1. Install
npm i @adonisjs/bouncer
```

```sh
// title: 2. Configure
node ace configure @adonisjs/bouncer

# CREATE: start/bouncer.ts
# CREATE: contracts/bouncer.ts
# UPDATE: tsconfig.json { types += "@adonisjs/bouncer" }
# UPDATE: .adonisrc.json { commands += "@adonisjs/bouncer/build/commands" }
# UPDATE: .adonisrc.json { providers += "@adonisjs/bouncer" }
# UPDATE: .adonisrc.json { preloads += "./start/bouncer" }
# CREATE: ace-manifest.json file
```

:::

## Basic example
The main goal of the Bouncer package is to help you extract the authorization logic to actions or policies instead of writing it everywhere in your codebase.

You can define a Bouncer action inside the `start/bouncer.ts` file. The `Bouncer.define` method accepts the name of the action and closure to write the authorization logic.

```ts
import Post from 'App/Models/Post'
import User from 'App/Models/User'

export const { actions } = Bouncer
  .define('viewPost', (user: User, post: Post) => {
    return post.userId === user.id
  })
```

You can define multiple actions by chaining the `.define` method for multiple times. For example:

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

Once you have defined the action, you can access it inside your route handlers using the `ctx.bouncer` object. 

The `bouncer.authorize` method accepts the action name and the arguments it receives. The `user` is **inferred from the currently logged-in user**. Hence there is no need to pass the user explicitly.

```ts
import Route from '@ioc:Adonis/Core/Route'
import Post from 'App/Models/Post'

Route.get('posts/:id', async ({ bouncer, request }) => {
  const post = await Post.findOrFail(request.param('id'))

  // highlight-start
  await bouncer.authorize('viewPost', post)
  // highlight-end
})
```

## Defining actions
You can define an inline action using the `Bouncer.define` method. Since permissions are usually checked against a user, your action must accept the user as the first argument, followed by any other data it needs to express the authorization logic.

```ts
import Post from 'App/Models/Post'
import User from 'App/Models/User'

export const { actions } = Bouncer
  .define('viewPost', (
    user: User, // User should always be the first argument
    post: Post
  ) => {
    return post.userId === user.id
  })
```

### Using different User models

You are not only limited to use the `User` model. You can also define actions that need a different user model, and Bouncer will use the TypeScript types inference to filter down the actions applicable for a given user type.

Check out the following video as an example of the same.

### Guest user
At times you may want to write actions that can work without a user as well. For example, You want to allow a guest visitor to view all the published posts. However, an unpublished post should only be visible to the post author.

In this scenario, you must set the `options.allowGuest` property to `true`.

:::note

If `allowGuest !== true` and there is no logged-in user, then Bouncer will not even call the action and deny the request implicitly.

:::

```ts
export const { actions } = Bouncer
  .define('viewPost', (user: User | null, post: Post) => {
    if (post.status === 'published') {
      return true
    }

    if (!user) {
      return false
    }

    return post.userId === user.id
  }, {
    allowGuest: true, // 👈
  })
```

### Deny access
An action can deny the access by returning a ** non-true** value from the action closure, and Bouncer will convert that to a `403` status code.

However, you can also return a custom message and status code from the action itself using the `Bouncer.deny` method.

```ts
export const { actions } = Bouncer
  .define('viewPost', (user: User, post: Post) => {
    if (post.userId === user.id || post.status === 'published') {
      return true
    }

    return Bouncer.deny('Post not found', 404)
  })
```

## Authorizing actions
You can authorize a user against a set of pre-defined actions using the `bouncer.authorize` method. It accepts the name of the action to authorize, along with the arguments it accepts (excluding the first argument reserved for the user).

The `authorize` method raises an [AuthorizationException](https://github.com/adonisjs/bouncer/blob/9c230c5f5e52779462c907fb46448f1f53f31fd3/src/Exceptions/AuthorizationException.ts), when the action denies the access.

```ts
Route.get('posts/:id', async ({ bouncer, request }) => {
  const post = await Post.findOrFail(request.param('id'))

  // Authorize user access for a given post
  await bouncer.authorize('viewPost', post)
})
```

By default, the `ctx.bouncer` object authorizes the actions against the currently logged-in user. However, you can define a user explicitly using the `forUser` method.

```ts
const admin = await Admin.findOrFail(1)

// Get a child instance for admin model
const adminAuthorizer = bouncer.forUser(admin)

await adminAuthorizer.authorize('viewPost', post)
```

### bouncer.allows
The `bouncer.allows` method accepts the same set of arguments as the `bouncer.authorize` method. However, instead of throwing an exception, it returns a boolean value indicating if an action is allowed or not.

```ts
if (await bouncer.allows('viewPost', post)) {
  // do something
}
```

### bouncer.denies
The opposite of `bouncer.allows` is the `bouncer.denies` method.

```ts
if (await bouncer.denies('editPost', post)) {
  // do something
}
```

## Bouncer hooks
Bouncer hooks allow you to define `before` and `after` lifecycle hooks. You can use these lifecycle hooks to grant special privileges to an admin or a superuser.

### Before hook
In the following example, a superuser is granted all the access within the `before` lifecycle hook.

```ts
// title: start/bouncer.ts
Bouncer.before((user: User | null) => {
  if (user && user.isSuperUser) {
    return true
  }
})
```

- The actual action callback is never executed when a before hook returns a `true` or a `false` value. 
- Make sure to return `undefined` if you want Bouncer to execute the next hook or the action callback.
- The `before` hook is always executed, even when there is no logged-in user. Make sure to handle the use case of a missing user inside the hook callback.
- The `before` hook receives the **action name** as the second argument.

### After hook
The `after` hooks are executed after executing the action callback. If an `after` hook returns a `true` or a `false` value, it will be considered the final response, and we will discard the response of the action.

```ts
Bouncer.after((user: User | null, action, actionResult) => {
  if (actionResult.authorized) {
    console.log(`${action} was authorized`)
  } else {
    console.log(`${action} denied with "${actionResult.errorResponse}" message`)
  }
})
```

## Using policies
Expressing all the application permissions as actions inside a single file is not practical, and hence bouncer allows you to extract the permissions to dedicated policy files.

Usually, you will create one policy for a given resource. For example, a policy for managing the **Post resource** permissions, another policy to manage the **Comment resource** permissions, and so on.

### Creating a policy file

You can create a policy by running the following Ace command. The policies are stored inside the `app/Policies` directory. However, you can customize the location by updating the `namespaces.policies` property inside the [.adonisrc.json file](../fundamentals/adonisrc-file.md#namespaces).

```sh
node ace make:policy Post

# CREATE: app/Policies/PostPolicy.ts
```

Every policy class extends the `BasePolicy`, and the **class public methods are treated as the policy actions**.

The policy actions work similarly to the standalone bouncer actions. The first parameter is reserved for the user, and the action can accept any number of additional parameters.

```ts
import User from 'App/Models/User'
import Post from 'App/Models/Post'
import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'

export default class PostPolicy extends BasePolicy {
  public async view(user: User, post: Post) {
    return post.userId === user.id
  }
}
```

### Registering the policy with Bouncer

Also, make sure to register the newly created policy inside the `start/bouncer.ts` file. The `registerPolicies` method accepts a key-value pair. The key is the policy name, and value is a function to import the Policy file lazily.

```ts
export const { policies } = Bouncer.registerPolicies({
  PostPolicy: () => import('App/Policies/PostPolicy')
})
```

### Using policy
Once the policy has been registered, you can access it using the `bouncer.with` method.

```ts
import Route from '@ioc:Adonis/Core/Route'
import Post from 'App/Models/Post'

Route.get('posts/:id', async ({ bouncer }) => {
  const post = await Post.findOrFail(1)
  // highlight-start
  await bouncer
    .with('PostPolicy')
    .authorize('view', post)
  // highlight-end
})
```

### Policy hooks
Policies can also define hooks by implementing the `before` and the `after` methods. Again, hooks follow the same lifecycle as the [standalone bouncer hooks](#bouncer-hooks).

```ts
import User from 'App/Models/User'
import Post from 'App/Models/Post'
import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'

export default class PostPolicy extends BasePolicy {
  public async before(user: User | null) {
    if (user && user.isSuperUser) {
      return true
    }
  }

  public async view(user: User, post: Post) {
    return post.userId === user.id
  }
}
```

### Guest user
To authorize requests for the guest users, you will have to mark the policy actions with the `@action` decorator and set the `options.allowGuests = true`.

```ts
export default class PostPolicy extends BasePolicy {

  @action({ allowGuest: true })
  public async view(user: User | null, post: Post) {
    if (post.status === 'published') {
      return true
    }

    if (!user) {
      return false
    }

    return post.userId === user.id
  }
}
```

## Usage inside the Edge templates
You can use the `@can` and the `@cannot` tags to display the specific portion of your markup conditionally. For example: Hiding the links to delete and edit the post when the user cannot perform those actions.

```edge
@can('editPost', post)
  <a href="{{ route('posts.edit', [post.id]) }}"> Edit </a>
@end

@can('deletePost', post)
  <a href="{{ route('posts.delete', [post.id]) }}"> Delete </a>
@end
```

You can also reference the actions of a policy using the dot notation. The first segment is the policy name, and the second section is the policy action.

:::note

The policy names are inside the `start/bouncer.ts` file. The key of the `registerPolicies` object is the policy name.

:::

```edge
@can('PostPolicy.edit', post)
  <a href="{{ route('posts.edit', [post.id]) }}"> Edit </a>
@end
```

Also, you can write the inverse conditional using the `@cannot` tag.

```edge
@cannot('PostPolicy.edit')
  <!-- Markup -->
@end
```

The `@can` and the `@cannot` tags authorize the actions against the currently logged-in user. If the underlying bouncer/policy action needs a different user, you will have to pass an explicit authorizer instance.

```edge
@can('PostPolicy.edit', bouncer.forUser(admin), post)
@end
```

In the above example, the second argument, `bouncer.forUser(admin)`, is a child instance of bouncer for a specific user, followed by the action arguments.
