---
summary: Using the data model hooks to perform actions on specific events.
tocDepth: 3
---

Hooks are the **actions that you can perform against a model instance** during a pre-defined life cycle event. Using hooks, you can encapsulate specific actions within your models vs. writing them everywhere inside your codebase.

A great example of hooks is password hashing. You can define a hook that runs before the `save` call and converts the plain text password to a hash. 

```ts
// title: app/Models/User.ts
// highlight-start
import Hash from '@ioc:Adonis/Core/Hash'
// highlight-end
import { column, beforeSave, BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public password: string

  // highlight-start
  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
  // highlight-end
}
```

- The `beforeSave` hook is invoked before the **INSERT** and the **UPDATE** queries.
- Hooks can be async. So you can use the `await` keyword inside them.
- Hooks are always defined as static functions and receive the model's instance as the first argument.

---

#### Understanding the `$dirty` property

The `beforeSave` hook is called every time a new user is **created** or **updated** using the model instance. 

During the update, you may have updated other properties but NOT the user password. Hence there is no need to re-hash the existing hash, which is why using the `$dirty` object.

The `$dirty` object only contains the changed values. So, you can check if the password was changed and then hash the new value.

## Available hooks
Following is the list of all the available hooks. Make sure to read the [decorators API docs](../../reference/orm/decorators.md) as well.

| Hook | Description |
|-------|------------|
| `beforeSave` | Invoked **before the insert or the update** query. Receives the model instance as the only argument. |
| `afterSave` | Invoked **after the insert or the update** query. Receives the model instance as the only argument.|
| `beforeCreate` | Invoked only **before the insert** query. Receives the model instance as the only argument.|
| `afterCreate` | Invoked only **after the insert** query. Receives the model instance as the only argument.|
| `beforeUpdate` | Invoked only **before the update** query. Receives the model instance as the only argument.|
| `afterUpdate` | Invoked only **after the update** query. Receives the model instance as the only argument.|
| `beforeDelete` | Invoked **before the delete** query. Receives the model instance as the only argument.|
| `afterDelete` | Invoked **after the delete** query. Receives the model instance as the only argument. |
| `beforePaginate` | Invoked **before the paginate** query. Receives the query main builder instance alongside the count query builder instance. |
| `afterPaginate` | Invoked **after the paginate** query. Receives an instance of the simple paginator class. |
| `beforeFetch` | Invoked **before the fetch** query. Receives the query builder instance as the only argument. |
| `afterFetch` | Invoked **after the fetch** query. Receives an array of model instances |
| `beforeFind` | Invoked **before the find** query. Receives the query builder instance as the only argument. |
| `afterFind` | Invoked **after the find** query. Receives the model instance as the only argument. |

**All hooks receive the model instance as the first argument, except the ones documented below.**

### beforeFind
The `beforeFind` hook is invoked just before the query is executed to find a single row. This hook receives the query builder instance, and you can attach your constraints to it.

```ts
import {
  BaseModel,
  beforeFind,
  ModelQueryBuilderContract,
} from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @beforeFind()
  public static ignoreDeleted (query: ModelQueryBuilderContract<typeof User>) {
    query.whereNull('is_deleted')
  }
}
```

---

### afterFind
The `afterFind` event receives the model instance.

```ts
import {
  BaseModel,
  afterFind,
} from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @afterFind()
  public static afterFindHook (user: User) {
  }
}
```

---

### beforeFetch
Similar to `beforeFind`, the `beforeFetch` hook also receives the query builder instance. However, this hook is invoked whenever a query is executed without using the `first` method.

```ts
import {
  BaseModel,
  beforeFetch,
  ModelQueryBuilderContract,
} from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @beforeFetch()
  public static ignoreDeleted (query: ModelQueryBuilderContract<typeof User>) {
    query.whereNull('is_deleted')
  }
}
```

---

### afterFetch
The `afterFetch` hook receives an array of model instances.

```ts
import {
  BaseModel,
  afterFetch,
} from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @afterFetch()
  public static afterFetchHook (users: User[]) {
  }
}
```

---

### beforePaginate
The `beforePaginate` query is executed when you make use of the `paginate` method. The paginate method fires both the `beforeFetch` and `beforePaginate` hooks.

The hook function receives an array of query builders. The first instance is for the count's query, and the second is for the main query.

```ts
import {
  BaseModel,
  beforePaginate,
  ModelQueryBuilderContract,
} from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @beforePaginate()
  public static ignoreDeleted ([
    countQuery: ModelQueryBuilderContract<typeof User>,
    query: ModelQueryBuilderContract<typeof User>,
  ]) {
    query.whereNull('is_deleted')
    countQuery.whereNull('is_deleted')
  }
}
```

---

### afterPaginate
The `afterPaginate` hook receives an instance of the [SimplePaginator](../../reference/database/query-builder.md#pagination) class. The `paginate` method fires both the `afterFetch` and the `afterPaginate` hooks.

```ts
import {
  BaseModel,
  afterPaginate,
} from '@ioc:Adonis/Lucid/Orm'

import {
  SimplePaginatorContract
} from '@ioc:Adonis/Lucid/Database'

export default class User extends BaseModel {
  @afterPaginate()
  public static afterPaginateHook (users: SimplePaginatorContract<User>) {
  }
}
```
