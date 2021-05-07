---
summary: Raw query builder complete API reference
---

The raw query builder allows you execute queries from a SQL string. Even though you are directly executing raw SQL strings, you can still keep your queries safe from SQL injection by using placeholders for values.

## Executing query
Following is an example of executing query from a SQL string.

:::note
When executing raw queries, the results from the underlying driver are return as it is.
:::

```ts
import Database from '@ioc:Adonis/Lucid/Database'
await Database.rawQuery('select * from users')
```

### Using bindings
To prevent your queries from SQL injection. You should never hard code the user input into the queries directly and instead rely on placeholders and bindings. For example:

### Positional placeholders

```ts
Database.rawQuery(
  'select * from users where id = ?',
  [1]
)

// SELECT * FROM "users" WHERE "id" = 1
```

You can also pass in a dynamic column name using bindings. The `??` is parsed as a column name and `?` is parsed as a value.

```ts
Database.rawQuery(
  'select * from users where ?? = ?',
  ['users.id', 1]
)

// SELECT * FROM "users" WHERE "users"."id" = 1
```

### Named placeholders

You can also name placeholders and then use objects for defining bindings. For example:

```ts
Database.rawQuery(
  'select * from users where id = :id',
  {
    id: 1,
  }
)
```

You need to use also append the colon `:` after the placeholder when using a dynamic column name.

```ts
Database.rawQuery(
  'select * from users where :column: = :value',
  {
    column: 'id',
    value: 1,
  }
)
```

Another example comparing two columns with each other.

```ts
Database.rawQuery(
  'select * from user_logins inner join users on :column1: = :column2:',
  {
    column1: 'users.id',
    column2: 'user_logins.user_id',
  }
)

/**
SELECT * FROM
  user_logins
INNER JOIN
  users
ON
  "users"."id" = "user_logins"."user_id"
*/
```

## Raw query vs raw
There are two ways to create raw queries using the `Database` module.

```ts
Database.rawQuery('select * from users')
```

And

```ts
Database.raw('select * from users')
```

The `rawQuery` can be executed by using the `await` keyword or chaining the `then/catch` methods.

However, the output of `raw` method is meant to be used within other queries. For example

```ts
await Database.select(
  'id',
  Database.raw('select ip_address from user_logins'),
)
```

## Methods/Properties
Following is the list of methods and properties available on the raw query builder.

### wrap
Wrap the raw query with a prefix and a suffix. Usually helpful when passing the raw query as a reference.

```ts
await Database.select(
  'id',
  Database
    .raw('select ip_address from user_logins')
    .wrap('(', ')'),
)
```

### debug
The `debug` method allows enabling or disabling debugging at an individual query level. Here's a [complete guide](../../guides/database/debugging.md) on debugging queries.

```ts
await Database
  .rawQuery('select * from users')
  .debug(true)
```

---

### timeout
Define the `timeout` for the query. An exception is raised after the timeout has been exceeded.

The value of timeout is always in milliseconds.

```ts
await Database
  .rawQuery('select * from users')
  .timeout(2000)
```

You can also cancel the query when using timeouts with MySQL and PostgreSQL.

```ts
await Database
  .rawQuery('select * from users')
  .timeout(2000, { cancel: true })
```

---

### client
Reference to the instance of the underlying [database query client](./query-client.md).

```ts
const query = Database.rawQuery(sql, bindings)
console.log(query.client)
```

---

### knexQuery
Reference to the instance of the underlying KnexJS query.

```ts
const query = Database.rawQuery(sql, bindings)
console.log(query.knexQuery)
```

---

### reporterData
The query builder emits the `db:query` event and also reports the queries execution time with the framework profiler.

Using the `reporterData` method, you can pass additional details to the event and the profiler.

```ts
Database
  .rawQuery(sql, bindings)
  .reporterData({ userId: auth.user.id })
```

Now within the `db:query` event, you can access the value of `userId` as follows.

```ts
Event.on('db:query', (query) => {
  console.log(query.userId)
})
```
