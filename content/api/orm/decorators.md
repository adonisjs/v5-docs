All of the ORM decorators can be imported as follows:

```ts
import {
  column,
  hasOne,
  scope,
  beforeSave,
  beforeFind,
  // ... and so on
} from '@ioc:Adonis/Lucid/Orm'
```

---

### column
The `column` decorator marks a model property as a database column.

```ts
import { column, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class User extends BaseModel {
  @column()
  public email: string
}
```

You can also define any of the following optional properties.

| Option | Description |
|---------|------------|
| `columnName` | The name of the column inside the database. If not defined, We will use the [naming strategy](./naming-strategy.md#columnname) to create the name. |
| `serializeAs` | The property name to be used when serializing the model. Setting the value to `null` will remove the property from the serialized object. |
| `isPrimary` | Mark column as primary. One model can only have one primary column. |
| `serialize` | A custom function to handle the column value serialization. For example: Serialize luxon date objects to a string. |
| `prepare` | A custom function to transform the value before it is saved inside the database. |
| `consume` | A custom function to transform the after fetching it from the database and before defining it on the model instance. |
| `meta` | The `meta` object holds arbitrary metadata for the property. 3rd party libraries extending the model's functionality can use this property. |

```ts
import Encryption from '@ioc:Adonis/Core/Encryption'
import { column, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class User extends BaseModel {
  @column({
    prepare: (value: string) => Encryption.encrypt(value),
    consume: (value: string) => Encryption.decrypt(value),
  })
  public email: string

  @column({
    serializeAs: null
  })
  public password: string
}
```

---

### column.date / column.datetime
The `column.date` decorator marks the column as a date. The decorator enforces the property type to be an instance of [luxon.DateTime](https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html).

The decorator [self defines](https://github.com/adonisjs/lucid/blob/0fc3e2391ba6743427fac62e0895e458d7bc8137/src/Orm/Decorators/date.ts#L98) the `prepare`, `consume` and the `serialize` methods to ensure

- You are constantly working with an instance of `luxon.DateTime` in your codebase
- The date is serialized as an ISO date
- The date is formatted correctly as per the underlying database driver.

```ts
import { DateTime } from 'luxon'
import { column, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class User extends BaseModel {
  @column.date()
  public dob: DateTime
}
```

Additionally, you can also define `autoCreate` and `autoUpdate` options to always set/update the value when an insert or update query is executed.

You will mainly use these attributes with the `createdAt` and `updatedAt` timestamps.

```ts
class User extends BaseModel {
  @column.datetime({ autoCreate: true })
  public createdAt: DateTime

  @column.datetime({ autoUpdate: true })
  public updatedAt: DateTime
}
```

---

### computed
You can use the `computed` decorator to serialize a model property when converting the model instance to a JSON object.

```ts
import { column, computed, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class User extends BaseModel {
  @column()
  public firstName: string

  @column()
  public lastName: string

  @computed()
  public get fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}
```

Now serializing the model will include the `fullName` as well.

```ts
const user = new User()
user.firstName = 'Harminder'
user.lastName = 'Virk'

console.log(user.serialize())
/**
  {
    firstName: 'Harminder',
    lastName: 'Virk',
    fullName: 'Harminder Virk'
  }
*/
```

---

### hasOne
The `hasOne` decorator marks a property as a Has one relationship. Make sure to read the [has one relationship](/guides/model-relations/has-one/) guide to learn more about the options and their impact.

```ts
import { hasOne, HasOne, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class User extends Model {
  @hasOne(() => Profile)
  public profile: HasOne<typeof Profile>
}
```

---

### hasMany
The `hasMany` decorator marks a property as a hasMany relationship. Make sure to read the [has many relationship](/guides/model-relations/has-many/) guide to learn more about the options and their impact.

```ts
import { hasMany, HasMany, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class User extends Model {
  @hasMany(() => Post)
  public posts: HasMany<typeof Post>
}
```

---

### belongsTo
The `belongsTo` decorator marks a property as a belongsTo relationship. Make sure to read the [belongs to relationship](/guides/model-relations/belongs-to/) guide to learn more about the options and their impact.

```ts
import { belongsTo, BelongsTo, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class User extends Model {
  @belongsTo(() => Team)
  public team: BelongsTo<typeof Team>
}
```

---

### manyToMany
The `manyToMany` decorator marks a property as a many to many relationship. Make sure to read the [many to many relationship](/guides/model-relations/many-to-many/) guide to learn more about the options and their impact.

```ts
import { manyToMany, ManyToMany, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class User extends Model {
  @manyToMany(() => Subject)
  public subjects: ManyToMany<typeof Subject>
}
```

---

### hasManyThrough
The `hasManyThrough` decorator marks a property as a has many through relationship. Make sure to read the [has many through relationship](/guides/model-relations/guides/model-relations/has-many-through/) guide to learn more about the options and their impact.

```ts
import { hasManyThrough, HasManyThrough, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class User extends Model {
  @hasManyThrough([
    () => Project,
    () => Team,
  ])
  public projects: HasManyThrough<typeof Project>
}
```

---

### beforeSave
The `beforeSave` decorator registers a given function as a before hook invoked before the **insert** and the **update** query.

```ts
import { beforeSave, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class User extends BaseModel {

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

}
```

The after save variant is also supported using the `afterSave` decorator.

---

### beforeCreate
The `beforeCreate` decorator registers the function to be invoked just before the insert operation.

```ts
import { beforeCreate, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class User extends BaseModel {

  @beforeCreate()
  public static assignAvatar(user: User) {
    user.avatarUrl = getRandomAvatar()
  }

}
```

You can use the `afterCreate` decorator to define a hook that runs after creating a new row.

---

### beforeUpdate
The `beforeUpdate` decorator registers the function to be invoked just before the update operation.

```ts
import { beforeUpdate, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class User extends BaseModel {

  @beforeUpdate()
  public static async assignAvatar(user: User) {
    user.avatarUrl = getRandomAvatar()
  }

}
```

You can use the `afterUpdate` decorator to define a hook that runs after updating a row.

---

### beforeDelete
The `beforeDelete` decorator registers the function to be invoked just before the delete operation.

```ts
import { beforeDelete, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class Post extends BaseModel {

  @beforeDelete()
  public static async removeFromCache(post: Post) {
    await Cache.remove(`post-${post.id}`)
  }

}
```

You can use the `afterDelete` decorator to define a hook that runs after deleting a row.

---

### beforeFind

The `beforeFind` decorator registers the function to be invoked just before the find operation.

Find operations are one's that intentionally selects a single database row. For example:

- `Model.find()`
- `Model.findBy()`
- `Model.first()`

```ts
import { beforeFind, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class Post extends BaseModel {

  @beforeFind()
  public static withoutSoftDeletes(query) {
    query.whereNull('deleted_at')
  }

}
```

---

### afterFind
You can use the `afterFind` decorator to define a hook that runs after finding the row from the database.

The hook receives the model instance as the only argument.

```ts
import { afterFind, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class Post extends BaseModel {

  @afterFind()
  public static async processMarkdown(post) {
    post.html = await markdownIt(post.body)
  }

}
```

---

### beforeFetch
The `beforeFetch` decorator registers the function to be invoked just before the fetch operation.

All select queries except the **find operations** are considered as fetch operations.

```ts
import { beforeFetch, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class Post extends BaseModel {

  @beforeFetch()
  public static withoutSoftDeletes(query) {
    query.whereNull('deleted_at')
  }

}
```

---

### afterFetch
The `afterFetch` decorator registers the function to be invoked after the fetch operation.

The after fetch hook receives an array of model instances as the only argument.

```ts
import { afterFetch, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class Post extends BaseModel {

  @afterFetch()
  public static async processMarkdown(posts: Post[]) {
    await Promise.all(posts.map((post) => {
      return markdownIt(post.body)
    }))
  }

}
```

---

### beforePaginate
The `beforePaginate` decorator registers the function to be invoked just before the paginate operation.

```ts
import { beforePaginate, BaseModel } from '@ioc:Adonis/Lucid/Orm'

class Post extends BaseModel {

  @beforePaginate()
  public static withoutSoftDeletes(query) {
    query.whereNull('deleted_at')
  }

}
```

---

### afterPaginate
The `afterPaginate` decorator registers the function to be invoked after the paginate operation.

The after paginate hook receives an instance of the [paginator](../database/query-builder.md#pagination).

```ts
import { afterPaginate, BaseModel } from '@ioc:Adonis/Lucid/Orm'
import {
  SimplePaginatorContract,
} from '@ioc:Adonis/Lucid/DatabaseQueryBuilder'

class Post extends BaseModel {

  @afterPaginate()
  public static async processMarkdown(
    paginator: SimplePaginatorContract<Post>
  ) {
    await Promise.all(paginator.all().map((post) => {
      return markdownIt(post.body)
    }))
  }

}
```
