---
summary: Introduction to the Lucid ORM. It ships with an implementation of an Active record pattern, a database query builder, support for migrations, seeders, and model factories.
---

AdonisJS is one of the few Node.js frameworks (if not the only one) with first-class support for SQL databases. Lucid powers the data layer of the framework, and you must install the package separately.

:::div{class="setup"}

:::codegroup

```sh
// title: 1. Install
npm i @adonisjs/lucid@18.4.0
```

```sh
// title: 2. Configure
node ace configure @adonisjs/lucid

# CREATE: config/database.ts
# UPDATE: .env,.env.example
# UPDATE: tsconfig.json { types += "@adonisjs/lucid" }
# UPDATE: .adonisrc.json { commands += "@adonisjs/lucid/build/commands" }
# UPDATE: .adonisrc.json { providers += "@adonisjs/lucid" }
```

```ts
// title: 3. Validate environment variables
/**
 * Depending upon the database driver you are using, you must validate
 * the environment variables defined.
 *
 * The following is an example for PostgreSQL.
 */
export default Env.rules({
  PG_HOST: Env.schema.string({ format: 'host' }),
  PG_PORT: Env.schema.number(),
  PG_USER: Env.schema.string(),
  PG_PASSWORD: Env.schema.string.optional(),
  PG_DB_NAME: Env.schema.string(),
})
```

:::


:::div{class="features"}

