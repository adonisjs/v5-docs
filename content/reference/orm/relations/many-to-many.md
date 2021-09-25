---
summary: API documentation for Lucid ManyToMany relationship
---

The [ManyToMany relationship class](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/ManyToMany/index.ts) manages the many to many relationship between two models.

You will not find yourself directly working with this class. However, an instance of the class can be accessed using the `Model.$getRelation` method.

```ts
import { BaseModel, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Project from 'App/Models/Project'

class User extends BaseModel {
  @manyToMany(() => Project)
  public projects: ManyToMany<typeof Project>
}
```

```ts
User.$getRelation('projects').relationName
User.$getRelation('projects').type
User.$getRelation('projects').relatedModel()
```

## Methods/Properties
Following is the list of methods and properties available on the `ManyToMany` relationship.

### type
The type of the relationship. The value is always set to `manyToMany`.

```ts
class User extends BaseModel {
  @manyToMany(() => Project)
  public projects: ManyToMany<typeof Project>
}

User.$getRelation('projects').type // 'manyToMany'
```

---

### relationName
The relationship name. It is a property name defined on the parent model.

```ts
class User extends BaseModel {
  @manyToMany(() => Project)
  public projects: ManyToMany<typeof Project>
}

User.$getRelation('projects').relationName // 'projects'
```

---

### serializeAs
The name to be used for serializing the relationship. You can define it using the decorator options.

```ts
class User extends BaseModel {
  @manyToMany(() => Project, {
    serializeAs: 'teamProjects'
  })
  public projects: ManyToMany<typeof Project>
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
  @manyToMany(() => Project, {
    serializeAs: 'teamProjects'
  })
  public projects: ManyToMany<typeof Project>
}

User.$getRelation('projects').model // User
```

---

### relatedModel
Reference to the relationship model. The property value is a function that returns the related model.

```ts
class User extends BaseModel {
  @manyToMany(() => Project, {
    serializeAs: 'teamProjects'
  })
  public projects: ManyToMany<typeof Project>
}

User.$getRelation('projects').relatedModel() // Project
```

---

