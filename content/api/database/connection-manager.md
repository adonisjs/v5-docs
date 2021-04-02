The [connections manager class](https://github.com/adonisjs/lucid/blob/efed38908680cca3b288d9b2a123586fab155b1d/src/Connection/Manager.ts#L32) is responsible for managing the lifecycle of one or more [database connections](/api/database/connection).

You can get access to the manager instance as follows.

```ts
import Database from '@ioc:Adonis/Lucid/Database'
Database.manager.has('pg')
```

## Methods/properties
Following is the list of properties/methods available on the Connection Manager class.

### add
You must begin by the adding a new connection with the manager class.

```ts
Database.manager.add('pg', {
  client: 'pg',
  connection: {
    // ...
  },
  healthCheck: true
})
```

### connect
The `connect` method instantiates a new connection instance for a named connection. Make sure to first add the connection using the `add` method and then call the `connect` method.

The connect method results in a noop when the connection already exists.

```ts
// creates the connection
Database.manager.connect('pg')

// following calls results in a noop
Database.manager.connect('pg')
Database.manager.connect('pg')
Database.manager.connect('pg')
```

### get
Returns the connection node for a named connection.

```ts
Database.manager.get('pg')
```

The connection node has following properties.

- **name**: The name of the connection
- **config**: Reference to the connection config
- **connection?**: Reference to the underlying [connection object](/api/database/connection).
- **state**: The connection state. It will be in one of the following states.
  - `registered`: The connection has just registered using the `add` method.
  - `migrating`: The connection config has been patched and it is migrating to create a new connection instance with the new config
  - `open`: The connection is open to accept new requests.
  - `closing`: Initiated the process of closing the connection.
  - `closed`: Connection is closed and cannot accept new requests.

### has
Returns a boolean telling if the connection has been registered with the manager or not.

```ts
if (!Database.manager.has('pg')) {
  Database.manager.add('pg', {})
}
```

### isConnected
Find if a connection is in `open` state or not.

```ts
if (!Database.manager.isConnected('pg')) {
  Database.manager.connect('pg')
}
```

### patch
The `patch` method allows you to update the config for a given connection without closing the existing connection or aborting the on-going queries.

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

### close
Close a given connection.

```ts
await Database.manager.close('pg')
Database.manager.has('pg') // true
```

You can pass a second boolean parameter to release the connection from the manager.

```ts
await Database.manager.close('pg', true)
Database.manager.has('pg') // false
```

### closeAll
Close all registered connections. A boolean parameter can be passed to also release the connection.

```ts
await Database.manager.closeAll()
await Database.manager.closeAll(true)
```

### release
Release a connection from the managed list of connections. The connection will be closed automatically (if not already closed).

```ts
await Database.manager.release(true)
```

### report
Returns the health check report for all the registered connections.

```ts
const report = await Database.manager.report()

console.log(report.name)
console.log(report.health.healthy)
```
