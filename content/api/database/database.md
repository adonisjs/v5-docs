The database module is

## connection
Returns the query client for a given connection. Uses the default connection, when no explicit connection name is defined.

```ts
Database.connection()

// named connection
Database.connection('pg')
```

You can also get the query client instance for a specific mode.

```ts
Database.connection('pg', { mode: 'write' })

// Read mode
Database.connection('pg', { mode: 'read' })
```

## beginGlobalTransaction
Begin a global transaction. All queries after beginning the global transaction will be executed within the transaction.

This method must be used when writing tests to have clean database state after each test.

```ts
await Database.beginGlobalTransaction()

// for a named connection
await Database.beginGlobalTransaction('pg')
```

## commitGlobalTransaction
Commit a previously created global transaction

```ts
await Database.commitGlobalTransaction()
await Database.commitGlobalTransaction('pg')
```

## rollbackGlobalTransaction
Rollbacks a previously created global transaction

```ts
await Database.rollbackGlobalTransaction()
await Database.rollbackGlobalTransaction('pg')
```

## report
Returns the health check report for all the registered connections.

```ts
const report = await Database.report()

console.log(report.name)
console.log(report.health.healthy)
```

## query
Alias for the [client.query](/api/database/query-client#query) method.

```ts
Database.query()
```

## insertQuery
Alias for the [client.insertQuery](/api/database/query-client#insert-query) method.

```ts
Database.insertQuery()
```

## modelQuery
Alias for the [client.modelQuery](/api/database/query-client#model-query) method.

```ts
import User from 'App/Models/User'
const query = Database.modelQuery(User)
```

## rawQuery
Alias for the [client.rawQuery](/api/database/query-client#raw-query) method.

```ts
await Database
  .rawQuery('select * from users where id = ?', [1])
```

## knexQuery
Alias for the [client.knexQuery](/api/database/query-client#knex-query) method.

```ts
Database.knexQuery()
```

## knexRawQuery
Alias for the [client.knexRawQuery](/api/database/query-client#knex-raw-query) method.

```ts
Database
  .knexRawQuery('select * from users where id = ?', [1])
```

## transaction
Alias for the [client.transaction](/api/database/query-client#transaction) method.

```ts
await Database.transaction()
```

## prettyPrint
A helper method to pretty print the query log emitted as `db:query` event.

```ts
import Event from '@ioc:Adonis/Core/Event'
Event.on('db:query', Database.prettyPrint)
```

## hasHealthChecksEnabled
A boolean to know if health checks is enabled for at least one connection or not.

```ts
console.log(Database.hasHealthChecksEnabled)
```

## primaryConnectionName
Returns the name of the default/primary connection name defined inside the `config/database` file.

```ts
console.log(Database.primaryConnectionName)
```

## manager
Returns reference to the [connections manager](/api/database/connections-manager)

```ts
console.log(Database.manager)
```
