---
summary: API documentation for Lucid HasOne relationship
---

The [HasOne relationship class](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/HasOne/index.ts) manages the has one relationship between two models.

You will not find yourself directly working with this class. However, an instance of the class can be accessed using the `Model.$getRelation` method.

```ts
import { BaseModel, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import Profile from 'App/Models/Profile'

class User extends BaseModel {
  @hasOne(() => Profile)
  public profile: HasOne<typeof Profile>
}
```

```ts
User.$getRelation('profile').relationName
User.$getRelation('profile').type
User.$getRelation('profile').relatedModel()
```

## Methods/Properties
Following is the list of methods and properties available on the `HasOne` relationship.

### type
The type of the relationship. The value is always set to `hasOne`.

```ts
class User extends BaseModel {
  @hasOne(() => Profile)
  public profile: HasOne<typeof Profile>
}

User.$getRelation('profile').type // 'hasOne'
```

---

### relationName
The relationship name. It is a property name defined on the parent model.

```ts
class User extends BaseModel {
  @hasOne(() => Profile)
  public profile: HasOne<typeof Profile>
}

User.$getRelation('profile').relationName // 'profile'
```

---

### serializeAs
The name to be used for serializing the relationship. You can define it using the decorator options.

```ts
class User extends BaseModel {
  @hasOne(() => Profile, {
    serializeAs: 'userProfile'
  })
  public profile: HasOne<typeof Profile>
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
  @hasOne(() => Profile)
  public profile: HasOne<typeof Profile>
}

User.$getRelation('profile').model // User
```

---

### relatedModel
Reference to the relationship model. The property value is a function that returns the related model.

```ts
class User extends BaseModel {
  @hasOne(() => Profile)
  public profile: HasOne<typeof Profile>
}

User.$getRelation('profile').relatedModel() // Profile
```

---

### localKey
The `localKey` for the relationship. You must read the [NamingStrategy](../naming-strategy.md#relationlocalkey) doc to learn more about how the key name is computed.

You can also define the `localKey` explicitly. Do make sure you mention the model property name and NOT the database column name.

```ts
class User extends BaseModel {
  @column()
  public id: number

  @hasOne(() => Profile, {
    localKey: 'id', // id column on "User" model
  })
  public profile: HasOne<typeof Profile>
}
```

---

### foreignKey
The `foreignKey` for the relationship. You must read the [NamingStrategy](../naming-strategy.md#relationlocalkey) doc to learn more about how the key name is computed.

You can also define the `foreignKey` explicitly. Do make sure you mention the model property name and NOT the database column name.

```ts
class User extends BaseModel {
  @hasOne(() => Profile, {
    foreignKey: 'userId', // userId column on "Profile" model
  })
  public profile: HasOne<typeof Profile>
}
```

---

### onQuery
The `onQuery` method is an optional hook to modify the relationship queries. You can define it at the time of declaring the relation.

```ts
class User extends BaseModel {
  @column()
  public id: number

  @hasOne(() => Profile, {
    onQuery(query) {
      query.where('visibility', 'public')
    }
  })
  public profile: HasOne<typeof Profile>
}
```

If you want to preload a nested relationship using the `onQuery` hook, then make sure to put it inside the `!query.isRelatedSubQuery` conditional because sub-queries are **NOT executed directly**, they are used inside other queries.

```ts
class User extends BaseModel {
  @column()
  public id: number

  @hasOne(() => Profile, {
    onQuery(query) {
      // highlight-start
      if (!query.isRelatedSubQuery) {
        query.preload('socialAccounts')
      }
      // highlight-end
    }
  })
  public profile: HasOne<typeof Profile>
}
```

---

### setRelated
Set a relationship on the parent model instance. The methods accept the parent model as the first argument and the related model instance as the second argument.

You must ensure that both the model instances are related to each other before calling this method.

```ts
const user = new User()
const profile = new Profile()

User.$getRelation('profile').setRelated(user, profile)
```

---

### pushRelated
The `pushRelated` method pushes the relationship to the existing relationship value array. However, for `hasOne`, the method works similar to `setRelated`.

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

const profiles = [
  Profile {
    user_id: 1,
  },
  Profile {
    user_id: 2,
  },
  Profile {
    user_id: 3,
  }
]

User.$getRelation('profile').setRelatedForMany(users, profiles)
```

---

### client
Returns the reference to the [HasOneQueryClient](#query-client). The query client exposes the API to persist/fetch related rows from the database.

---

### hydrateForPersistance
Hydrates the values for persistence by defining the foreignKey value. The method accepts the parent model as the first argument and an object or the related model instance as the second argument.

```ts
const user = new User()
user.id = 1

const profile = new Profile()
User.$getRelation('profile').hydrateForPersistance(user, profile)

console.log(profile.userId === user.id) // true
```

---

### eagerQuery
Returns an instance of the [HasOneQueryBuilder](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/HasOne/QueryBuilder.ts). The query builder has the same API as the [Model query builder](../query-builder.md)

---

### subQuery
Returns an instance of the [HasOneSubQueryBuilder](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/HasOne/SubQueryBuilder.ts). The sub queries are not meant to be executed and mainly used by the [withCount](../query-builder.md#withcount) and [whereHas](../query-builder.md#wherehas) methods.

## Query client
The query client exposes the API to persist/fetch related rows from the database. You can access the query client for a relationship using the `related` method.

```ts
const user = await User.find(1)

user.related('profile') // HasOneClientContract
```

### create
Please create a new relationship model instance and persist it to the database right away.

```ts
const profile = await user
  .related('profile')
  .create({
    email: 'virk@adonisjs.com',
    avatarUrl: 'profile.jpg',
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
await user.related('profile').create()

await trx.commit()
```

---

### save
The save method persists an existing instance of the relationship.

Like the `create` method, the `save` method also uses the transaction client/connection name from the parent model.

```ts
const profile = new Profile()
profile.email = 'virk@adonisjs.com'
profile.avatarUrl = 'foo.jpg'

const profile = await user
  .related('profile')
  .save(profile)
```

---

### firstOrCreate
The `firstOrCreate` method works similar to the [static firstOrCreate](../base-model.md#static-firstorcreate) method on the model. However, we **implicitly adds the foreignKey and its value** to the search payload.

:::tip

You can also use this method to ensure that the user always has a single profile.

:::

```ts
await user
  .related('profile')
  .firstOrCreate({}, {
    email: 'virk@adonisjs.com',
    avatarUrl: 'profile.jpg',
  })
```

---

### updateOrCreate
The `updateOrCreate` method works similar to the [static updateOrCreate](../base-model.md#static-updateorcreate) method on the model. However, we **implicitly adds the foreignKey and its value** to the search payload.

```ts
await user
  .related('profile')
  .updateOrCreate({}, {
    email: 'virk@adonisjs.com',
    avatarUrl: 'profile.jpg',
  })
```

---

### query
Returns an instance of the [HasOneQueryBuilder](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/HasOne/QueryBuilder.ts). The query builder has the same API as the [Model query builder](../query-builder.md).
