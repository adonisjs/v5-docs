---
summary: Connection class complete API reference
---

The [connection class](https://github.com/adonisjs/lucid/blob/efed38908680cca3b288d9b2a123586fab155b1d/src/Connection/index.ts#L27) is responsible for managing the lifecycle of a given database connection. You can access the connection instance using the `Database.manager` property.

```ts
import Database from '@ioc:Adonis/Lucid/Database'

const { connection } = Database.manager.get('primary')
```

The connection name is derived from the `config/database.ts` file. In the following example, `primary` is the connection name.

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

## Methods/properties
Following is the list of the available methods and properties on the connection class. The user land code doesn't interact with the connection instance directly, as the following methods are invoked internally.

### connect
Invoking the `connect` method instantiates a new Knex.js instance. If you are using read/write replicas then two Knex.js instances are created, one for write and one for read.

:::note
The `connect` method is called automatically when you run a new database query.
:::

```ts
connection.connect()
```

---

### disconnect
The `disconnect` method disconnects the underlying driver connection and destroys the Knex instance(s).

```ts
await connection.disconnect()
```

---

### getReport
Returns the health check report for given connection.

```ts
const report = await connection.getReport()
```

---

### pool/readPool
Reference to the underlying [tarnjs pool object](https://github.com/vincit/tarn.js/). The property is available only after the `connect` method is called.

```ts
connection.pool.numFree()
connection.readPool.numFree()
```

---

### client/readClient
Reference to the underlying Knex instance. The property is available only after the `connect` method is called.

```ts
connection.client
connection.readClient
```

---

### hasReadWriteReplicas
A boolean to know if the connection is using read-write replicas or not.

```ts
connection.hasReadWriteReplicas
```

---

### ready
A boolean to know if the connection is ready to make queries. If not, then you must call the `connect` method.

```ts
if (!connection.ready) {
  connection.connect()
}
```

---

### config
Reference to the config object

```ts
connection.config
```

---

### name
The reference to the connection name

```ts
connection.name
```

---

## Events
Following is the list of events emitted by the connection class. 

### connect
Emitted when the `connect` method is called

```ts
connection.on('connect', (self) => {
  console.log(self === connection) // true
})
```

---

### error
Emitted when the unable to establish the connection

```ts
connection.on('error', (error, self) => {
  console.log(error)
})
```

---

### disconnect
Emitted when the connection and Knex instance(s) have been destroyed.

```ts
connection.on('disconnect', (self) => {
  console.log(self)
})
```

---

### disconnect\:error
Emitted when the unable to disconnect or destroy Knex instance(s).

```ts
connection.on('disconnect:error', (error, self) => {
  console.log(error)
})
```