- Support for multiple SQL database. **PostgreSQL**, **MySQL**, **MSSQL**, **MariaDB** and **SQLite**.
- Query builder built on top of [Knex.js](https://knexjs.org)
- Active Record based data models
- Migrations system
- Model factories and database seeders

&nbsp;

- [View on npm](https://npm.im/@adonisjs/lucid)
- [View on GitHub](https://github.com/adonisjs/lucid)

:::

## Configuration
The configuration for all the database drivers is stored inside the `config/database.ts` file.

```ts
import Env from '@ioc:Adonis/Core/Env'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'

const databaseConfig: DatabaseConfig = {
  // Default connection
  connection: Env.get('DB_CONNECTION'),

  // List of available connections
  connections: {
    pg: {
      client: 'pg',
      connection: {
        host: Env.get('PG_HOST'),
        port: Env.get('PG_PORT'),
        user: Env.get('PG_USER'),
        password: Env.get('PG_PASSWORD', ''),
        database: Env.get('PG_DB_NAME'),
      },
      migrations: {
        naturalSort: true,
      },
      healthCheck: false,
      debug: false,
    },
  }
}

export default databaseConfig
```

#### connection
The `connection` property defines the default connection to use for making database queries. The value relies on the `DB_CONNECTION` environment.

---

#### connections
The `connections` object defines one or more database connections you want to use in your application. You can define multiple connections using the same or the different database driver.

---

#### migrations
The `migrations` property configures the settings for the database migrations. It accepts the following options.

<table>
<thead>
<tr>
<th>Option</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>naturalSort</strong></td>
<td>Use natural sort to sort the migration files. Most of the editors use natural sort and hence the migrations will run in the same order as you see them listed in your editor.</td>
</tr>
<tr>
<td><strong>paths</strong></td>
<td>
  <p>
    An array of paths to look up for migrations. You can also define a path to an installed package. For example:
  </p>

```ts
paths: [
  './database/migrations',
  '@somepackage/migrations-dir',
]
```

</td>
</tr>
<tr>
<td><strong>tableName</strong></td>
<td>The name of the table for storing the migrations state. Defaults to <code>adonis_schema</code>.</td>
</tr>
<tr>
<td><strong>disableRollbacksInProduction</strong></td>
<td>Disable migration rollback in production. It is recommended that you should never rollback migrations in production.</td>
</tr>
<tr>
<td><strong>disableTransactions</strong></td>
<td>Set the value to <code>true</code> to not wrap migration statements inside a transaction. By default, Lucid will run each migration file in its own transaction.</td>
</tr>
</tbody>
</table>

#### healthCheck

A boolean to enable/disable health checks.

---

#### debug

A boolean to globally enable query debugging. You must read the [debugging guide](./debugging.md) for more information.

---

#### seeders
The `seeders` object allows you to define the paths for loading the database seeder files. You can also specify a path to an installed package. For example:

```ts
{
  seeders: {
    paths: ['./database/seeders', '@somepackage/seeders-dir']
  }
}
```

## Usage
The easiest way to make SQL queries is to use the Database query builder. It allows you to construct simple and complex SQL queries using JavaScript methods.

In the following example, we select all the posts from the `posts` table.

```ts
import Database from '@ioc:Adonis/Lucid/Database'
import Route from '@ioc:Adonis/Core/Route'

Route.get('posts', async () => {
  return Database.from('posts').select('*')
})
```

Let's sort the post by their id and also paginate them.

```ts
import Database from '@ioc:Adonis/Lucid/Database'
import Route from '@ioc:Adonis/Core/Route'

Route.get('posts', async ({ request }) => {
  const limit = 20
  const page = request.input('page', 1)

  return Database
    .from('posts')
    .select('*')
    .orderBy('id', 'desc') // 👈 get latest first
    .paginate(page, limit) // 👈 paginate using page numbers
})
```

You are not only limited to the select queries. You can also use the query builder to perform **updates**, **inserts** and **deletes**.

#### Insert a new row

```ts
const postId = await Database
  .table('posts')
  .insert({
    title: 'Adonis 101',
    description: 'Let\'s learn AdonisJS'
  })
  .returning('id') // For PostgreSQL
```

#### Update existing row by id

```ts
const updatedRowsCount = await Database
  .from('posts')
  .where('id', 1)
  .update({ title: 'AdonisJS 101' })
```

#### Delete existing row by id

```ts
const deletedRowsCount = await Database
  .from('posts')
  .where('id', 1)
  .delete()
```

## Read/write replicas
AdonisJS supports **read/write replicas** as a first-class citizen. You can configure one write database server, along with multiple read servers. All read queries are sent to the read servers in **round-robin fashion**, and write queries are sent to the write server.

:::note

Lucid does not perform any data replication for you. So you still have to rely on your database server for that.


:::

Following is the example config for defining read/write connections. We merge the properties defined inside the `connection` object with every node of the read/write connections. So, you can keep the shared `username` and `password` in the connection object.

```ts
{
  connections: {
    mysql: {
      connection: {
        user: Env.get('MYSQL_USER'),
        password: Env.get('MYSQL_PASSWORD'),
        database: Env.get('MYSQL_DB_NAME'),
      },
      // highlight-start
      replicas: {
        read: {
          connection: [
            {
              host: '192.168.1.1',
            },
            {
              host: '192.168.1.2',
            },
          ]
        },
        write: {
          connection: {
            host: '196.168.1.3',
          },
        },
      },
      // highlight-end
    }
  }
}
```

## Connection pooling
[Connection pooling](https://en.wikipedia.org/wiki/Connection_pool) is a standard practice of maintaining minimum and maximum connections with the database server.

The **minimum connections** are maintained for improving the application performance. Since establishing a new connection is an expensive operation, it is always recommended to have a couple of connections ready to execute the database queries.

The **maximum connections** are defined to ensure that your application doesn't overwhelm the database server with too many concurrent connections.

Lucid will queue new queries when the pool is full and waits for the pool to have free resources until the configured timeout. The default timeout is set to **60 seconds** and can be configured using the `pool.acquireTimeoutMillis` property.

```ts
{
  mysql: {
    client: 'mysql2',
    connection: {},
    // highlight-start
    pool: {
      acquireTimeoutMillis: 60 * 1000,
    }
    // highlight-end
  }
}
```

:::tip

Bigger the pool size, the better the performance is a misconception. We recommend you read this [document](https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing) to understand how the smaller pool size can boost the application performance.

:::

You can configure the pool settings for a given connection inside the `config/database.ts` file.

```ts
{
  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
      },
      // highlight-start
      pool: {
        min: 2,
        max: 20,
      },
      // highlight-end
      healthCheck: false,
    },
  }
}
```

## Switching between multiple connections
Using the ' .connection ' method, you can switch between the connections defined inside the `config/database.ts` file using the `.connection` method. It accepts the connection name and returns an instance of the [Query client](../../reference/database/query-client.md)

```ts
import Database from '@ioc:Adonis/Lucid/Database'

Database
  .connection('mysql')
  .from('posts')
  .select('*')
```

## Closing connections
You can close the opened database connections using the `.close` method. Usually, you should let the connections stay for better performance unless you have a specific reason for closing them.

```ts
// Close a specific connection
await Database.manager.close('mysql')

// Close all connections
await Database.manager.closeAll()
```

## Health checks
You can enable [health checks](../digging-deeper/health-check.md#lucid-checker) for registered database connections by enabling the `healthCheck` boolean flag inside the `config/database.ts` file.

```ts
{
  pg: {
    client: 'pg',
    connection: {
      // ... connection details
    },
    healthCheck: true, // 👈 enabled
  }
}
```

## Drivers config
Following is the example configuration for all the available drivers. You can use it as a reference and tweak the required parts as necessary.

<details>
  <summary>SQLite</summary>

```sh
npm i sqlite3
```

```ts
sqlite: {
  client: 'sqlite',
  connection: {
    filename: Application.tmpPath('db.sqlite3'),
  },
  migrations: {
    naturalSort: true,
  },
  useNullAsDefault: true,
  healthCheck: false,
  debug: false,
}
```

</details>

---

<details>
  <summary>MySQL</summary>

```sh
npm i mysql2
```

```ts
mysql: {
  client: 'mysql2',
  connection: {
    host: Env.get('MYSQL_HOST'),
    port: Env.get('MYSQL_PORT'),
    user: Env.get('MYSQL_USER'),
    password: Env.get('MYSQL_PASSWORD', ''),
    database: Env.get('MYSQL_DB_NAME'),
  },
  migrations: {
    naturalSort: true,
  },
  healthCheck: false,
  debug: false,
}
```

You can also connect to a MySQL database using the Unix domain socket.

```ts
mysql: {
  connection: {
    socketPath : '/path/to/socket.sock',
    user: Env.get('MYSQL_USER'),
    password: Env.get('MYSQL_PASSWORD', ''),
    database: Env.get('MYSQL_DB_NAME'),
  }
}
```

</details>


---

<details>
  <summary>PostgreSQL</summary>

```sh
npm i pg
```

```ts
pg: {
  client: 'pg',
  connection: {
    host: Env.get('PG_HOST'),
    port: Env.get('PG_PORT'),
    user: Env.get('PG_USER'),
    password: Env.get('PG_PASSWORD', ''),
    database: Env.get('PG_DB_NAME'),
  },
  migrations: {
    naturalSort: true,
  },
  healthCheck: false,
  debug: false,
}
```

</details>


---

<details>
  <summary>Oracle DB</summary>

```sh
npm i oracledb
```

```ts
oracle: {
  client: 'oracledb',
  connection: {
    host: Env.get('ORACLE_HOST'),
    port: Env.get('ORACLE_PORT'),
    user: Env.get('ORACLE_USER'),
    password: Env.get('ORACLE_PASSWORD', ''),
    database: Env.get('ORACLE_DB_NAME'),
  },
  migrations: {
    naturalSort: true,
  },
  healthCheck: false,
  debug: false,
}
```

</details>

---

<details>
  <summary>MSSQL</summary>

```sh
npm i tedious
```

```ts
mssql: {
  client: 'mssql',
  connection: {
    user: Env.get('MSSQL_USER'),
    port: Env.get('MSSQL_PORT'),
    server: Env.get('MSSQL_SERVER'),
    password: Env.get('MSSQL_PASSWORD', ''),
    database: Env.get('MSSQL_DB_NAME'),
  },
  migrations: {
    naturalSort: true,
  },
  healthCheck: false,
  debug: false,
}
```
</details>
