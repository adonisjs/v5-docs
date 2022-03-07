---
summary: Perform CRUD operations using the Lucid data models.
---

Lucid models make it very easy to perform CRUD operations and also define lifecycle hooks around each operation.

This guide covers 80% of the use cases. However, do make sure to check the [Model API docs](../../reference/orm/base-model.md) docs for all the available methods.

## Create
You can create and persist new records to the database by first assigning values to the model instance and then calling the `save` method.

The `save` method performs the **INSERT** query when persisting the model instance for the first time and performs the **UPDATE** query when the model has persisted.

```ts
import User from 'App/Models/User'
const user = new User()

// Assign username and email
user.username = 'virk'
user.email = 'virk@adonisjs.com'

// Insert to the database
await user.save()

console.log(user.$isPersisted) // true
```

Also, you can use the `fill` method to define all the attributes as once and then call the `save` method.

```ts
await user
  .fill({ username: 'virk', email: 'virk@adonisjs.com' })
  .save()

console.log(user.$isPersisted) // true
```

---

### create
The `static create` method creates the model instance and persists it to the database in one go.

```ts
import User from 'App/Models/User'

const user = await User.create({
  username: 'virk',
  email: 'virk@adonisjs.com',
})

console.log(user.$isPersisted) // true
```

---

### createMany
Create multiple instances of a model and persist them to the database. The `createMany` method accepts the same options as the `create` method.

:::note
One insert query is issued for each model instance to execute the lifecycle hooks for every instance.
:::

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

## Read
You can query the database table using one of the following static methods.

### all
Fetch all the users from the database. The method returns an array of model instances.

```ts
const user = await User.all()
// SQL: SELECT * from "users" ORDER BY "id" DESC;
```

---

### find
Find a record using the primary key. The method returns a model instance or null (when no records are found).

```ts
const user = await User.find(1)
// SQL: SELECT * from "users" WHERE "id" = 1 LIMIT 1;
```

---

### findBy
Find a record by a column name and its value. Similar to the `find` method, this method also returns a model instance or `null`.

```ts
const user = await User.findBy('email', 'virk@adonisjs.com')
// SQL: SELECT * from "users" WHERE "email" = 'virk@adonisjs.com' LIMIT 1;
```

---

### first
Fetch the first record from the database. Returns `null` when there are no records.

```ts
const user = await User.first()
// SQL: SELECT * from "users" LIMIT 1;
```

---

### orFail variation
You can also use the `orFail` variation for the find methods. It raises an exception when no row is found.

```ts
const user = await User.findOrFail(1)
const user = await User.firstOrFail()
const user = await User.findByOrFail('email', 'virk@adonisjs.com')
```

The `orFail` variation will raise an `E_ROW_NOT_FOUND` exception with `404` statusCode. You can [manually handle](../http/exception-handling.md#http-exception-handler) this exception to convert it to a desired response.

---

### Using the query builder
The above-mentioned static methods cover the common use cases for querying the database. However, you are not only limited to these methods and can also leverage the query builder API for making advanced SQL queries.

:::note

The [model query builder](../../reference/orm/query-builder.md) returns an array of model instances and not the plain JavaScript object(s).

:::

You can get an instance of a query builder for your model using the `.query` method.

```ts
const users = await User
  .query() // 👈now have access to all query builder methods
  .where('countryCode', 'IN')
  .orWhereNull('countryCode')
```

To fetch a single row, you can make use of the `.first` method. There is also a `firstOrFail` method.

```ts
const users = await User
  .query()
  .where('countryCode', 'IN')
  .orWhereNull('countryCode')
  .first() // 👈 Adds `LIMIT 1` clause
```

## Update
The standard way to perform updates using the model is to look up the record and then update/persist it to the database.

```ts
const user = await User.findOrFail(1)
user.lastLoginAt = DateTime.local() // Luxon dateTime is used

await user.save()
```

Also, you can use the `merge` method to define all the attributes at once and then call the `save` method.

```ts
await user
  .merge({ lastLoginAt: DateTime.local() })
  .save()
```

#### Why not use the update query directly?
Another way to update the records is to perform an update using the query builder manually. For example

```ts
await User
  .query()
  .where('id', 1)
  .update({ lastLoginAt: new Date() })
```

However, updating records directly does not trigger any model hooks and neither auto-update the timestamps.

We recommend not stressing much on the extra `select` query unless dealing with millions of updates per second and happy leaving the model's features.

## Delete
Like the `update` operation, you first fetch it from the database and delete the row. For example

```ts
const user = await User.findOrFail(1)
await user.delete()
```

Again, for hooks to work, Lucid needs the instance of the model first. If you decide to use the query builder directly, then the model will not fire any hooks.

However, the direct query builder approach can help perform bulk deletes.

```ts
await User.query().where('isVerified', false).delete()
```

## Idempotent methods
Models come with many helpful methods to simplify the record creation by first finding them inside the database and running the create/update queries only when the record doesn't exist.

### firstOrCreate
Search for a record inside the database or create a new one (only when the lookup fails).

In the following example, we attempt to search a user with an email but persist both the `email` and the `password`, when the initial lookup fails. In other words, the `searchPayload` and the `savePayload` are merged during the create call.

```ts
import User from 'App/Models/User'

const searchPayload = { email: 'virk@adonisjs.com' }
const savePayload = { password: 'secret' }

await User.firstOrCreate(searchPayload, savePayload)
```

---

### fetchOrCreateMany

The `fetchOrCreateMany` is similar to the `firstOrCreate` method, but instead, you can create more than one row. The method needs a unique key for finding the duplicate rows and an array of objects to persist (if missing inside the database).

```ts
import User from 'App/Models/User'

const usersToCreate = [
  {
    email: 'foo@example.com',
  },
  {
    email: 'bar@example.com',
  },
  {
    email: 'baz@example.com',
  }
]

await User.fetchOrCreateMany('email', usersToCreate)
```

---

### updateOrCreate
The `updateOrCreate` either creates a new record or updates the existing record. Like the `firstOrCreate` method, you need to define a search payload and the attributes to insert/update.

```ts
import User from 'App/Models/User'

const searchPayload = { email: 'virk@adonisjs.com' }
const persistancePayload = { password: 'secret' }

await User.updateOrCreate(searchPayload, persistancePayload)
```

---

### updateOrCreateMany
The `updateOrCreateMany` method allows syncing rows by avoiding duplicate entries. The method needs a unique key for finding the duplicate rows and an array of objects to persist/update.

```ts
import User from 'App/Models/User'

const usersToCreate = [
  {
    email: 'foo@example.com',
  },
  {
    email: 'bar@example.com',
  },
  {
    email: 'baz@example.com',
  }
]

await User.updateOrCreateMany('email', usersToCreate)
```

## Additional reading

- Checkout the [Base model reference guide](../../reference/orm/base-model.md) to view all the available methods and properties.
- Also, read the reference docs for the [model query builder](../../reference/orm/query-builder.md).
