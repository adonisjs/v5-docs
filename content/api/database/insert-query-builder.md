---
summary: Insert query builder API reference
---

The insert query builder allows you to insert new rows into the database. You must use the [standard query builder](./query-builder.md) for **selecting**, **deleting** or **updating** rows.

You can get access to the insert query builder as shown in the following example:

```ts
import Database from '@ioc:Adonis/Lucid/Database'

Database.insertQuery()

// selecting table also returns an instance of the query builder
Database.table('users')
```

## Methods/Properties
Following is the list of methods and properties available on the Insert query builder class.

### insert
The `insert` method accepts an object of key-value pair to insert.

The return value of the insert query is highly dependent on the underlying driver.

- MySQL returns the id of the last inserted row.
- SQLite returns the id of the last inserted row.
- For PostgreSQL, MSSQL, and Oracle, you must use the `returning` method to fetch the value of the id.

```ts
Database
  .table('users')
  .returning('id')
  .insert({
    username: 'virk',
    email: 'virk@adonisjs.com',
    password: await Hash.make('secret'),
  })
```

---

### multiInsert
The `multiInsert` method accepts an array of objects and inserts multiple rows at once.

```ts
Database
  .table('users')
  .multiInsert([
    {
      username: 'virk',
      email: 'virk@adonisjs.com',
      password: await Hash.make('secret'),
    },
    {
      username: 'romain',
      email: 'romain@adonisjs.com',
      password: await Hash.make('secret'),
    }
  ])

/**
INSERT INTO "users"
  ("email", "password", "username")
values
  ('virk@adonisjs.com', '$argon2id...', 'virk'),
  ('romain@adonisjs.com', '$argon2id...', 'romain')
*/
```

---

### returning
You can use the `returning` method with PostgreSQL, MSSQL, and Oracle databases to retrieve one or more columns' values.

```ts
const rows = Database
  .table('users')
  .returning(['id', 'username'])
  .insert({
    username: 'virk',
    email: 'virk@adonisjs.com',
    password: await Hash.make('secret'),
  })

console.log(rows[0].id, rows[0].username)
```

---

### debug
The `debug` method allows enabling or disabling debugging at an individual query level. Here's a [complete guide](../../guides/database/debugging.md) on debugging queries.

```ts
const rows = Database
  .table('users')
  .debug(true) // 👈
  .insert({
    username: 'virk',
    email: 'virk@adonisjs.com',
    password: await Hash.make('secret'),
  })
```

---

### timeout
Define the `timeout` for the query. An exception is raised after the timeout has been exceeded.

The value of timeout is always in milliseconds.

```ts
Database
  .table('users')
  .timeout(2000) // 👈
  .insert({
    username: 'virk',
    email: 'virk@adonisjs.com',
    password: await Hash.make('secret'),
  })
```

You can also cancel the query when using timeouts with MySQL and PostgreSQL.

```ts
Database
  .table('users')
  .timeout(2000, { cancel: true })
  .insert({
    username: 'virk',
    email: 'virk@adonisjs.com',
    password: await Hash.make('secret'),
  })
```

---

### toSQL
The `toSQL` method returns the query SQL and bindings as an object.

```ts
const output = Database
  .table('users')
  .insert({
    username: 'virk',
    email: 'virk@adonisjs.com',
    password: await Hash.make('secret'),
  })
  .toSQL() // 👈

console.log(output)
```

The `toSQL` object also has the `toNative` method to format the SQL query as per the database dialect in use.

```ts
const output = Database
  .table('users')
  .insert({
    username: 'virk',
    email: 'virk@adonisjs.com',
    password: await Hash.make('secret'),
  })
  .toSQL()
  .toNative()

console.log(output)
```

---

### toQuery
Returns the SQL query as a string with bindings applied to the placeholders.

```ts
const output = Database
  .table('users')
  .insert({
    username: 'virk',
    email: 'virk@adonisjs.com',
    password: await Hash.make('secret'),
  })
  .toQuery()

console.log(output)
/**
INSERT INTO "users"
  ("email", "password", "username")
values
  ('virk@adonisjs.com', '$argon2id...', 'virk')
*/
```

---

### useTransaction
The `useTransaction` method instructs the query builder to wrap the query inside a transaction. The guide on [database transactions](../../guides/database/transactions.md) covers different ways to create and use transactions in your application.

```ts
const trx = await Database.transaction()

await Database
  .table('users')
  .useTransaction(trx) // 👈
  .insert({
    username: 'virk',
    email: 'virk@adonisjs.com',
    password: await Hash.make('secret'),
  })

await trx.commit()
```

## Helpful properties and methods
Following is the list of properties and methods you may occasionally need when building something on top of the query builder.

### client
Reference to the instance of the underlying [database query client](./query-client.md).

```ts
const query = Database.insertQuery()
console.log(query.client)
```

---

### knexQuery
Reference to the instance of the underlying KnexJS query.

```ts
const query = Database.insertQuery()
console.log(query.knexQuery)
```

---

### reporterData
The query builder emits the `db:query` event and reports the query's execution time with the framework profiler.

Using the `reporterData` method, you can pass additional details to the event and the profiler.

```ts
const query = Database.table('users')

await query
  .reporterData({ userId: auth.user.id })
  .insert({
    username: 'virk',
    email: 'virk@adonisjs.com',
    password: await Hash.make('secret'),
  })
```

Within the `db:query` event, you can access the value of `userId` as follows.

```ts
Event.on('db:query', (query) => {
  console.log(query.userId)
})
```
