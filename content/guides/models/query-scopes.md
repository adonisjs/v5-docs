---
summary: Learn, how to use query scopes to define reusable query builder functions.
---

Query scopes are the reusable function to apply to a query builder instance to modify the query.

The methods are defined as static properties on the model class and receive the current query as the first argument. For example:

```ts
// title: app/Models/Post.ts
import { DateTime } from 'luxon'

import {
  BaseModel,
  column,
  scope // 👈 import scope method
} from '@ioc:Adonis/Lucid/Orm'

export default class Post extends BaseModel {
  public static published = scope((query) => {
    query.where('publishedOn', '<=', DateTime.utc().toSQLDate())
  })
}
```

You can apply the `published` scope on a query using the `withScopes` method. It accepts a callback and gives you access to all the scopes as methods.

```ts
Post
  .query()
  .withScopes((scopes) => scopes.published())
```

## Passing arguments to the scopes
The query scopes can also accept arguments. For example: Creating a scope that accepts a user object to scope the projects they can view.

```ts
import { DateTime } from 'luxon'
import User from 'App/Models/User'
import { BaseModel, column, scope } from '@ioc:Adonis/Lucid/Orm'

export default class Project extends BaseModel {

  public static visibleTo = scope((query, user: User) => {
    if (user.isAdmin) {
      return
    }

    /**
     * Non-admin users can only view their own team's projects
     */
    query.where('teamId', user.teamId)
  })

}
```

Now, you can call the `scopes.visibleTo` method and pass it the required arguments.

```ts
Project
  .query()
  .withScopes((scopes) => scopes.visibleTo(auth.user))
```

## Calling scopes within the scopes
Since the scope method receives an instance of the [Model query builder](../../reference/database/orm/query-builder.md), you can also reference other model scopes within the scope callback. For example:

```ts
import {
  scope,
  column,
  BaseModel,
  ModelQueryBuilderContract,
} from '@ioc:Adonis/Lucid/Orm'

type Builder = ModelQueryBuilderContract<typeof Post>

export default class Post extends BaseModel {
  public static firstScope = scope((query: Builder) => {
    query.withScopes((scopes) => scopes.secondScope())
  })

  public static secondScope = scope((query) => {
    query.whereNull('deletedAt')
  })
}
```

#### Noticed the `Builder` type we created above?

The `scope` method is not aware of the Model it is used inside (a TypeScript limitation) and hence it cannot infer the Query builder type for the model as well. Therefore, we need to type hint the `builder` property as follow:

```ts
// highlight-start
type Builder = ModelQueryBuilderContract<typeof Post>
// highlight-end

public static firstScope = scope(
  // highlight-start
  (query: Builder) => {
  // highlight-end
  }
)
```
