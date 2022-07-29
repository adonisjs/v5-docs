---
summary: Data models query builder complete reference guide
---

The [ModelQueryBuilder](https://github.com/adonisjs/lucid/blob/develop/src/Orm/QueryBuilder/index.ts) extends the standard [QueryBuilder](../database/query-builder.md) and hence all of the methods are available to the model query builder as well.

:::note

This document just covers the additional methods/properties exclusive to the model query builder only.

:::

The model query builder always returns an array of models instances and not plain objects.

Also, the model query builder is aware of the model and its relationships and hence provides an easy to use API to work with relationships.

```ts
class User extends BaseModel {}

// Returns model query builder instance
User.query()
```

## Methods/Properties
Following is the list of the methods/properties available on the model query builder

### preload
Pre-load/Eager-load relationships for the model.

```ts
const users = await User.query().preload('posts')
```

The `preload` method will perform the required queries to load the posts for all the users and then set them on the user instance.

Optionally, you can pass a callback to modify the relationship query. The callback receives the model query builder for the related model.

```ts
User.query().preload('posts', (postsQuery) => {
  postsQuery.where('status', 'published')
})
```

You can also preload multiple relationships by calling the `preload` method.

```ts
User.query().preload('posts').preload('profile')
```

The nested relationships can be loaded by the calling the `preload` method on the related model query builder. The following example fetches a tree of `users -> posts -> comments -> user`

```ts
const users = await User
  .query()
  .preload('posts', (postsQuery) => {
    postsQuery.preload('comments', (commentsQuery) => {
      commentsQuery.preload('user')
    })
  })
```

---

### withCount
The `withCount` method performs a sub query to count the total number of rows for a relationship.

```ts
const users = await User.query().withCount('posts')

users.forEach((user) => {
  console.log(user.$extras.posts_count)
})
```

The count is added to the model `$extras` object, since it is not a regular model attribute and created on the fly for just one query.

Also, `withCount` and `preload` are not related to each other. If you want to load relationship rows and also get the count, then you need to call both the methods.

```ts
await User
  .query()
  .withCount('posts')
  .preload('posts')
```

You can also define a custom attribute name for the count value.

```ts
const user = await User
  .query()
  .withCount('posts', (query) => {
    query.as('totalPosts')
  })
  .firstOrFail()

console.log(user.$extras.totalPosts)
```

---

### withAggregate
The `withAggregate` method allows you define a custom aggregate function. For example: `sum` the account balance.

```ts
const user = await User
  .query()
  .withAggregate('accounts', (query) => {
    query.sum('balance').as('accountsBalance')
  })
  .firstOrFail()

console.log(user.$extras.accountsBalance)
```

---

### has
The `has` method allows you to limit the parent model rows by checking for the existence of a given relationship.

For example: Get a list of users who have one or more posts.

```ts
const users = await User.query().has('posts')
```

You can also define a custom count.

```ts
await User.query().has('posts', '>=', 2)
```

The `has` method has following variants.

| Method | Description |
|--------|-------------|
| `orHas` | Adds a or has clause for a given relationship. | 
| `andHas` | Alias for the `has` method. | 
| `doesntHave` | Opposite of the `has` method. | 
| `orDoesntHave` | Opposite of the `orHas` method. | 
| `andDoesntHave` | Alias for the `doesntHave` method. | 

---

### whereHas
Similar to the `has` method. However, the `whereHas` method allows defining additional constraints by passing a callback as the 2nd argument.

For example: Get a list of users who have one or more posts **published** posts.

```ts
await User.query().whereHas('posts', (postsQuery) => {
  postsQuery.where('status', 'published')
})
```

The `whereHas` method has following variants

| Method | Description |
|--------|-------------|
| `orWhereHas`  | Adds a or has clause for a given relationship. |
| `andWhereHas`  | Alias for the `whereHas` method. |
| `whereDoesntHave`  | Opposite of the `whereHas` method. |
| `orWhereDoesntHave`  | Opposite of the `orWhereHas` method. |
| `andWhereDoesntHave`  | Alias for the `whereDoesntHave` method. |

### sideload
The `sideload` method works as a pipeline for passing an arbitrary object to the model instance(s) created after executing the query.

For example: Passing the currently logged in user.

```ts
const users = await User.query().sideload(auth.user)

users.forEach((user) => {
  console.log(user.$sideloaded.user === auth.user) // true
})
```

The `sideloaded` value is passed down to the preloaded relationships as well.

---

### withScopes
The `withScopes` method allows you to leverage the query scopes defined on the model.

Begin by defining a query scope.

```ts
import { BaseModel, scope } from '@ioc:Adonis/Lucid/Orm'

export default class Team extends BaseModel {

  public static forUser = scope((query, user: User) => {
    const subQuery = Database
      .from('user_teams')
      .select('team_id')
      .where('user_teams.user_id', user.id)

    query.whereIn('id', subQuery)
  })

}
```

The `forUser` property is a query scope that accepts the `user` object to fetch the teams of the currently logged in user.

Now you can use the query scope as follows

```ts
Team
  .query()
  .withScopes((scopes) => scopes.forUser(auth.user))
```

---

### apply

Alias for the [`withScopes`](./query-builder.md#withscopes) method.

```ts
Team
  .query()
  .apply((scopes) => scopes.forUser(auth.user))
```

---

### pojo
The `pojo` method returns the model results as an **array of plain JavaScript objects** and not an array of model instances.

Also, no lifecycle hooks are executed when using the `pojo` method, since hooks needs model instances to work.

```ts
const posts = await Post.query().pojo()

console.log(posts[0] instanceof Post) // false
```

---

### paginate
The `paginate` method on the ORM query builder returns an instancer of the [ModelPaginator](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Paginator/index.ts). The Model paginator class has an additional `.serialize` method to serialize the models.

```ts
const posts = await Post.query().paginate(1)
const paginationJSON = posts.serialize({
  fields: ['title', 'id']
})
```

---

### model
Reference to the `model` from which the query instance was created.

```ts
console.log(User.query().model === User) // true
```
