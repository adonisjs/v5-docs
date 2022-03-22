---
summary: API documentation for Lucid BelongsTo relationship
---

The [BelongsTo relationship class](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/BelongsTo/index.ts) manages the belongs to the relationship between two models.

You will not find yourself directly working with this class. However, an instance of the class can be accessed using the `Model.$getRelation` method.

```ts
import { BaseModel, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'

class Post extends BaseModel {
  @belongsTo(() => User)
  public author: BelongsTo<typeof User>
}
```

```ts
Post.$getRelation('author').relationName
Post.$getRelation('author').type
Post.$getRelation('author').relatedModel()
```

## Methods/Properties
Following is the list of methods and properties available on the `BelongsTo` relationship.

### type
The type of the relationship. The value is always set to `belongsTo`.

```ts
class Post extends BaseModel {
  @belongsTo(() => User)
  public author: BelongsTo<typeof User>
}

Post.$getRelation('author').type // 'belongsTo'
```

---

### relationName
The relationship name. It is a property name defined on the parent model.

```ts
class Post extends BaseModel {
  @belongsTo(() => User)
  public author: BelongsTo<typeof User>
}

Post.$getRelation('author').relationName // 'author'
```

---

### serializeAs
The name to use for serializing the relationship. You can define it using the decorator options.

```ts
class Post extends BaseModel {
  @belongsTo(() => User, {
    serializeAs: 'user'
  })
  public author: BelongsTo<typeof User>
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
class Post extends BaseModel {
  @belongsTo(() => User)
  public author: BelongsTo<typeof User>
}

Post.$getRelation('author').model // Post
```

---

### relatedModel
Reference to the relationship model. The property value is a function that returns the related model.

```ts
class Post extends BaseModel {
  @belongsTo(() => User)
  public author: BelongsTo<typeof User>
}

Post.$getRelation('author').relatedModel() // User
```

---

### localKey
The `localKey` for the relationship. You must read the [NamingStrategy](../naming-strategy.md#relationlocalkey) doc to learn more about how the key name is computed.

You can also define the `localKey` explicitly. Do make sure you mention the model property name and NOT the database column name.

```ts
class Post extends BaseModel {
  @belongsTo(() => User, {
    localKey: 'id', // id column on "User" model
  })
  public author: BelongsTo<typeof User>
}
```

---

### foreignKey
The `foreignKey` for the relationship. You must read the [NamingStrategy](../naming-strategy.md#relationlocalkey) doc to learn more about how the key name is computed.

You can also define the `foreignKey` explicitly. Do make sure you mention the model property name and NOT the database column name.

```ts
class Post extends BaseModel {
  @column()
  public userId: number

  @belongsTo(() => User, {
    foreignKey: 'userId', // userId column on "Post" model
  })
  public author: BelongsTo<typeof User>
}
```

---

### onQuery
The `onQuery` method is an optional hook to modify the relationship queries. You can define it at the time of declaring the relation.

```ts
class Post extends BaseModel {
  @column()
  public userId: number

  @belongsTo(() => User, {
    onQuery(query) {
      query.where('accountStatus', 'active')
    }
  })
  public author: BelongsTo<typeof User>
}
```

If you want to preload a nested relationship using the `onQuery` hook, then make sure to put it inside the `!query.isRelatedSubQuery` conditional because sub-queries are **NOT executed directly**, they are used inside other queries.

```ts
class Post extends BaseModel {
  @column()
  public userId: number

  @belongsTo(() => User, {
    onQuery(query) {
      // highlight-start
      if (!query.isRelatedSubQuery) {
        query.preload('profile')
      }
      // highlight-end
    }
  })
  public author: BelongsTo<typeof User>
}
```

---

### setRelated
Set a relationship on the parent model instance. The methods accept the parent model as the first argument and the related model instance as the second argument.

You must ensure that both the model instances are related to each other before calling this method.

```ts
const user = new User()
const post = new Post()

Post.$getRelation('author').setRelated(user, post)
```

---

### pushRelated
The `pushRelated` method pushes the relationship to the existing relationship value array. However, for the `belongsTo` relationship, the method works similar to `setRelated`.

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
    userId: 1,
  },
  Post {
    id: 2,
    userId: 1,
  },
  Post {
    id: 3,
    userId: 3,
  },
  Post {
    id: 4,
    userId: 2,
  },
]

Post.$getRelation('author').setRelatedForMany(posts, users)
```

---

### client
Returns the reference to the [BelongsToQueryClient](#query-client). The query client exposes the API to persist/fetch related rows from the database.

---

### hydrateForPersistance
Hydrates the values for persistence by defining the `foreignKey` value. The method accepts the parent model as the first argument and an object or the related model instance as the second argument.

```ts
const user = new User()
user.id = 1

const post = new Post()
post.title = 'Adonis 101'

Post.$getRelation('author').hydrateForPersistance(post, user)

console.log(post.userId === user.id) // true
```

---

### eagerQuery
Returns an instance of the [BelongsToQueryBuilder](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/BelongsTo/QueryBuilder.ts). The query builder has the same API as the [Model query builder](../query-builder.md)

---

### subQuery
Returns an instance of the [BelongsToSubQueryBuilder](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/BelongsTo/SubQueryBuilder.ts). The sub queries are not meant to be executed and mainly used by the [withCount](../query-builder.md#withcount) and [whereHas](../query-builder.md#wherehas) methods.

## Query client
The query client exposes the API to persist/fetch related rows from the database. You can access the query client for a relationship using the `related` method.

```ts
const post = await Post.find(1)

post.related('author') // BelongsToClientContract
```

### associate
Associate the related model with the parent model. For example, associate the user with the post.

```ts
const user = await User.find(1)
const post = await Post.find(1)

await post
  .related('author')
  .associate(user)
```

The `associate` method inherits the transaction client, or the connection name defined on the parent model instance. For example:

```ts
const trx = await Database.transaction()
const post = await Post.query({ client: trx }).first()
const user = await User.query({ client: trx }).first()

/**
* Uses the `$trx` property from the `post` instance to
* persist relationship
*/
await post.related('author').associate(user)

await trx.commit()
```

---

### dissociate
The `dissociate` method removes the relationship by setting the foreign key value to `null`.

```ts
const post = await Post.find(1)
await post.dissociate()

post.userId // null
```

---

### query
Returns an instance of the [BelongsToQueryBuilder](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/BelongsTo/QueryBuilder.ts). The query builder has the same API as the [Model query builder](../query-builder.md).
