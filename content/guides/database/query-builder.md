---
summary: Reference to the database query builder
---

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

[Query builder reference guide →](../../reference/database/query-builder.md)

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

### Multi-insert
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

[Insert query builder reference guide →](../../reference/database/insert-query-builder.md)

</div>

## Raw queries
Raw queries allows to execute a SQL statement from a string input. This is usually helpful, when you want to execute complex queries that are not supported by the standard query builder.

You can create an instance of the raw query builder using the `.rawQuery` method. It accepts the SQL string as the first argument and its positional/named bindings as the second argument.

```ts
import Database from '@ioc:Adonis/Lucid/Database'

const user = await Database
  .rawQuery('select * from users where id = ?', [1])
```

<div class="doc-cta-wrapper">

[Raw query builder reference guide →](../../reference/database/raw-query-builder.md)

</div>

## Extending query builders
You can extend the query builder classes using **macros** and **getters**. The best place to extend the query builders is inside a custom service provider.

Open the pre-existing `providers/AppProvider.ts` file and write the following code inside the `boot` method.

```ts
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public async boot() {
    // highlight-start
    const {
      DatabaseQueryBuilder
    } = this.app.container.use('Adonis/Lucid/Database')

    DatabaseQueryBuilder.macro('getCount', async function () {
      const result = await this.count('* as total')
      return BigInt(result[0].total)
    })
    // highlight-end
  }
}
```

In the above example, we have added a `getCount` method on the [database query builder](../../reference/database/query-builder.md). The method adds a `count` function to the query, executes it right away and returns the result back as a **BigInt**.

###  Informing TypeScript about the method
The `getCount` property is added at the runtime, and hence TypeScript does not know about it. To inform the TypeScript, we will use [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces) and add the property to the `DatabaseQueryBuilderContract` interface.

Create a new file at path `contracts/database.ts` (the filename is not important) and paste the following contents inside it.

```ts
// title: contracts/database.ts
declare module '@ioc:Adonis/Lucid/Database' {
  interface DatabaseQueryBuilderContract<Result> {
    getCount(): Promise<BigInt>
  }
}
```

### Test run
Let's try using the `getCount` method as follows:

```ts
await Database.query().from('users').getCount()
```

## Extending ModelQueryBuilder
Similar to the `DatabaseQueryBuilder`, you can also extend the [ModelQueryBuilder](../../reference/orm/query-builder.md) as follows.

#### Runtime code

```ts
const {
  ModelQueryBuilder
} = this.app.container.use('Adonis/Lucid/Database')

ModelQueryBuilder.macro('getCount', async function () {
  const result = await this.count('* as total')
  return BigInt(result[0].$extras.total)
})
```

#### Extending the type definition

```ts
declare module '@ioc:Adonis/Lucid/Orm' {
  interface ModelQueryBuilderContract<
    Model extends LucidModel,
    Result = InstanceType<Model>
  > {
    getCount(): Promise<BigInt>
  }
}
```

#### Usage

```ts
import User from 'App/Models/User'
await User.query().getCount()
```

## Extending InsertQueryBuilder
Finally you can also extend the [InsertQueryBuilder](../../reference/database/insert-query-builder.md) as follows.

#### Runtime code

```ts
const {
  InsertQueryBuilder
} = this.app.container.use('Adonis/Lucid/Database')

InsertQueryBuilder.macro('customMethod', async function () {
  // implementation
})
```

#### Extending the type definition

```ts
declare module '@ioc:Adonis/Lucid/Database' {
  interface InsertQueryBuilderContract<Result = any> {
    customMethod(): Promise<any>
  }
}
```

#### Usage

```ts
import Database from '@ioc:Adonis/Lucid/Database'
await Database.insertQuery().customMethod()
```
