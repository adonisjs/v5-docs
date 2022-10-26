---
summary: Use migrations to create and modify SQL tables
---

Schema migrations are the version control for your database. Think of them as independent scripts written in TypeScript to alter your database schema over time.

Here's how migrations work in a nutshell.

You make a new migration file for every database schema change (i.e., create or alter table).
- Within the migration file, you will write the statements to perform the required actions.
- Run migrations using the AdonisJS command-line tool.
- AdonisJS will keep track of executed migrations. This ensures that every migration runs only once.
- During development, you can also roll back migrations to edit them.

## Creating your first migration
You can create a new migration by running the following Ace command. The migration files are stored inside the `database/migrations` directory.

:::note
You can also create a Lucid model and the migration together by running the `node ace make:model -m` flag.
:::

```sh
node ace make:migration users

# CREATE: database/migrations/1630981615472_users.ts
```

If you will notice, the migration filename is prefixed with some numeric value. We add the current timestamp to the filename so that the migration files are sorted in the order created.

### Migration class structure
A migration class always extends the `BaseSchema` class provided by the framework and must implement the `up` and the `down` methods.

- The `up` method is used to evolve the database schema further. Usually, you will create new tables/indexes or alter existing tables inside this method.
- The `down` method is used to roll back the actions executed by the `up` method. For example, if the up method creates a table, the down method should drop the same table.

Both the methods have access to the AdonisJS [schema builder](../../reference/database/schema-builder.md) that you can use to construct SQL DDL queries.

```ts
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## Run & rollback migrations
Once you have created the migration files you need, you can run the following Ace command to process migrations. For example, the `migration:run` command executes the `up` method on all the migration files.

```sh
node ace migration:run
```

SQL statements for every migration file are wrapped inside a transaction. So if one statement fails, all other statements within the same file will roll back.

Also, in case of failure, the subsequent migrations will be aborted. However, the migrations before the failed migration stay in the completed state.

### Tracking completed migrations
AdonisJS tracks the file path of executed migrations inside the `adonis_schema` database table. This is done to avoid re-running the same migration files.

Following are the columns inside the `adonis_schema` table.

```sql
+----+----------------------------------------------+-------+----------------------------------+
| id |                     name                     | batch |          migration_time          |
+----+----------------------------------------------+-------+----------------------------------+
|  1 | database/migrations/1587988332388_users      |     1 | 2021-08-26 10:41:31.176333+05:30 |
|  2 | database/migrations/1592489784670_api_tokens |     1 | 2021-08-26 10:41:31.2074+05:30   |
+----+----------------------------------------------+-------+----------------------------------+
```

- **name**: Path to the migration file. It is always relative to the project root.
- **batch**: The batch under which the migration was executed. The batch number is incremented every time you run the `migration:run` command.
- **migration_time**: Migration execution timestamp.

### Rollback migrations
You can roll back migrations by running the `migration:rollback` command. The rollback action is performed on the migrations from the most recent batch. However, you can also specify a custom batch number until which you want to roll back.

```sh
# Rollback the latest batch
node ace migration:rollback

# Rollback until the start of the migration
node ace migration:rollback --batch=0

# Rollback until batch 1
node ace migration:rollback --batch=1
```

The `migration:reset` command is basically an alias for `migration:rollback --batch=0`. This will rollback all of your application's migrations :
```sh
node ace migration:reset
```

The rollback command executes the `down` method of the migration class. Like the `up` method, the SQL statements of the `down` method are also wrapped inside a database transaction.

### Rollback and migrate using a single command
The `migration:refresh` command will rollback all of your migrations and then execute the `migration:run` command. This command effectively re-creates your entire database:

```sh
node ace migration:refresh

# Refresh the database and run all seeders
node ace migration:refresh --seed
```

### Drop tables and migrate
Unlike the `migration:refresh` command, the `migration:fresh` command will not run the `down` method of the migration files. Instead, it will drop all the tables using the `db:wipe` command and then run the `migration:run` command.

```sh
node ace migration:fresh

