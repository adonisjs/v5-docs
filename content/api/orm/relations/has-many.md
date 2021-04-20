---
summary: API documentation for Lucid HasMany relationship
---

The [HasMany relationship class](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/HasMany/index.ts) manages the has many relationship between two models.

You will not find yourself directly working with this class. However, an instance of the class can be accessed using the `Model.$getRelation` method.

```ts
import { BaseModel, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Post from 'App/Models/Post'

class User extends BaseModel {
  @hasMany(() => Post)
  public posts: HasMany<typeof Post>
}
```

```ts
User.$getRelation('posts').relationName
User.$getRelation('posts').type
User.$getRelation('posts').relatedModel()
```

## Methods/Properties
Following is the list of methods and properties available on the `HasMany` relationship.

### type
The type of the relationship. The value is always set to `hasMany`.

```ts
class User extends BaseModel {
  @hasMany(() => Post)
  public posts: HasMany<typeof Post>
}

User.$getRelation('posts').type // 'hasMany'
```

---

### relationName
The relationship name. It is a property name defined on the parent model.

```ts
class User extends BaseModel {
  @hasMany(() => Post)
  public posts: HasMany<typeof Post>
}

User.$getRelation('posts').relationName // 'posts'
```

---

### serializeAs
The name to be used for serializing the relationship. You can define it using the decorator options.

```ts
class User extends BaseModel {
  @hasMany(() => Post, {
    serializeAs: 'articles'
  })
  public posts: HasMany<typeof Post>
}
```

---

### booted
Find if the relationship has been booted. If not, call the `boot` method.

---

### boot
Boot the relationship. Lucid models public APIs call this method internally, and you never have to boot the relationship manually.

---

### model
Reference to the parent model (the one that defines the relationship).

```ts
class User extends BaseModel {
  @hasMany(() => Post)
  public posts: HasMany<typeof Post>
}

User.$getRelation('posts').model // User
```

---

### relatedModel
Reference to the relationship model. The property value is a function that returns the related model.

```ts
class User extends BaseModel {
  @hasMany(() => Post)
  public posts: HasMany<typeof Post>
}

User.$getRelation('posts').relatedModel() // Post
```

---

