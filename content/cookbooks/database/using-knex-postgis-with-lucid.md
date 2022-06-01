The guides cover the process of using the Knex Postgis extension with the Lucid ORM.

The [knex-postgis](https://github.com/jfgodoy/knex-postgis) is an npm package that hooks itself into an instance of Knex and provides the JavaScript API for using the [Postgis](https://postgis.net/) functions.

Since Lucid uses Knex under the hood, you can use this package within your AdonisJS applications.

## Extending the Database module
:::note
Make sure you are using `@adonisjs/lucid >= 16.13.1` to follow this cookbook.
:::

If you look at the `knex-postgis` usage documentation, you will find it needs an instance of the knex connection and returns an object with the available methods.

```ts
// title: Usage with Knex directly
const knex = require('knex')
const knexPostgis = require('knex-postgis')

// Knex connection
const db = knex({ client: 'postgres' })

// Return value "st" has the API for Postgis extension
const st = knexPostgis(db)
```

Since the management of connections is abstracted with Lucid, we need a graceful API to grab the `st` object for any connection on-demand.

We can do this by extending the Database class and adding an `st` method to it. For the sake of simplicity, I will write the following code inside a [preload file.](./../../guides/http/routing.md#register-as-a-preload-file)

```ts
// title: start/db.ts
import knexPostgis from 'knex-postgis'
import Database from '@ioc:Adonis/Lucid/Database'

Database.Database.macro('st', function (connectionName?: string) {
  connectionName = connectionName || this.primaryConnectionName
  this.manager.connect(connectionName)

  const connection = this.getRawConnection(connectionName)!.connection!

  /**
   * Ensure we are dealing with a PostgreSQL connection
   */
  if (connection.dialectName !== 'postgres') {
    throw new Error('The "st" function can only be used with PostgreSQL')
  }

  /**
   * Configure extension if not already configured
   */
  if (!connection.client!['postgis']) {
    knexPostgis(connection.client!)
    if (connection.hasReadWriteReplicas) {
      knexPostgis(connection.readClient!)
    }
  }

  return connection.client!['postgis']
})
```

Let's walk through the above code snippet.

1. We start by adding a new method, `st`, to the Database module.
2. The method accepts the connection name for which we want to configure the Postgis extension and returns an instance of the `knex-postgis` package for that specific connection.
3. If the connection has read-write replicas, we configure the connection for both the read and the write connections.

### Notifying TypeScript about the new method
Let's create a new file inside the `contracts` directory. Here we will use [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces) to add the `st` method.

```ts
declare module '@ioc:Adonis/Lucid/Database' {
  import { KnexPostgis } from 'knex-postgis'

  interface DatabaseContract {
    st(): KnexPostgis
  }
}
```

### Access `st` instance for a connection
You can access the `st` instance for a given connection as follows.

```ts
Database.st() // default connection
Database.st('primary') // named connection
```

## Select columns as text
You can convert columns to their text representation using the `asText` method.

```ts
import Database from '@ioc:Adonis/Lucid/Database'

await Database
  .from('points')
  .select(
    'id',
    Database.st().asText('geom')
  )
```

## Insert values
You can insert values using the [available spatial methods](https://github.com/jfgodoy/knex-postgis#currently-supported-functions). 

```ts
import Database from '@ioc:Adonis/Lucid/Database'

await Database.table('points').insert({
  geom: Database.st().geomFromText('Point(0 0)', 4326)
})
```

### Insert using Models
When using models, either you can use the `prepare` method to convert the string value to a raw query or mark the column as `any` to assign raw queries directly.

#### Using the `prepare` hook

When using models, make sure to mark the column as `any` to assign raw values to it.

```ts
class Point {
  @column({
    prepare: (value?: string) => {
      return value ? Database.st().geomFromText(value, 4326) : value
    }
  })
  public geom: string
}

const point = new Point()
point.geom = 'Point(0 0)'
await point.save()
```

#### Assigning raw queries directly
Make sure to mark the column type as `any` when assigning raw queries directly.

```ts
class Point {
  @column()
  public geom: any // 👈 Make sure the type is any
}

const point = new Point()
point.geom = Database.st().geomFromText('Point(0 0)', 4326)
await point.save()
```