# Drop all tables, migrate, and run seeders
node ace migration:fresh --seed
```

:::warning

`migration:fresh` and `db:wipe` commands will drop all database tables. These command should be used with caution when developing on a database that is shared with other applications.

:::

### Avoid rollback in production
Performing a rollback during development is perfectly fine since there is no fear of data loss. However, performing a rollback in production is not an option in the majority of cases. Consider the following example:

- You create and run a migration to set up the `users` table.
- Over time, this table has received data since the app is running in production.
- Your product has evolved, and now you want to add a new column to the `users` table.

You cannot simply roll back, edit the existing migration, and re-run it because the rollback will drop the `users` table.

Instead, you should create a new migration file to alter the existing `users` table by adding the required column. In other words, migrations should always move forward.

## Create a table
You can use the `schema.createTable` method to create a new database table. The method accepts the table name as the first argument and a callback function to define the table columns.

```ts
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    // highlight-start
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
    // highlight-end
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

<div class="doc-cta-wrapper">

[Schema builder reference guide →](../../reference/database/schema-builder.md)

</div>

## Alter table
You can alter an existing database table using the `schema.alterTable` method. The method accepts the table name as the first argument and a callback function to alter/add the table columns.

```ts
export default class extends BaseSchema {
  public up() {
    // highlight-start
    this.schema.alterTable('user', (table) => {
      table.dropColumn('name')
      table.string('first_name')
      table.string('last_name')
    })
    // highlight-end
  }
}
```

## Rename/drop table
You can rename the table using the `schema.renameTable`. The method accepts the existing table name as the first argument and the new name as the second argument.

```ts
export default class extends BaseSchema {
  // highlight-start
  public up() {
    this.schema.renameTable('user', 'app_users')
  }
  // highlight-end
}
```

You can drop the table using the `schema.dropTable`. The method accepts the table name as the only argument.

```ts
export default class extends BaseSchema {
  // highlight-start
  public down() {
    this.schema.dropTable('users')
  }
  // highlight-end
}
```

## Dry run
The dry run mode of migrations lets you view the SQL queries in the console instead of executing them. Just pass the `--dry-run` flag to the migration commands to turn on the dry run mode.

```sh
# Run
node ace migration:run --dry-run

# Rollback
node ace migration:rollback --dry-run
```

## Performing other database operations
Quite often, you will have requirements to run SQL queries other than just creating/altering tables. For example: Migrating data to a newly created table before deleting the old table.

You should define these operations using the `this.defer` method, as shown below.

:::note
We migrate the emails from the `users` table to the `user_emails` table in the following example.
:::

```ts
export default class extends BaseSchema {
  public up() {
    this.schema.createTable('user_emails', (table) => {
      // table columns
    })

    // highlight-start
    this.defer(async (db) => {
      const users = await db.from('users').select('*')
      await Promise.all(users.map((user) => {
        return db
          .table('user_emails')
          .insert({ user_id: user.id, email: user.email })
      }))
    })
    // highlight-end

    this.schema.alterTable('users', (table) => {
      table.dropColumn('email')
    })
  }
}
```

Wrapping your database queries inside the `this.defer` method makes sure they are not executed when running migrations in **dry run** mode.

## Changing migrations database connection
You can manage the database connection for migrations in a couple of different ways.

### Separate migration source

The first option is to keep migrations separate for each database connection. This is usually helpful when each database connection queries different tables. For example, you are using a different database for users data and a different database for products data.

Define the migrations path next to the database connection config.

```ts
{
  users: {
    client: 'mysql2',
    migrations: {
      // highlight-start
      paths: ['./database/users/migrations']
      // highlight-end
    }
  },
  products: {
    client: 'mysql2',
    migrations: {
      // highlight-start
      paths: ['./database/products/migrations']
      // highlight-end
    }
  }
}
```

