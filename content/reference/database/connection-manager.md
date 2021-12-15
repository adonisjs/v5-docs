---
summary: Connection manager class complete API reference
---

The [connections manager class](https://github.com/adonisjs/lucid/blob/efed38908680cca3b288d9b2a123586fab155b1d/src/Connection/Manager.ts#L32) is responsible for managing one or more [database connection](./connection.md) instances. You can access the `manager` from the Database module.

```ts
import Database from '@ioc:Adonis/Lucid/Database'

const manager = Database.manager
```

## Methods/properties
Following is the list of methods/properties available on the connection manager class. Usually, you don't have to interact with the manager directly, as the following methods are invoked internally.

### add
Register a new connection to the manager by providing the connection `name` and it's configuration. The database module automatically registers all the connections defined inside the `config/database.ts` file.

```ts
const name = 'pg'

const config = {
  client: 'pg',
  connection: {
    // ...
  },
  healthCheck: true
}

Database.manager.add(name, config)
```

---

### connect
The `connect` method instantiates a pre-registered connection by its name. Under the hood, it calls the connect method on the [Connection class](https://github.com/adonisjs/lucid/blob/efed38908680cca3b288d9b2a123586fab155b1d/src/Connection/Manager.ts#L126).

Calling this method multiple times results is a no-op.

```ts
Database.manager.connect('pg')
```

---

### get
Returns the connection node for a pre-registered connection by its name.

```ts
const {
  name,
  state,
  connection,
  config
} = Database.manager.get('pg')
```

Following is the list of available properties.

#### name
The name of the connection, as defined at the time of adding it.

---

#### config
Reference to the registered config

---

#### connection
Reference to the underlying [connection class](./connection.md) instance. 

---

#### state
The current state of the connection.

- `registered`: The connection has been registered using the `add` method.
- `open`: The connection is open to accept new requests.
- `closing`: In the process of closing the connection. No new queries can be created or executed from this connection anymore.
- `closed`: The connection has been closed and cannot accept any more request. You must call the `connect` method again.
- `migrating`: The connection config has been patched and it is migrating to create a new connection instance with the new config.

---

### has
Returns a boolean telling if the connection has been registered with the manager or not.

```ts
if (!Database.manager.has('pg')) {
  Database.manager.add('pg', {})
}
```

---

### isConnected
Find if a connection is in `open` state or not.

```ts
if (!Database.manager.isConnected('pg')) {
  Database.manager.connect('pg')
}
```

---

### patch
The `patch` method allows you to update the config for a given connection without closing the existing connection or aborting the ongoing queries.

After the connection has been patched, all new queries will use the newer config.

The `patch` method is really helpful when you have a multi-tenant app and you want to register connections on the fly for the tenants.

```ts
Database.manager.patch('pg', {
  client: 'pg',
  connection: {},
})

// Uses new config
Database.manager.connect('pg')
```

---

### close
Close a given connection. The connection manager will still keep the connection node until you release the connection explicitly by passing the second argument.

```ts
// Close
await Database.manager.close('pg')
Database.manager.has('pg') // true
```

```ts
// Close + Release
await Database.manager.close('pg', true)
Database.manager.has('pg') // false
```

---

### closeAll
Close all registered connections. A boolean parameter can be passed to also release the connection.

```ts
await Database.manager.closeAll()
await Database.manager.closeAll(true)
```

---

### release
Release a connection from the managed list of connections. The connection will be closed automatically (if not already closed).

```ts
await Database.manager.release(true)
```

---

### report
Returns the health check report for all the registered connections.

```ts
const report = await Database.manager.report()

console.log(report.name)
console.log(report.health.healthy)
```

## Events
Following is the list of events emitted by the connection manager class. 

### db\:connection\:connect
Emitted when the `connect` method is called

```ts
Database.manager.on('db:connection:connect', (connection) => {
  console.log(self === connection) // true
})
```

---

### db\:connection\:error
Emitted when the unable to establish the connection

```ts
Database.manager.on('db:connection:error', (error, connection) => {
  console.log(connection)
})
```

---

### db\:connection\:disconnect
Emitted when the connection and Knex instance(s) have been destroyed.

```ts
Database.manager.on('db:connection:disconnect', (connection) => {
  console.log(connection)
})
```
