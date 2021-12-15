---
summary: Base model class complete reference guide
---

Lucid data models extends the [Base Model](https://github.com/adonisjs/lucid/blob/develop/src/Orm/BaseModel/index.ts) to inherit the properties and methods for interacting with a database table.

```ts
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'

class User extends BaseModel {
}
```

## Model adapter options
Many of the model methods accepts the following [options object](https://github.com/adonisjs/lucid/blob/0fc3e2391ba6743427fac62e0895e458d7bc8137/adonis-typings/model.ts#L293). We are writing it here once and will use the reference else where.

```ts
const modelOptions = {
  client: await Database.transaction(),
  connection: 'pg',
  profiler: profiler
}
```

All of the object properties are optional

- `client` is the reference to the database [query client](../database/query-client.md). Most of the time you will find yourself passing in the [transaction client](../database/transaction-client.md).
- `connection` is the reference to a registered connection name. Useful when you have a multi-tenant app and wants to dynamically pass in the name of the connection used by the tenant.
- `profiler` is reference to the profiler instance.

## Static properties/methods

### static boot
Boot the model. Since the inheritance story of JavaScript class is not that great with static properties. We need a custom `boot` phase to ensure that everything works as expected.

```ts
User.boot()
```

---

### static booted
A boolean to know if a model has been booted or not.

```ts
class User extends BaseModel {
  public static boot () {
    if (this.booted) {
      return
    }

    super.boot()
  }
}
```

---

### static before
Define a `before` hook for a specific event.

```ts
public static boot () {
  if (this.booted) {
    return
  }

  // highlight-start
  super.boot()
  this.before('create', (user) => {
  })
  // highlight-end
}
```

---

### static after
Define an `after` hook for a specific event.

```ts
public static boot () {
  if (this.booted) {
    return
  }

  // highlight-start
  super.boot()
  this.after('create', (user) => {
  })
  // highlight-end
}
```

Another (preferred) option is to make use of the [decorators](https://github.com/adonisjs/lucid/blob/0fc3e2391ba6743427fac62e0895e458d7bc8137/src/Orm/Decorators/index.ts#L67-L244) to mark model static methods as hooks.

```ts
import {
  BaseModel,
  // highlight-start
  beforeSave,
  // highlight-end
} from '@ioc:Adonis/Lucid/Orm'

class User extends BaseModel {
  // highlight-start
  @beforeSave()
  public static hashPassword(user: User) {
  }
  // highlight-end
}
```

---

### static create
Create a new model instance and persist it to the database right away.

```ts
const user = await User.create({
  email: 'virk@adonisjs.com',
  password: 'secret',
})
```

The method accepts a total of three arguments.

- `data`: The data to persist to the database
- `options`: Optionally define the [model adapter options](#model-adapter-options).
- `allowExtraProperties`: A boolean to allow passing extra properties in the data object. When set to `false`, the method will raise an exception when the data properties are not marked as columns.

---

### static createMany
Create multiple instances of a model and persist them to the database. The `createMany` method accepts the same options as the [create](#static-create) method.

- One insert query is issued for each model instance to ensure that we execute the lifecycle hooks for every individual instance.
- All the insert queries are internally wrapped inside a transaction. In case of an error, everything will be rolled back.

```ts
const user = await User.createMany([
  {
    email: 'virk@adonisjs.com',
    password: 'secret',
  },
  {
    email: 'romain@adonisjs.com',
    password: 'secret',
  },
])
```

---

### static find
Find a row from the database using the model primary key. If a row exists it will be hydrated to the model instance, otherwise `null` is returned.

```ts
const user = await User.find(1)
if (!user) {
  return
}

console.log(user instanceof User)
```

The method accepts a total of two arguments.

- `value`: The primary key value.
- `options`: Optionally define the [model adapter options](#model-adapter-options).

---

### static findOrFail
Same as the `find` method. But instead of returning `null` it will raise an exception when the row doesn't exists.

The `findOrFail` method accepts the same options as the [find](#static-find) method.

```ts
const user = await User.findOrFail(1)
```

---

### static findBy
Find a row inside the database by using a key-value pair. If a row exists it will be hydrated to the model instance, otherwise `null` is returned.

```ts
const user = await User.findBy('email', 'virk@adonisjs.com')
```

The method accepts a total of three arguments.

- `columName`: The column name to use in the where condition.
- `value`: The value for the column.
- `options`: Optionally define the [model adapter options](#model-adapter-options).

---

### static findByOrFail
Same as the `findBy` method. But instead of returning `null` it will raise an exception when the row doesn't exists.

The `findByOrFail` method accepts the same options as the [findBy](#static-find-by) method.

```ts
const user = await User.findByOrFail('email', 'virk@adonisjs.com')
```

---

### static first
Returns the first row from the database. If a row exists it will be hydrated to the model instance, otherwise `null` is returned.

:::note
The `first` method relies on the default order of the underlying database engine.
:::

```ts
const user = await User.first()
```

The method accepts a single arguments as the [model adapter options](#model-adapter-options).

---

### static firstOrFail
Same as the `first` method.  But instead of returning `null` it will raise an exception when the row doesn't exists.

```ts
const user = await User.firstOrFail()
```

The method accepts a single arguments as the [model adapter options](#model-adapter-options).

---

### static findMany
Find multiple model instances of an array of values for the model primary key. For example:

```ts
const users = await User.findMany([1, 2, 3])
```

- The results will be order by the primary key in desc order.
- Internally, the method uses the `where in` SQL clause and always returns an array.
- Optionally, you can also pass [model adapter options](#model-adapter-options) as the second argument.

---

### static firstOrNew
Returns an existing row from the database or creates a local instance of the model, when row for search criteria is not found.

```ts
const searchCriteria = {
  email: 'virk@adonisjs.com',
}

const savePayload = {
  name: 'Virk',
  email: 'virk@adonisjs.com',
  password: 'secret'
}

const user = await User.firstOrNew(searchCriteria, savePayload)

if (user.$isPersisted) {
  // user exists in the database
} else {
  // un-persisted user instance
}
```

The method accepts a total of four arguments.

- `searchCriteria`: Values to use for the select statement.
- `savePayload`: Values to use to create a new model instance. Also we merge the `searchCriteria` with the save payload object.
- `options`: Optionally, define the [model adapter options](#model-adapter-options).
- `allowExtraProperties`: A boolean to allow passing extra properties in the data object. When set to `false`, the method will raise an exception when the data properties are not marked as columns.

---

### static firstOrCreate
The `firstOrCreate` is similar to the `firstOrNew` method. However, instead of just creating a local model instance. The `firstOrCreate` method also performs the insert query.

The method accepts the same options as the [firstOrNew](#static-firstornew) method.

```ts
const user = await User.firstOrCreate(searchCriteria, savePayload)

if (user.$isLocal) {
  // no rows found in db. Hence a new one is created
} else {
  // existing db row
}
```

---

### static updateOrCreate
The `updateOrCreate` method updates the existing row or creates a new one. The method accepts the same options as the [firstOrNew](#static-firstornew) method.

This method obtains an "UPDATE lock" on the row during the select. This is done to avoid concurrent reads from getting the old values when the row is in the middle of being updated.

```ts
const searchCriteria = {
  id: user.id
}

const savePayload = {
  total: getTotalFromSomeWhere()
}

const cart = await Cart.updateOrCreate(searchCriteria, savePayload)
```

---

### static fetchOrNewUpMany

The `fetchOrNewUpMany` method is similar to the `firstOrNew` method. However, it operates on multiple rows.

```ts
const keyForSearch = 'email'
const payload = [
  {
    email: 'virk@adonisjs.com',
    name: 'Virk',
  },
  {
    email: 'romain@adonisjs.com',
    name: 'Romain',
  }
]

const users = await User.fetchOrNewUpMany(keyForSearch, payload)

for (let user of users) {
  if (user.$isPersisted) {
    // existing row in the database
  } else {
    // local instance
  }
}
```

In the above example, Lucid will search for existing users by their email `(keyForSearch)`. For missing rows a new local instance of the model will be created.

The method accepts the same options as the [firstOrNew](#static-firstornew) method.

---

### static fetchOrCreateMany

The `fetchOrCreateMany` method is similar to the `firstOrCreate` method. However, it operates on multiple rows.

```ts
const keyForSearch = 'email'
const payload = [
  {
    email: 'virk@adonisjs.com',
    name: 'Virk',
  },
  {
    email: 'romain@adonisjs.com',
    name: 'Romain',
  }
]

const users = await User.fetchOrCreateMany(keyForSearch, payload)

for (let user of users) {
  if (user.$isLocal) {
    // local+persisted instance
  } else {
    // existing row in the database
  }
}
```

The method accepts the same options as the [firstOrNew](#static-firstornew) method.

---

### static updateOrCreateMany

The `updateOrCreateMany` method is similar to the `updateOrCreate` method. However, it operates on multiple rows.

This method obtains an "UPDATE lock" on the row during the select. This is done to avoid concurrent reads from getting the old values when the row is in the middle of being updated.

```ts
const keyForSearch = 'email'
const payload = [
  {
    email: 'virk@adonisjs.com',
    name: 'Virk',
  },
  {
    email: 'romain@adonisjs.com',
    name: 'Romain',
  }
]

const users = await User.updateOrCreateMany(keyForSearch, payload)
```

The method accepts the same options as the [firstOrNew](#static-firstornew) method.

---

### static all

A shortcut method to fetch all the rows from a given database table. The rows are sorted in descending order by the primary key.

```ts
const users = await User.all()
```

Optionally, you can also pass [model adapter options](#model-adapter-options) as an argument to the `all` method.

---

### static query

Returns an instance of the [model query builder](./query-builder.md). Unlike the standard query builder, the result of the model query builder is an array of model instances.

```ts
const users = await User
  .query()
  .where('age', '>', 18)
  .orderBy('id', 'desc')
  .limit(20)
```

Optionally, you can also pass [model options](#model-adapter-options) as an argument to the `query` method.

---

### static truncate

A shortcut to truncate the database table. . Optionally you can also cascade foreign key references.

```ts
await User.truncate()

// cascade
await User.truncate(true)

// custom connection
await User.truncate(true, {
  connection: 'pg',
})
```

Optionally, you can also pass [model options](#model-adapter-options) as the 2nd argument.

---

### static primaryKey
Define a custom primary for the model. It defaults to the `id` column.

```ts
class User extends BaseModel {
  public static primaryKey = 'uuid'
}
```

---

### static selfAssignPrimaryKey
A boolean to notify Lucid that you will self assign the primary key locally in your application and does not rely on the database generate one for you.

A great example of this is using the **UUID** as the primary key and generating them locally in your JavaScript code.

```ts
class User extends BaseModel {
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  public userId: string
}

const user = new User()
user.userId = uuid.v4()

await user.save()
```

---


### static connection
Define a custom database connection for the model.

:::note

DO NOT use this property to switch the connection at runtime. This property is only to define a static connection name that remains same through out the lifecycle of the application.

:::

```ts
class User extends BaseModel {
  public static connection = 'pg'
}
```

---

### static table
Define a custom database table. By default, the table name is generated using the [NamingStrategy.tableName](./naming-strategy.md#table-name) method.

```ts
class User extends BaseModel {
  public static table = 'my_users'
}
```

---

### static namingStrategy
Reference to the [NamingStrategy](./naming-strategy.md). By default, the [SnakeCaseNamingStrategy](https://github.com/adonisjs/lucid/blob/develop/src/Orm/NamingStrategies/SnakeCase.ts) is used. However, you can override it globally or for a single model.

---

### static $adapter
Reference to the underlying [Adapter](./adapter.md). Adapter works as a bridge between the model class and the database. Models directly do not rely on the Database.

---

### static $hooks
Reference to the registered hooks. It value is a reference to the [@poppinss/hooks](https://github.com/poppinss/hooks) package. You must use the `before` and `after` methods or decorators to define the model hooks.

---

### static $columnsDefinitions
The `$columnsDefinitions` property is an ES6 Map of the model column name and its meta data. For example:

```ts
Map {
  'id' => {
    columnName: 'id',
    serializeAs: 'id',
    isPrimary: true
  }
}
```

The column meta data can be modified using the `@column` decorator.

```ts
class User extends BaseModel {
  @column({ columnName: 'user_id' })
  public id: number
}
```

---

### static $computedDefinitions
The `$computedDefinitions` property is an ES6 Map of the model computed property name and its meta data. For example:

```ts
Map {
  'postsCount' => {
    serializeAs: 'postsCount'
  }
}
```

The computed meta data can be modified using the `@computed` decorator.

---

### static $relationsDefinitions
The `$relationsDefinitions` property is an ES6 Map of the model relationships. The key is the relationship name and value is the [instance of the relationship](https://github.com/adonisjs/lucid/tree/develop/src/Orm/Relations). For example:

```ts
Map {
  'profile' => HasOne {
    relationName: 'profile',
    relatedModel: [Function (anonymous)],
    options: { relatedModel: [Function (anonymous)] },
    model: [class User extends BaseModel] {
      booted: true,
      primaryKey: 'id',
      table: 'users'
    },
    type: 'hasOne',
    booted: false,
    serializeAs: 'profile',
    onQueryHook: undefined
  }
}
```

---

### static $createFromAdapterResult
Create model instance by consuming the database results. The method handles the use case where the column name in the database is different from the property name defined in the model.

```ts
class User extends BaseModel {
  @column({ columnName: 'full_name' })
  public fullName: string
}

const user = User.$createFromAdapterResult({
  id: 1,
  full_name: 'Harminder Virk',
})
```

Optionally you can also pass the [sideloaded](#sideloaded) properties and model options.

```ts
const data = {
  id: 1,
  full_name: 'Harminder Virk',
}

const sideloaded = {
  currentUser: auth.user
}

const options = {
  // Instance will use this query client moving forward
  client: Database.connection('pg')
}

const user = User.$createFromAdapterResult(data, sideloaded, options)
```

---

### static $createMultipleFromAdapterResult
Same as `$createFromAdapterResult`, but allows creating multiple model instances.

```ts
User.$createFromAdapterResult([
  {
    id: 1,
    full_name: 'Harminder Virk',
  },
  {
    id: 2,
    full_name: 'Romain Lanz',
  }
])
```

---

### static $addColumn
Define a model column. The `@column` decorator uses this method to mark a property as a column.

:::tip

Model properties which are not marked as columns are never inserted to the database and also ignored when returned by a select call.

:::

```ts
User.$addColumn('id', {})
```

Optionally, you can also define column meta-data.

```ts
User.$addColumn('id', {
  serializeAs: 'id',
  isPrimary: true,
  columnName: 'id',
})
```

---

### static $hasColumn
Find if a column with the given name exists on the model or not.

```ts
User.$hasColumn('id')
```

---

### static $getColumn
Returns the meta data for a given column.

```ts
if(User.$hasColumn('id')) {
  User.$getColumn('id')
}
```

---

### static $addComputed
Mark a class property as a computed property. The `@computed` decorator uses this method to mark a property as computed.

```ts
User.$addComputed('postsCount', {
  serializeAs: 'posts_count',
})
```

---

### static $hasComputed
Find if a computed property with the given name exists on the model or not.

```ts
User.$hasComputed('postsCount')
```

---

### static $getComputed
Returns the meta data for a given computed property.

```ts
if(User.$hasComputed('id')) {
  User.$getComputed('id')
}
```

---

### static $addRelation
Add a new relationship to the model. The relationship decorators calls this method behind the scene to mark a property as a relationship.

```ts
User.$addRelation(
  'posts',
  'hasMany',
  () => Post,
  {},
)
```

Additional options can be passed as the fourth argument.

```ts
User.$addRelation(
  'posts',
  'hasMany',
  () => Post,
  {
    localKey: 'id',
    foreignKey: 'user_uuid',
  },
)
```

---

### static $hasRelation
Find if a relationship exists.

```ts
User.$hasRelation('posts')
```

---

### static $getRelation
Returns the [relationship instance](https://github.com/adonisjs/lucid/tree/develop/src/Orm/Relations) for a pre-registered relationship.

```ts
if (User.$hasRelation('profile')) {
  User.$getRelation('profile')
}
```

## Instance properties/methods

### fill
The `fill` method allows you define the model attributes as an object. For example:

```ts
const user = new User()
user.fill({
  email: 'virk@adonisjs.com',
  name: 'virk',
  password: 'secret'
})

console.log(user.email)
console.log(user.name)
console.log(user.password)
```

The `fill` method replaces the existing attributes with the newly defined attributes. 

---

### merge
The `merge` method also accepts an object of attributes. However, instead of replacing the existing attributes, it performs a deep merge.

```ts
const user = new User()
user.email = 'virk@adonisjs.com'

user.merge({
  name: 'virk',
  password: 'secret'
})

console.log(user.email) // virk@adonisjs.com
```

---

### save
Persist the model instance to the database. The `save` method performs an **update** when the model instance has already been persisted, otherwise an **insert** query is executed.

```ts
const user = new User()

user.merge({
  name: 'virk',
  email: 'virk@adonisjs.com',
  password: 'secret'
})

console.log(user.$isPersisted) // false
console.log(user.$isLocal) // true

await user.save()

console.log(user.$isPersisted) // true
console.log(user.$isLocal) // true
```

---

### delete
Delete the row inside the database and freeze the model instance for further modifications. However, the instance can still be used for reading values.

```ts
const user = await User.find(1)
if (user) {
  await user.delete()

  console.log(user.$isDeleted) // true
}
```

---

### refresh
Refresh the model instance by hydrating its attributes with the values inside the database.

You will find this method helpful when your columns have default values defined at the database level and you want to fetch them right after the insert query.

```ts
const user = await User.create({
  email: 'virk@adonisjs.com',
  password: 'secret'
})

await user.refresh() // "select * from users where id = user.id"
```

---

### $attributes
The `$attributes` object is the key-value pair of model properties using the `@column` decorator.

The object is maintained internally to distinguish between the model regular properties and its columns. Consider the following example:

```ts
class User extends Model {
  @column({ isPrimary: true })
  public id: number

  @column()
  public fullName: string

  @column()
  public password: string

  public get initials() {
    const [firstName, lastName] = this.fullName.split(' ')

    if (!lastName) {
      return firstName.charAt(0).toUpperCase()
    }

    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`
  }
}
```

Lets create a local instance of the model.

```ts
const user = new User()
user.fullName = 'Harminder Virk'
user.password = 'secret'

console.log(user.$attributes) // { fullName, password }
```

The `$attributes` object will not have the `initials` property, since it is not using the `@column` decorator.

#### How does `$attributes` object gets populated?
We make use of ES6 Proxies behind the scenes to populate the `$attributes` object. Here is the [implementation](https://github.com/adonisjs/lucid/blob/develop/src/Orm/BaseModel/proxyHandler.ts) of the Proxy handler.

---

### $original
The `$original` object is a key-value pair of properties fetched from the database. The `$original` object is used to find the diff against the `$attributes`.

```ts
const user = await User.find(1)

console.log(user.$original === user.$attributes) // true
console.log(user.$isDirty) // false

user.fullName = 'Harminder Virk'
console.log(user.$isDirty) // true
console.log(user.$dirty) // diff between $original and $attributes

await user.save() // persist and update $original

console.log(user.$isDirty) // false
```

---

### $preloaded
An object of preloaded relationships.

```ts
const user = await User.query().preload('profile').first()

console.log(user.$preloaded) // { profile: Profile }
```

---

### $extras
The `$extras` are the values that are computed on the fly for a given model instance(s). For example: You fetch all the posts and a count of comments received on every post. The `postsCount` value we moved to `$extras` object, as it is not a database column.

```ts
const posts = await Post.query().withCount('comments')

posts.forEach((post) => {
  console.log(posts.$extras)
})
```

---

### $primaryKeyValue
Value for the column marked as a primary key. For example:

```ts
class User extends BaseModel {
  @column({ isPrimary: true })
  public userId: number
}

const user = new User()
user.userId = 1

user.$primaryKeyValue // 1
```

The `user.$primaryKeyValue` will return the value of the `userId` property as it is marked as a primary key.

---

### $getQueryFor
The BaseModel makes use of the [model query builder](./query-builder.md) and the [insert query builder](../database/insert-query-builder.md) to run **insert**, **update**, **delete** and **refresh** queries. 

It makes use of the `$getQueryFor` method to return the appropriate query builder for a given action. You can override this method, if you want to self construct the query builder for the above mentioned actions.

```ts
import { QueryClientContract } from '@ioc:Adonis/Lucid/Database'
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'

class User extends BaseModel {
  public $getQueryFor(
    action: 'insert' | 'update' | 'delete' | 'refresh',
    client: QueryClientContract,
  ) {
    if (action === 'insert') {
      return client.insertQuery().table(User.table)
    }

    return client.modelQuery(User).where('id', this.$primaryKeyValue)
  }
}
```

---

### $sideloaded
The `$sideloaded` properties are passed via the query builder to the model instances. A great example of `$sideloaded` properties is to pass down the currently logged in user to the model instance.

```ts
class Post extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public title: number

  public get ownedByCurrentUser() {
    if (!this.$sideloaded) {
      return false
    }
    return this.$sideloaded.userId = this.userId
  }
}
```

In the above example, the `ownedByCurrentUser` relies on the `$sideloaded.userId` property to know if the post is owned by the current user or not.

Now, you can pass the `userId` to the model instances using the `sideload` method.

```ts
const posts = await Post
  .query()
  .sideload({ userId: auth.user.id })

posts.forEach((post) => {
  console.log(post.ownedByCurrentUser)
})
```

---

### $isPersisted
Find if the model instance has been persisted to the database or not.

```ts
const user = new User()
console.log(user.$isPersisted) // false

await user.save()
console.log(user.$isPersisted) // true
```

---

### $isNew
Opposite of the `$isPersisted` property.

---

### $isLocal
Find if the model instance is created locally or fetched from the database.

```ts
const user = new User()
console.log(user.$isLocal) // true

await user.save()
console.log(user.$isLocal) // STILL true
```

In the following example, the model instance is created by fetching the row values from the database table.

```ts
const user = await User.find(1)
console.log(user.$isLocal) // false
```

---

### $dirty
An object containing the diff between the `$original` and the `$attributes` object.

```ts
const user = await User.find(1)
user.points = 10

console.log(user.$dirty) // { points: 10 }
```

---

### $isDirty
A boolean to know if the model is dirty.

```ts
const user = await User.find(1)
user.points = 10

console.log(user.$isDirty) // true
```

---

### $isDeleted
Find if the model instance has been deleted or not. It is set to true after the `delete` method is invoked.

```ts
const user = await User.find(1)
console.log(user.$isDeleted) // false

await user.delete()
console.log(user.$isDeleted) // true
```

---

### $trx
Reference to the [transaction client](../database/transaction-client.md) used by the model instance. You can also set the `$trx` manually in order to perform model operations within the transaction block.

```ts
const trx = await Database.transaction()

const user = new User()
user.$trx = trx

await user.save()
await trx.commit()

console.log(user.$trx) // undefined
```

After transaction is committed or rolled back the model instance will release the `$trx` reference, so that the transaction client instance is garbage collected.

The `$trx` property on the model instance is automatically defined, when the model instances are created as a result of executing a query and the query was using the transaction.

```ts
const trx = await Database.transaction()

// select query is using trx
const users = await User.query().useTransaction(trx)

users.forEach((user) => {
  // all of the model instances uses the same trx instance
  console.log(user.$trx === trx) // true
})
```

---

### $options
The `$options` is an object with an optional `connection` and the `profiler` property.

You can use the `$options` to define a custom connection per model instance. A practical use case is to use dynamic tenant connection per HTTP request.

```ts
const users = await User
  .query({ connection: tenant.connection })
  .select('*')

users.forEach((user) => {
  console.log(user.$options.connection === tenant.connection) // true
})
```

---

### useTransaction
The `useTransaction` is an alternative to manually set the `$trx` property.

```ts
const trx = await Database.transaction()
const user = new User()

await user
  .useTransaction(trx)
  .save()
```

---

### useConnection
The `useConnection` is an alternative to defining the `$options` with the `connection` property.

```ts
const user = new User()

await user
  .useConnection(tenant.connection)
  .save()
```

---

### load
Load a relationship from a model instance.

```ts
const user = await User.findOrFail(1)
await user.load('posts')

console.log(user.posts)
```

You can also pass a callback as the second argument to add more constraints to the relationship query.

```ts
await user.load('posts', (postsQuery) => {
  postsQuery.where('status', 'published')
})
```

You can also load multiple relationships as follows:

```ts
await user.load((loader) => {
  loader.load('profile').load('posts')
})
```

The nested relations can be loaded as follows:

```ts
await user.load((loader) => {
  loader.load('profile', (profile) => {
    profile.preload('socialAccounts')
  }).load('posts')
})
```

---

### related
Returns the relationship client instance for a given relationship. You can use the `related` method to run queries in reference to the defined relationship.

```ts
const user = await User.find(1)

const posts = await user.related('posts').query()
// select * from "posts" where "user_id" = user.id
```

Similarly, the related method can also be used to persist related rows.

```ts
const user = await User.find(1)

await user.related('posts').create({
  title: 'Adonis 101',
})

/**
INSERT INTO "posts"
  ("user_id", "title")
VALUES
  (user.id, 'Adonis 101')
*/
```

---

### toObject
Returns an object with model `$attributes`, preloaded relationships and its computed properties.

```ts
console.log(user.toObject())
```

---

### serialize
Serializes the model to its JSON representation. The serialization of models is helpful for building API servers.

Make sure to read the in-depth guide on [models serialization](../../guides/models/serialization.md).

```ts
console.log(user.serialize())
```

The `serialize` method also accepts an object for cherry-picking fields.

```ts
user.serialize({
  fields: {
    omit: ['password'],
  },
  relations: {
    profile: {
      fields: {
        pick: ['fullName', 'id'],
      },
    }
  }
})
```

The cherry picking argument can be a deeply nested tree targeting the relationships serialization as well.

---

### toJSON
Alias for the `serialize` method but doesn't accept any arguments. The `toJSON` is called automatically anytime you pass model instance(s) to the `JSON.stringify` method.

---

### serializeAttributes
Serializes just the model attributes.

```ts
user.serializeAttributes({
  omit: ['password']
})
```

---

### serializeComputed
Serializes just the computed properties.

```ts
user.serializeComputed()
```

---

### serializeRelations
Serializes just the preloaded relationships

```ts
user.serializeRelations()

// Cherry pick fields
user.serializeRelations({
  profile: {
    fields: {}
  },
  posts: {
    fields: {}
  }
})
```
