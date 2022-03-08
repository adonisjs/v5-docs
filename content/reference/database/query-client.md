---
summary: Query client complete API reference
---

The [Query client](https://github.com/adonisjs/lucid/blob/efed38908680cca3b288d9b2a123586fab155b1d/src/QueryClient/index.ts#L38) works a bridge between the [connection](./connection.md) and the [query builder](./query-builder.md) to execute the database queries. Also, it exposes the required APIs used by the query builder to direct read queries to the read replica and writes the write replica.

You can access the query client as follows:

```ts
import Database from '@ioc:Adonis/Lucid/Database'

// returns client for the default connection
const client = Database.connection()

// returns client for a named connection
const pgClient = Database.connection('pg')
```

## Methods/Properties
Following is the list of methods and properties available on the query client class.

### query
Returns an instance of the [query builder](./query-builder.md) for a pre-selected database connection.

```ts
client.query()
```

You can also use the `from` alias to instantiate a new query instance and select the table.

```ts
client.from('users')
```

---

### insertQuery
Returns an instance of the [insert query builder](./insert-query-builder.md) for a pre-selected database connection.

```ts
client.insertQuery()
```

You can also use the `table` alias to instantiate a new query instance and select the table.

```ts
client.table('users')
```

---

### modelQuery
Returns an instance of the [model query builder](../orm/query-builder.md) for a given Lucid model.

```ts
import User from 'App/Models/User'

const query = client.modelQuery(User)

const user = await query.first()
console.log(user instanceof User) // true
```

---

### rawQuery
Returns an instance of the [raw query builder](./raw-query-builder.md) for a pre-selected database connection.

```ts
await client
  .rawQuery('select * from users where id = ?', [1])
```

---

### knexQuery
Returns an instance of the [Knex.js query builder](https://knexjs.org/#Builder) for a pre-selected database connection.

```ts
client.knexQuery().select('*')
```

---

### knexRawQuery
Returns an instance of the [Knex.js raw query builder](https://knexjs.org/#Raw) for a pre-selected database connection.

```ts
client
  .knexRawQuery('select * from users where id = ?', [1])
```

---

### transaction
Creates a new [transaction client](./transaction-client.md) instance. Transaction client **reserves a dedicated database** connection right away and hence it is very important to commit or rollback the transactions properly.

```ts
const trx = await client.transaction()
await trx.insertQuery().table('users').insert()

await trx.commit()
```

---

### getAllTables
Returns an array of all the database tables.

```ts
const tables = await client.getAllTables()
console.log(tables)
```

---

### getAllViews
Returns an array of all the database views.

```ts
const views = await client.getAllViews()
console.log(views)
```

---

### getAllTypes
Returns an array of all the database custom types. The method works only with **Postgres and Redshift**.

```ts
const types = await client.getAllTypes()
console.log(types)
```

---

### columnsInfo
Returns a key-value pair of columns in a given database table.

```ts
const columns = await client.columnsInfo('users')
console.log(columns)
```

---

### dropAllTables
Drop all tables inside the database.

```ts
await client.dropAllTables()

// specify schemas ( for Postgres and Redshift )
await client.dropAllTables(['public'])
```

---

### dropAllViews
Drop all views inside the database.

```ts
await client.dropAllViews()

// specify schemas ( for Postgres and Redshift )
await client.dropAllViews(['public'])
```

---

### dropAllTypes
Drop all custom types inside the database. The method works only with **Postgres and Redshift**.

```ts
await client.dropAllTypes()
```

---

### truncate
Truncate a database table. Optionally you can also cascade foreign key references.

```ts
await client.truncate('users')

// cascade
await client.truncate('users', true)
```

---

### getReadClient
Returns Knex.js instance for the read replica. The write client is returned when not using read/write replicas.

```ts
const knex = client.getReadClient()
```

---

### getWriteClient
Returns Knex.js instance for the write replica. An exception is raised when client is instantiated in the read mode.

```ts
const knex = client.getWriteClient()
```

---

### getAdvisoryLock
Calling `getAdvisoryLock` obtains an advisory lock in **PostgreSQL**, and **MySQL** databases.

:::note
Advisory locks are used by database migrations to prevent multiple processes from migrating the database at the same time.
:::

```ts
await client.getAdvisoryLock('key_name')

// custom timeout
await client.getAdvisoryLock('key_name', 2000)
```

---

### releaseAdvisoryLock
Release the previously acquired advisory lock

```ts
await client.releaseAdvisoryLock('key_name')
```

---

### raw
Create a raw reference query instance. The queries generated using the `raw` method can only be used as a reference in other queries and cannot be executed standalone.

```ts
await client.from(
  client.raw('select ip_address from user_logins')
)
```

---

### mode
A readonly property to know the mode in which client instance was created. It is always one of the following

- `dual`: Both read/write queries are supported and will be directed to the correct replica.
- `write`: Read queries will also be sent to the `write` replica.
- `read`: No write queries can be executed.

```ts
console.log(client.mode)
```

---

### dialect
Reference to the underlying [database dialect](https://github.com/adonisjs/lucid/tree/master/src/Dialects). Each supported database driver has its own dialect.

```ts
console.log(client.dialect.name)
```

---

### isTransaction
Find if the client is a transaction client. The value is always `false` for the query client.

```ts
client.isTransaction
```

---

### connectionName
The connection name for which the query client was instantiated

```ts
client.connectionName
```

---

### debug
Set the value to `true` to enable debugging for queries executed by the query client.

```ts
client.debug = true

await client.from('users').select('*')
```

---

### schema
Returns reference to the [schema builder](./schema-builder.md). The `client.schema` is a getter that returns a new instance every time you access the property

```ts
await client.schema.createTable('users', (table) => {
})
```