When creating a new migration, define the `--connection` flag, and the command will create the file in the correct directory.

```sh
node ace make:migration --connection=products
```

When running the migrations, the `--connection` flag will run migrations only from the selected connection directory.

```sh
node ace migration:run --connection=products
```

### Shared migrations
If you want to run the same migrations under a different database connection, you can use the `--connection` flag. The migrations will use the config from the selected connection to run the migrations.

This option is helpful for multi-tenant applications, where you want to switch connections every time you run the migration.

```sh
node ace migration:run --connection=tenantA
```

## Running migrations programmatically
Using the `Migrator` module, you can run migrations programmatically. This is usually helpful when running migrations from a web interface and not the command line.

Following is an example of running the migrations from a route and returning a list of migrated files in the response.

```ts
import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database'
import Application from '@ioc:Adonis/Core/Application'
import Migrator from '@ioc:Adonis/Lucid/Migrator'

Route.get('/', async () => {
  const migrator = new Migrator(Database, Application, {
    direction: 'up',
    dryRun: false,
    // connectionName: 'pg',
  })

  await migrator.run()
  return migrator.migratedFiles
})
```

- The `direction = up` means to run the `up` method inside the migration files. You can set the `direction = down` to roll back the migrations.
- Enabling the `dryRun` will not execute the queries but instead collect them inside the `queries` array.
- You can also optionally define the `connectionName` property to execute the migrations against a specific database connection.

### migratedFiles
The `migrator.migratedFiles` is an object. The key is the unique name (derived from the file path), and the value is another object of migration file properties.

```json
{
  "database/migrations/1623289360244_users": {
    "status": "completed",
    "queries": [],
    "file": {
      "filename": "1623289360244_users.ts",
      "absPath": "/path/to/project/database/migrations/1623289360244_users.ts",
      "name": "database/migrations/1623289360244_users"
    },
    "batch": 1
  }
}
```

- The `status` will be one of **"pending"**, **"completed"**, or **"error"**.
- The `queries` array contains an array of executed queries. Only when `dryRun` is enabled.
- The `file` property holds the information for the migration file.
- The `batch` property tells the batch in which the migration was executed.

### getList
The `migrator.getList` method returns a list of all the migrations, including the completed and the pending ones. This is the same list you see when running the `node ace migration:status` command.

```ts
await migrator.getList()
```

```json
[
  {
    "name": "database/migrations/1623289360244_users",
    "status": "pending"
  }
]
```

### status
Returns the current `status` of the migrator. It will always be one of the following.

- The `pending` status means no the `migrator.run` method has not been called yet.
- The `completed` status means the migrations were successfully executed.
- The `error` status means there was an error in the migration process. You can read the actual error from the `migrator.error` property in case of error status.
- The `skipped` status means there were no migrations to run or rollback.

## Migrations config
The configuration for migrations is stored inside the `config/database.ts` file under the connection config object.

```ts
{
  mysql: {
    client: 'mysql2',
    migrations: {
      naturalSort: true,
      disableTransactions: false,
      paths: ['./database/migrations'],
      tableName: 'adonis_schema',
      disableRollbacksInProduction: true,
    }
  }
}
```

#### naturalSort
Use **natural sort** to sort the migration files. Most of the editors use natural sort, and hence the migrations will run in the same order as you see them listed in your editor.

---

#### paths
An array of paths to look up for migrations. You can also define a path to an installed package. For example:

```ts
paths: [
  './database/migrations',
  '@somepackage/migrations-dir',
]
```

---

#### tableName
The name of the table for storing the migrations state. Defaults to `adonis_schema`.

---

#### disableRollbacksInProduction
Disable migration rollback in production. It is recommended that you should never roll back migrations in production.

---

#### disableTransactions

Set the value to `true` to not wrap migration statements inside a transaction. By default, Lucid will run each migration file in its transaction.