### localKey
The `localKey` for the relationship. You must read the [NamingStrategy](../naming-strategy.md#relationlocalkey) doc to learn more about how the key name is computed.

You can also define the `localKey` explicitly. Do make sure you mention the model property name and NOT the database column name.

```ts
class User extends BaseModel {
  @column()
  public id: number

  @hasMany(() => Post, {
    localKey: 'id', // id column on "User" model
  })
  public posts: HasMany<typeof Post>
}
```

---

### foreignKey
The `foreignKey` for the relationship. You must read the [NamingStrategy](../naming-strategy.md#relationlocalkey) doc to learn more about how the key name is computed.

You can also define the `foreignKey` explicitly. Do make sure you mention the model property name and NOT the database column name.

```ts
class User extends BaseModel {
  @column()
  public id: number

  @hasMany(() => Post, {
    foreignKey: 'userId', // userId column on "Post" model
  })
  public posts: HasMany<typeof Post>
}
```

---

### onQuery
The `onQuery` method is an optional hook to modify the relationship queries. You can define it at the time of declaring the relation.

```ts
class User extends BaseModel {
  @column()
  public id: number

  @hasMany(() => Post, {
    onQuery(query) {
      query.where('isPublished', true)
    }
  })
  public posts: HasMany<typeof Post>
}
```

If you want to preload a nested relationship using the `onQuery` hook, then make sure to put it inside the `!query.isRelatedSubQuery` conditional because sub-queries are **NOT executed directly**, they are used inside other queries.

```ts
class User extends BaseModel {
  @column()
  public id: number

  @hasMany(() => Post, {
    onQuery(query) {
      // highlight-start
      if (!query.isRelatedSubQuery) {
        query.preload('comments')
      }
      // highlight-end
    }
  })
  public posts: HasMany<typeof Post>
}
```

---

### setRelated
Set a relationship on the parent model instance. The methods accept the parent model as the first argument and the related model instance as the second argument.

You must ensure that both the model instances are related to each other before calling this method.

```ts
const user = new User()
const post = new Post()

User.$getRelation('posts').setRelated(user, [post])
```

---

### pushRelated
The `pushRelated` method pushes the relationship to the existing relationship value array.

```ts
const user = new User()

User.$getRelation('posts').pushRelated(user, new Post())
User.$getRelation('posts').pushRelated(user, new Post())
User.$getRelation('posts').pushRelated(user, new Post())

user.posts.length // 3
```

---

### setRelatedForMany
Set the relationships on more than one parent model. The method accepts an array of the parent models as the first argument and an array of related models as the second argument.

Lucid internally calls this with the results of the preloader.

```ts
const users = [
  User {
    id: 1,
  },
  User {
    id: 2,
  },
  User {
    id: 3,
  }
]

const posts = [
  Post {
    id: 1,
    user_id: 1,
  },
  Post {
    id: 2,
    user_id: 1,
  },
  Post {
    id: 3,
    user_id: 2,
  },
  Post {
    id: 4,
    user_id: 3,
  }
]

User.$getRelation('posts').setRelatedForMany(users, posts)
```

---

### client
Returns the reference to the [HasManyQueryClient](#query-client). The query client exposes the API to persist/fetch related rows from the database.

---

### hydrateForPersistance
Hydrates the values for persistence by defining the foreignKey value. The method accepts the parent model as the first argument and an object or the related model instance as the second argument.

```ts
const user = new User()
user.id = 1

const post = new Post()
User.$getRelation('posts').hydrateForPersistance(user, post)

console.log(post.userId === user.id) // true
```

---

### eagerQuery
Returns an instance of the [HasManyQueryBuilder](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/HasMany/QueryBuilder.ts). The query builder has the same API as the [Model query builder](../query-builder.md)

---

### subQuery
Returns an instance of the [HasManySubQueryBuilder](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/HasMany/SubQueryBuilder.ts). The sub queries are not meant to be executed and mainly used by the [withCount](../query-builder.md#withcount) and [whereHas](../query-builder.md#wherehas) methods.

## Query client
The query client exposes the API to persist/fetch related rows from the database. You can access the query client for a relationship using the `related` method.

```ts
const user = await User.find(1)

user.related('posts') // HasManyClientContract
```

### create
Please create a new relationship model instance and persist it to the database right away.

```ts
const post = await user
  .related('posts')
  .create({
    title: 'Adonis 101'
  })
```

The `create` method inherits the transaction client, or the connection name defined on the parent model instance. For example:

```ts
const trx = await Database.transaction()
const user = await User.query({ client: trx }).first()

/**
* Uses the `$trx` property from the `user` instance to
* persist relationship
*/
await user.related('posts').create()

await trx.commit()
```

---

### createMany
Create multiple instances of a relationship model and persist them to the database. The method accepts an array of objects to persist.

- One insert query is issued for each model instance to ensure that we execute the lifecycle hooks for every individual instance.
- All the insert queries are internally wrapped inside a transaction. In case of an error, we will roll everything back.

```ts
await user.related('posts').createMany([
  {
    title: 'Adonis 101',
  },
  {
    title: 'Lucid 101'
  }
])
```

---

### save
The save method persists an existing instance of the relationship.

Like the `create` method, the `save` method also uses the transaction client/connection name from the parent model.

```ts
const post = new Post()
post.title = 'Adonis 101'

const post = await user
  .related('post')
  .save(post)
```

---

### saveMany
The `saveMany` method persists an array of related model instances to the database.

- One insert query is issued for each model instance to ensure that we execute the lifecycle hooks for every individual instance.
- All the insert queries are internally wrapped inside a transaction. In case of an error, we will roll everything back.

```ts
const post = new Post()
post.title = 'Adonis 101'

const post1 = new Post()
post1.title = 'Lucid 101'

const post2 = new Post()
post2.title = 'Validator 101'

const post = await user
  .related('post')
  .saveMany([post, post1, post2])
```

---

### firstOrCreate
The `firstOrCreate` method works similar to the [static firstOrCreate](../base-model.md#static-firstorcreate) method on the base model. However, we **implicitly adds the foreignKey and its value** to the search payload.

```ts
await user
  .related('posts')
  .firstOrCreate({}, {
    title: 'Adonis 101',
  })
```

---

### updateOrCreate
The `updateOrCreate` method works similar to the [static updateOrCreate](../base-model.md#static-updateorcreate) method on the base model. However, we **implicitly adds the foreignKey and its value** to the search payload.

```ts
await user
  .related('posts')
  .updateOrCreate({}, {
    title: 'Adonis 101',
  })
```

---

### fetchOrCreateMany
The `fetchOrCreateMany` method works similar to the [static fetchOrCreateMany](../base-model.md#static-fetchorcreatemany) method on the base model. However, we **implicitly add the foreignKey as the lookup key** for finding unique rows.

In the following example, only the posts with a **unique slug** for **a given user** will be created.

```ts
const posts = [
  {
    title: 'Adonis 101',
    slug: 'adonis-101',
  },
  {
    title: 'Lucid 101',
    slug: 'lucid-101',
  }
]

await user
  .related('posts')
  .fetchOrCreateMany(posts, 'slug')
```

---

### updateOrCreateMany
The `updateOrCreateMany` method works similar to the [static updateOrCreateMany](../base-model.md#static-updateorcreatemany) method on the base model. However, we **implicitly add the foreignKey as the lookup key** for finding unique rows.

In the following example, only the posts with a **unique slug** for **a given user** will be created.

```ts
const posts = [
  {
    title: 'Adonis 101',
    slug: 'adonis-101',
  },
  {
    title: 'Lucid 101',
    slug: 'lucid-101',
  }
]

await user
  .related('posts')
  .updateOrCreateMany(posts, 'slug')
```

---

### query
Returns an instance of the [HasManyQueryBuilder](#query-builder).

## Query Builder
The [HasManyQueryBuilder](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/HasMany/QueryBuilder.ts) has the following additional methods on top of a standard model query builder.

You can access the relationship query builder as follows:

```ts
const user = await User.find(1)

user.related('posts').query() // HasManyQueryBuilder
```

### groupLimit
The `groupLimit` method uses [SQL window functions](https://www.sqlservertutorial.net/sql-server-window-functions/sql-server-row_number-function/) to add a limit to each group during relationship preloading. Please read the [preloading guide](../../guides) to learn why and when you need the `groupLimit` method.

```ts
await User.query().preload('posts', (query) => {
  query.groupLimit(10)
})
```

### groupOrderBy
Add an order by clause to the group limit query. The method has the same API as the `orderBy` method on the standard query builder.

:::note

You only need to apply `groupOrderBy` when using the `groupLimit` method.

:::

```ts
await User.query().preload('posts', (query) => {
  query
    .groupLimit(10)
    .groupOrderBy('posts.created_at', 'desc')
})
```
