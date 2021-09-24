---
summary: Reference to SQL transactions and save points with Lucid ORM
---

Lucid has first-class support for transactions and save points. You can create a new transaction by calling the `Database.transaction` method.

```ts
import Database from '@ioc:Adonis/Lucid/Database'

// Transaction created
const trx = await Database.transaction()
```

Just like the `Database` module. You can also use the `trx` object to create a query builder instance.

:::codegroup

```ts
// title: Insert
await trx
  .insertQuery()
  .table('users')
  .insert({ username: 'virk' })
```

```ts
// title: Select
await trx
  .query()
  .select('*')
  .from('users')
```

:::

Once done executing the query, you must `commit` or `rollback` the transaction. Otherwise, the queries will hang until timeout.

Following is a complete example of using transactions with an insert query.

```ts
const trx = await Database.transaction()

try {
  await trx
    .insertQuery()
    .table('users')
    .insert({ username: 'virk' })

  await trx.commit()
} catch (error) {
  await trx.rollback()
}
```

## Managed transactions
The above example expects you have to manually `commit` or `rollback` transactions by wrapping your code inside a `try/catch` block. A managed transaction does this automatically for you.

You can create a managed transaction by passing a callback to the `transaction` method. 

- The transaction auto commits after executing the callback.
- If a callback raises an exception, the transaction will be rolled back automatically and re-throws the exception.

```ts
await Database.transaction(async (trx) => {
  await trx
    .insertQuery()
    .table('users')
    .insert({ username: 'virk' })
})
```

You can also return a value from the callback and then access it at the top-level scope. For example:

```ts
const userId = await Database.transaction(async (trx) => {
  const response = await trx
    .insertQuery()
    .table('users')
    .insert({ username: 'virk' })

  return response[0] // 👈 return value
})
```

## Isolation levels
You can define the isolation level of a transaction when calling the `Database.transaction` method.

```ts
await Database.transaction({
  isolationLevel: 'read uncommitted'
})
```

Following is an example of defining the isolation level with a managed transaction.

```ts
await Database.transaction(async (trx) => {
  // use trx here
}, {
  isolationLevel: 'read committed'
})
```

Following is the list of available isolation levels.

- **"read uncommitted"**
- **"read committed"**
- **"snapshot"**
- **"repeatable read"**
- **"serializable"**

## Passing transaction as a reference
The transactions API is not only limited to creating a query builder instance from a transaction object. You can also pass it around to existing query builder instances or models.

```ts
import Database from '@ioc:Adonis/Lucid/Database'
const trx = await Database.transaction()

Database
  .insertQuery({ client: trx }) 👈
  .table('users')
  .insert({ username: 'virk' })
```

Or pass it at a later stage using the `useTransaction` method.

```ts
import Database from '@ioc:Adonis/Lucid/Database'
const trx = await Database.transaction()

Database
  .insertQuery()
  .table('users')
  .useTransaction(trx) 👈
  .insert({ username: 'virk' })
```

## Savepoints
Every time you create a nested transaction, Lucid behind the scenes creates a new [savepoint](https://en.wikipedia.org/wiki/Savepoint). Since transactions need a dedicated connection, using savepoints reduces the number of required connections.

```ts
import Database from '@ioc:Adonis/Lucid/Database'

// Transaction is created
const trx = await Database.transaction()

// This time, a save point is created
const savepoint = await trx.transaction()

 // also rollbacks the savepoint
await trx.rollback()
```

## Using transactions with Lucid models
You can pass the transaction to a model instance using the `useTransaction` method.

In the model class, you can access the transaction object using the `this.$trx` property. The property is only available during an ongoing transaction. After `commit` or `rollback`, it will be reset to `undefined`.

```ts
import User from 'App/Models/User'
import Database from '@ioc:Adonis/Lucid/Database'

// highlight-start
await Database.transaction(async (trx) => {
  const user = new User()
  user.username = 'virk'

  user.useTransaction(trx)
  await user.save()
})
// highlight-end
```

### Model query builder
Just like the standard query builder, you can also pass the transaction to the model query builder.

```ts
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'

const trx = await Database.transaction()

const users = await User
  .query({ client: trx }) 👈
  .where('is_active', true)
```

### Persisting relationships inside a transaction
The most common use case for transactions is to persist relationships. Consider the following example of **creating a new user** and **their profile** by wrapping them inside a single transaction.

```ts
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'

// highlight-start
await Database.transaction(async (trx) => {
  const user = new User()
  user.username = 'virk'

  user.useTransaction(trx)
  await user.save()

  /**
   * The relationship will implicitly reference the 
   * transaction from the user instance
   */
  await user.related('profile').create({
    fullName: 'Harminder Virk',
    avatar: 'some-url.jpg',
  })
})
// highlight-end
```

In the following example we fetch an existing user and create a new profile for them.

```ts
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'

// highlight-start
await Database.transaction(async (trx) => {
  const user = await User.findOrFail(1, { client: trx })

  /**
   * The relationship will implicitly reference the 
   * transaction from the user instance
   */
  await user.related('profile').create({
    fullName: 'Harminder Virk',
    avatar: 'some-url.jpg',
  })
})
// highlight-end
```