### localKey
The `localKey` for the relationship. You must read the [NamingStrategy](../naming-strategy.md#relationlocalkey) doc to learn more about how the key name is computed.

You can also define the `localKey` explicitly. Do make sure you mention the model property name and NOT the database column name.

```ts
class User extends BaseModel {
  @column()
  public id: number

  @manyToMany(() => Project, {
    localKey: 'id', // id column on "User" model
  })
  public projects: ManyToMany<typeof Project>
}
```

---

### relatedKey
The `relatedKey` for the relationship. This is usually the primary key on the related model. For example, The `id` column on the Project model.

You can also define the `relatedKey` explicitly. Do make sure you mention the model property name and NOT the database column name.

```ts
class User extends BaseModel {
  @manyToMany(() => Project, {
    relatedKey: 'id', // id column on "Project" model
  })
  public projects: ManyToMany<typeof Project>
}
```

---

### pivotForeignKey
The `pivotForeignKey` is the name of the column inside the pivot table for the parent model. For 
example: The `user_id` column inside the pivot table is the `pivotForeignKey`.

You can also define the `pivotForeignKey` explicitly. Also, since there is no pivot model, you define the database column name directly.

```ts
class User extends BaseModel {
  @manyToMany(() => Project, {
    pivotForeignKey: 'user_id',
  })
  public projects: ManyToMany<typeof Project>
}
```

---

### pivotRelatedForeignKey
The `pivotRelatedForeignKey` is the name of the column inside the pivot table for the related model. For 
example: The `project_id` column inside the pivot table is the `pivotRelatedForeignKey`.

You can also define the `pivotRelatedForeignKey` explicitly. Also, since there is no pivot model, you define the database column name directly.

```ts
class User extends BaseModel {
  @manyToMany(() => Project, {
    pivotRelatedForeignKey: 'project_id',
  })
  public projects: ManyToMany<typeof Project>
}
```

---

### pivotTable
The `pivotTable` property defines the pivot table to query for persisting/fetching related rows. Make sure to read the [naming strategy](../naming-strategy.md#relationpivottable) guide to learn more about how the table name is computed.

You can also define the `pivotTable` name explicitly.

```ts
class User extends BaseModel {
  @manyToMany(() => Project, {
    pivotTable: 'user_projects'
  })
  public projects: ManyToMany<typeof Project>
}
```

---

### pivotColumns
Define the columns you want Lucid to select when fetching many to many relationships. By default, it only selects the `pivotRelatedForeignKey` and the `pivotForeignKey` columns.

```ts
class User extends BaseModel {
  @manyToMany(() => Project, {
    pivotColumns: ['role', 'created_at', 'updated_at']
  })
  public projects: ManyToMany<typeof Project>
}
```

---

### onQuery
The `onQuery` method is an optional hook to modify the relationship queries. It receives an instance of the [ManyToManyQueryBuilder](#query-builder).

You can define the hook at the time of declaring the relation.

```ts
class User extends BaseModel {
  @manyToMany(() => Project, {
    onQuery(query) {
      query.where('isActive', true)
    }
  })
  public projects: ManyToMany<typeof Project>
}
```

If you want to preload a nested relationship using the `onQuery` hook, then make sure to put it inside the `!query.isRelatedSubQuery` conditional because sub-queries are **NOT executed directly**, they are used inside other queries.

```ts
class User extends BaseModel {
  @manyToMany(() => Project, {
    onQuery(query) {
      // highlight-start
      if (!query.isRelatedSubQuery) {
        query.preload('tasks')
      }
      // highlight-end
    }
  })
  public projects: ManyToMany<typeof Project>
}
```

---

### setRelated
Set a relationship on the parent model instance. The methods accept the parent model as the first argument and the related model instance as the second argument.

You must ensure that both the model instances are related to each other before calling this method.

```ts
const user = new User()
const project = new Project()

User.$getRelation('projects').setRelated(user, [project])
```

---

### pushRelated
The `pushRelated` method pushes the relationship to the existing relationship value array.

```ts
const user = new User()

User.$getRelation('projects').pushRelated(user, new Project())
User.$getRelation('projects').pushRelated(user, new Project())
User.$getRelation('projects').pushRelated(user, new Project())

user.projects.length // 3
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

const projects = [
  Project {
    id: 1,
    $extras: {
      pivot_user_id: 1,
    }
  },
  Project {
    id: 2,
    $extras: {
      pivot_user_id: 1,
    }
  },
  Project {
    id: 3,
    $extras: {
      pivot_user_id: 2,
    }
  },
  Project {
    id: 4,
    $extras: {
      pivot_user_id: 3,
    }
  }
]

User.$getRelation('projects').setRelatedForMany(users, projects)
```

---

### client
Returns the reference to the [ManyToManyQueryClient](#query-client). The query client exposes the API to persist/fetch related rows from the database.

---

### getPivotPair
Returns a tuple with the `pivotForeignKey` and its value from the parent model. The method accepts the parent model as the only argument.

```ts
const user = await User.find(1)

User.$getRelation('projects').getPivotPair(user)

// Return value: ['user_id', 1]
```

---

### getPivotRelatedPair
Returns a tuple with the `pivotRelatedForeignKey` and its value from the related model. The method accepts the related model as the only argument.

```ts
const project = await Project.find(1)

User.$getRelation('projects').getPivotRelatedPair(project)

// Return value: ['project_id', 1]
```

---

### eagerQuery
Returns an instance of the [ManyToManyQueryBuilder](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/ManyToMany/QueryBuilder.ts). The query builder has the same API as the [Model query builder](../query-builder.md)

---

### subQuery
Returns an instance of the [ManytoManySubQueryBuilder](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/ManytoMany/SubQueryBuilder.ts). The sub queries are not meant to be executed and mainly used by the [withCount](../query-builder.md#withcount) and [whereHas](../query-builder.md#wherehas) methods.

## Query client
The query client exposes the API to persist/fetch related rows from the database. You can access the query client for a relationship using the `related` method.

```ts
const user = await User.find(1)

user.related('projects') // ManytoManyClientContract
```

### create
Please create a new relationship model instance and persist it to the database right away. The method also inserts a new row into the pivot table.

```ts
const project = await user
  .related('projects')
  .create({
    title: 'Shipping v5',
  })
```

You can define the pivot attributes as the second argument.

```ts
await user
  .related('projects')
  .create({
    title: 'Shipping v5',
  }, {
    role: 'admin'
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
await user.related('projects').create()

await trx.commit()
```

---

### createMany
Create multiple instances of a relationship model and persist them to the database. The method accepts an array of objects to persist.

- One insert query is issued for each model instance to ensure that we execute the lifecycle hooks for every individual instance.
- All the insert queries are internally wrapped inside a transaction. In case of an error, we will roll everything back.

```ts
await user.related('projects').createMany([
  {
    title: 'Shipping v5',
  },
  {
    title: 'Recording screencasts'
  }
])
```

The pivot attributes can be defined as the second argument. It should be an array with the same length as the data array.

```ts
await user.related('projects').createMany([
  {
    title: 'Shipping v5',
  },
  {
    title: 'Recording screencasts'
  }
], [
  {
    role: 'admin'
  },
  undefined // do not set any pivot attributes
])
```

---

### save
The save method persists an existing instance of the relationship. Like the `create` method, the `save` method also accepts an optional pivot attribute object as the second argument.

```ts
const project = new Project()
project.title = 'Shipping v5'

const user = await User.find(1)

await user
  .related('projects')
  .save(project)

project.$isPersisted // true
project.$extras.pivot_user_id // 1
project.$extras.pivot_project_id === project.id // true
```

Optionally, you can instruct the `save` method to check the pivot table before adding a new row.

```ts
await user
  .related('projects')
  .save(
    project,
    {},
    true // 👈 do not add new row when pivot table has this relationship already
  )
```

---

### saveMany
The `saveMany` method persists an array of related model instances to the database.

- One insert query is issued for each model instance to ensure that we execute the lifecycle hooks for every individual instance.
- All the insert queries are internally wrapped inside a transaction. In case of an error, we will roll everything back.

```ts
const project = new Project()
project.title = 'Shipping v5'

const project1 = new Project()
project1.title = 'Recording screencasts'

await user
  .related('post')
  .saveMany([project, project1])
```

---

### attach
The attach method allows you to set up relationships inside the pivot table by just using the ids. For example:

```ts
const user = await User.find(1)
const project = await Project.find(1)

await user.related('projects').attach([project.id])
```

You can define pivot attributes by passing a key-value pair. The `key` is the related model id, and `value` is an object of pivot attributes.

```ts
await user.related('projects').attach({
  [project.id]: {
    role: 'admin'
  }
})
```

---

### detach
The `detach` method removes the relationship from the pivot table. Either you can pass an array of related models ids or call the `detach` method without any arguments to remove all related rows.

```ts
// Remove projects with id 1, 2, 3
await user.related('projects').detach([1, 2, 3])
```

```ts
// Remove all projects
await user.related('projects').detach()
```

---

### sync
The `sync` method allows you to sync an array of related model ids in the pivot table. The sync operation is performed by considering the input as the real source of truth.

```ts
await user
  .related('projects')
  .sync([1, 2, 4, 5])
```

In the above example, the `sync` method will only keep the projects with the mentioned ids and removes the other ones. 

You can change this behavior by passing `false` as the second argument to the `sync` method, and then it will attach the mentioned ids without detaching the others.

In the following example, the `sync` method will attach (only if they aren't already) the projects with the id of **"1"** and **"2"** without detaching any existing ids.

```ts
await user
  .related('projects')
  .sync([1, 2], false)
```

You can also perform a sync with pivot attributes.

```ts
await user
  .related('projects')
  .sync({
    [1]: {
      role: 'admin'
    },
    [4]: {
      role: 'guest',
    },
    [3]: {
      role: null,
    }
  })
```

The `sync` method will compute the diff between the existing pivot rows and the input data and performs `insert`, `update`, and `delete` queries as per the diff.

---

### query
Returns an instance of the [ManyToManyQueryBuilder](#query-builder).

## Query Builder
The [ManyToMany Query Builder](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/ManyToMany/QueryBuilder.ts) has the following additional methods on top of a standard model query builder.

You can access the relationship query builder as follows:

```ts
const user = await User.find(1)

user.related('projects').query() // ManytoManyQueryBuilder
```

### pivotColumns
Select columns from the pivot table. This method will prefix the pivot table name to the column behind the scenes and aliases it to `pivot_[column_name]`.

```ts
user
  .related('projects')
  .query()
  .pivotColumns(['role']) // select project_user.role as pivot_role
```

---

### wherePivot
Write a `where` conditional for the pivot table. The method has the same API as the [where](../../database/query-builder.md#where) method on a standard query builder. It will prefix the pivot table name to the column name.

```ts
user
  .related('projects')
  .query()
  .wherePivot('role', 'admin') // where project_user.role = ?
```

Following is the list of the `wherePivot` method variations and shares the same API.

| Method | Description |
|--------|-------------|
| `andWherePivot` | Alias for the `wherePivot` method |
| `orWherePivot` | Adds an **or where** clause |
| `whereNotPivot` | Adds a **where not** clause |
| `orWhereNotPivot` | Adds an **or where not** clause |
| `andWhereNotPivot` | Alias for `whereNotPivot` |

### whereInPivot
Same as the [whereIn](../../database/query-builder.md#wherein) method on a standard query builder. However, it prefixes the pivot table name in front of the column name.

```ts
user
  .related('projects')
  .query()
  .whereInPivot('role', ['admin', 'collaborator']) 
```

Following is the list of the `whereInPivot` method variations and shares the same API.

| Method | Description |
|--------|-------------|
| `andWhereInPivot` | Alias for the `whereInPivot` method |
| `orWhereInPivot` | Adds an **or where in** clause |
| `whereNotInPivot` | Adds a **where not in** clause |
| `orWhereNotInPivot` | Adds an **or where not in** clause |
| `andWhereNotInPivot` | Alias for `whereNotInPivot` |

### whereNullPivot
Same as the [whereNull](../../database/query-builder.md#wherenull) method on a standard query builder. However, it prefixes the pivot table name in front of the column name.

```ts
user
  .related('projects')
  .query()
  .whereNullPivot('deleted_at')
```

Following is the list of the `whereNullPivot` method variations and shares the same API.

| Method | Description |
|--------|-------------|
| `andWhereNullPivot` | Alias for the `whereNullPivot` method |
| `orWhereNullPivot` | Adds an **or where null** clause |
| `whereNotNullPivot` | Adds a **where not null** clause |
| `orWhereNotNullPivot` | Adds an **or where not null** clause |
| `andWhereNotNullPivot` | Alias for `whereNotNullPivot` |

### groupLimit
The `groupLimit` method uses [SQL window functions](https://www.sqlservertutorial.net/sql-server-window-functions/sql-server-row_number-function/) to add a limit to each group during relationship preloading. Please read the [preloading guide](../../../guides/models/relationships.md#preload-relationship) to learn why and when you need the `groupLimit` method.

```ts
await User.query().preload('projects', (query) => {
  query.groupLimit(10)
})
```

### groupOrderBy
Add an order by clause to the group limit query. The method has the same API as the `orderBy` method on the standard query builder.

:::note

You only need to apply `groupOrderBy` when using the `groupLimit` method.

:::

```ts
await User.query().preload('projects', (query) => {
  query
    .groupLimit(10)
    .groupOrderBy('projects.updated_at', 'desc')
})
```
