Lucid query builder allows you to write and execute SQL queries. It is built on top of [Knex.js](https://knexjs.org/#) with few opinionated changes.

We have divided the query builders into following categories

- The standard query builder allows you to construct SQL queries for **select**, **update** and **delete** operations.
- The insert query builder allows you to construct SQL queries for the **insert** operations.
- The raw query builder let you write and execute queries from a raw SQL string.

## Select queries
You can perform select operations by creating a query builder instance using the `.query` method.

```ts
import Database from '@ioc:Adonis/Lucid/Database'

const users = await Database
  .query()  // 👈 gives an instance of select query builder
  .from('users')
  .select('*')
```

You can also create the query builder instance by directly calling the `.from` method.

```ts
import Database from '@ioc:Adonis/Lucid/Database'

const users = await Database
  .from('users') // 👈 gives an instance of select query builder
  .select('*')
```

<div class="doc-cta-wrapper">

[Query builder reference guide →](../../api/database/query-builder.md)

</div>

## Insert queries
The insert query builder exposes the API to insert new rows to the database. You can get an instance of the query builder using the `.insertQuery` method.

```ts
import Database from '@ioc:Adonis/Lucid/Database'

await Database
  .insertQuery() // 👈 gives an instance of insert query builder
  .table('users')
  .insert({ username: 'virk', email: 'virk@adonisjs.com' })
```

You can also create the query builder instance by directly calling the `.table` method.

```ts
await Database
  .table('users') // 👈 gives an instance of insert query builder
  .insert({ username: 'virk', email: 'virk@adonisjs.com' })
```

### Multi insert
You can make use of the `.multiInsert` method in order to insert multiple rows in a single insert query.

:::note
MySQL and SQLite only returns the id for the last row and not all the rows.
:::

```ts
await Database.table('users').multiInsert([
  { username: 'virk' },
  { username: 'romain' },
])
```

<div class="doc-cta-wrapper">

[Insert query builder reference guide →](../../api/database/insert-query-builder.md)

</div>

## Raw queries
Raw queries allows to execute a SQL statement from a string input. This is usually helpful, when you want to execute complex queries that are not supported by the standard query builder.

You can create an instance of the raw query builder using the `.rawQuery` metho. It accepts the SQL string as the first argument and its positional/named bindings as the second argument.

```ts
import Database from '@ioc:Adonis/Lucid/Database'

const user = await Database
  .rawQuery('select * from users where id = ?', [1])
```

<div class="doc-cta-wrapper">

[Raw query builder reference guide →](../../api/database/raw-query-builder.md)

</div>

## Extending the query builder
