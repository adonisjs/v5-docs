The [connection class](https://github.com/adonisjs/lucid/blob/efed38908680cca3b288d9b2a123586fab155b1d/src/Connection/index.ts#L27) is responsible for managing a given database connection.

You can get access to the registered connections as follows.

```ts
import Database from '@ioc:Adonis/Lucid/Database'
Database.manager.get('pg').connection
```

The `manager` property is a singleton instance of the [connections manager](https://github.com/adonisjs/lucid/blob/efed38908680cca3b288d9b2a123586fab155b1d/src/Connection/Manager.ts#L32) and you can get the connection instance by using the connection name.

### Where is the connection name?
The connection names are within the `config/database` file. The connection object key is the name of the connection.

In the following example `primary` is the connection name.

```ts
{
  connections: {
    primary: {
      client: 'pg',
      connection: {
        // ...
      },
    }
  }
}
```

### Methods/properties

### connect
Invoking the `connect` method instantiates a new Knex.js instance. If you are using read/write replicas then two Knex.js instances are created, one for write and one for read.

:::note
The `connect` method is called automatically when you run a new database query.
:::

```ts
connection.connect()
```

### disconnect
The `disconnect` method disconnects the underlying driver connection and destroys the knex instances.

```ts
await connection.disconnect()
```

### getReport
Returns the health check report for connection.

```ts
const report = await connection.getReport()
```

### pool/readPool
Reference to the underlying connection [tarnjs pool object](https://github.com/vincit/tarn.js/). Available only after the `connect` method is called.

```ts
connection.pool.numFree()
connection.readPool.numFree()
```

### client/readClient
Reference to the underlying knex instance. Available only after the `connect` method is called.

```ts
connection.client
connection.readClient
```

### hasReadWriteReplicas
A boolean to know if the connection is using read-write replicas or not.

```ts
connection.hasReadWriteReplicas
```

### ready
A boolean to know if the connection is ready to make queries. If not, then you must call the `connect` method.

```ts
if (!connection.ready) {
  connection.connect()
}
```

### config
Reference to the config object

```ts
connection.config
```

### name
The reference to the connection name

```ts
connection.name
```

## Events
The following events are emitted by a given connection

### connect
Emitted when the `connect` method is called

```ts
connection.on('connect', (self) => {
  console.log(self)
})
```

### error
Emitted when the unable to establish the connection

```ts
connection.on('error', (error, self) => {
  console.log(error)
})
```

### disconnect
Emitted when the connection and knex instance(s) have been destroyed.

```ts
connection.on('disconnect', (self) => {
  console.log(self)
})
```

### disconnect:error
Emitted when the unable to disconnect or destroy knex instance(s).

```ts
connection.on('disconnect:error', (error, self) => {
  console.log(error)
})
```
