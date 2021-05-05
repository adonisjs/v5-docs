---
summary: Database class complete API reference
---

The database module exposes the APIs to interact with the SQL databases. You can import the module as follows:

```ts
import Database from '@ioc:Adonis/Lucid/Database'
```

## Methods/Properties
Following is the list of methods/properties available on the database module.

### connection
Returns the query client for a given connection. Uses the default connection, when no explicit connection name is defined.

```ts
Database.connection()

// named connection
Database.connection('pg')
```

You can also get the query client instance for a specific mode.

```ts
Database.connection('pg', { mode: 'write' })

// Write queries are not allowed in read mode
Database.connection('pg', { mode: 'read' })
```

---

### beginGlobalTransaction
Begin a global transaction. All queries after beginning the global transaction will be executed within the transaction.

:::warning

We recommend using this method only during the tests.

:::

```ts
await Database.beginGlobalTransaction()

// for a named connection
await Database.beginGlobalTransaction('pg')
```

---

### commitGlobalTransaction
Commit a previously created global transaction

```ts
await Database.commitGlobalTransaction()
await Database.commitGlobalTransaction('pg')
```

---

### rollbackGlobalTransaction
Rollbacks a previously created global transaction

```ts
await Database.rollbackGlobalTransaction()
await Database.rollbackGlobalTransaction('pg')
```

---

### report
Returns the health check report for all the registered connections.

```ts
const report = await Database.report()

console.log(report.name)
console.log(report.health.healthy)
```

---

### query
Alias for the [client.query](./query-client.md#query) method.

```ts
Database.query()
```

---

### insertQuery
Alias for the [client.insertQuery](./query-client.md#insert-query) method.

```ts
Database.insertQuery()
```

---

### modelQuery
Alias for the [client.modelQuery](./query-client.md#model-query) method.

```ts
import User from 'App/Models/User'
const query = Database.modelQuery(User)
```

---

### rawQuery
Alias for the [client.rawQuery](./query-client.md#raw-query) method.

```ts
await Database
  .rawQuery('select * from users where id = ?', [1])
```

---

### knexQuery
Alias for the [client.knexQuery](./query-client.md#knex-query) method.

```ts
Database.knexQuery()
```

---

### knexRawQuery
Alias for the [client.knexRawQuery](./query-client.md#knex-raw-query) method.

```ts
Database
  .knexRawQuery('select * from users where id = ?', [1])
```

---

### ref
The `ref` method allows you to reference a database column name as a value. For example:

```ts
Database
  .from('users')
  .where('users.id', '=', Database.ref('user_logins.user_id'))
```

---

### raw
The `raw` method creates an instance of the [RawBuilder](https://github.com/adonisjs/lucid/blob/develop/src/Database/StaticBuilder/Raw.ts). This query is meant to be used as a reference inside another query.

#### What is the difference between `rawQuery` and `raw`?
You can execute the query created using `rawQuery` method. Whereas, the query created using `raw` method can only be passed as a reference.

```ts
Database
  .from('users')
  .select('*')
  .select(
    Database
      .raw('select "ip_address" from "user_logins" where "users.id" = "user_logins.user_id" limit 1')
      .wrap('(', ')')
  )
```

---

### from
A shortcut method to get an instance of the [Query builder](./query-builder.md) for the primary connection.

```ts
Database.from('users')
// Is same as
Database.connection().from('users')
```

---

### table
A shortcut method to get an instance of the [Insert Query builder](./insert-query-builder.md) for the primary connection.

```ts
Database.table('users')
// Is same as
Database.connection().table('users')
```

---

### transaction
Alias for the [client.transaction](./query-client.md#transaction) method.

```ts
await Database.transaction()
```

---

### prettyPrint
A helper method to pretty print the query log emitted as `db:query` event.

```ts
import Event from '@ioc:Adonis/Core/Event'
Event.on('db:query', Database.prettyPrint)
```

---

### hasHealthChecksEnabled
A boolean to know if health checks is enabled for at least one connection or not.

```ts
console.log(Database.hasHealthChecksEnabled)
```

---

### primaryConnectionName
Returns the name of the default/primary connection name defined inside the `config/database` file.

```ts
console.log(Database.primaryConnectionName)
```

---

### manager
Returns reference to the [connections manager](./connection-manager.md)

```ts
console.log(Database.manager)
```
