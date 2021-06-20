---
summary: Use migrations to create and modify SQL tables
---

So far, you have learned about the ways to fetch or persist data using the database query builder. We take a step further in this guide and explore schema migrations for **creating/altering** database tables.

## Migrations Overview
Database [schema migrations](https://en.wikipedia.org/wiki/Schema_migration) is one of the most confusing topics in software programming. Many times individuals don't even understand the need to use migrations vs. manually creating database tables. So, let's take a step backward and explore the possible options for creating/modifying tables inside a database.

### Using a GUI Application
The simplest way to create database tables is to use a GUI application like **Sequel Pro**, **Table plus**, and so on. These applications are great during the development phase. However, they have some shortcomings during the production workflow.

- You need to expose your database server to the internet so that the GUI application on your computer can connect to the production database.
- You cannot tie the database changes to your deployment workflow. Every deployment impacting the database will require manual intervention.
- There is no history of your tables. You do not know when and how a database modification was done.

### Custom SQL Scripts
Another option is to create SQL scripts and run them during the deployment process. However, you will have to manually build a tracking system to ensure that you are not running the previously ran SQL scripts. For example:

- You write a SQL script to create a new `users` table.
- You run this script as part of the deployment workflow. However, you have to make sure that the next deployment must ignore the previously executed SQL script.

### Using Schema Migrations
Schema migrations address the above issues and offer a robust API for evolving and tracking database changes. Many tools are available for schema migrations ranging from framework-agnostic tools like [flywaydb](https://flywaydb.org/) to framework-specific tooling offered by Rails, Laravel, and so on.

Similarly, AdonisJS also has its own migrations system. You can create/modify a database by just writing JavaScript.

## Creating Your First Migration
Let's begin by executing the following ace command to create a new migration file.

```sh
node ace make:migration users
# CREATE: database/migrations/1618893487230_users.ts
```

Open the newly created file inside the text editor and replace its content with the following code snippet.

```ts
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('email').unique().notNullable()
      table.string('password').notNullable()
      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
```

Finally, run the following ace command to execute the instructions for creating the `users` table.

```sh
node ace migration:run

# migrated database/migrations/1618893487230_users
```

Congratulations! You have just created and executed your first migration. Lucid will not execute the migration file if you re-run the same command since it has already been executed.

```sh
node ace migration:run

# Already up to date 👈
```

### How it works?

- The `make:migration` command creates a new migration file prefixed with the timestamp. The timestamp is important because the migrations are executed in ascending order by name.
- Migration files are not only limited to creating a new table. You can also `alter` the table, define database triggers, and so on.
- The `migration:run` command executes all the pending migrations. Pending migrations are those, which are never executed using the `migration:run` command.
- A migration file is either in a `pending` state or in a `completed` state.
- Once a migration file has been successfully executed, we will track it inside the `adonis_schema` database table to avoid running it multiple times.

## Changing Existing Migrations
Occasionally you will make mistakes when writing a migration. If you have already run the migration using the `migration:run` command, then you cannot just edit the file and re-run it since the file has been tracked under the list of completed migrations.

Instead, you can roll back the migration by running the `migration:rollback` command. Assuming the previously created migration file already exists, running the rollback command will drop the `users` table.

```sh
node ace migration:rollback

# reverted database/migrations/1618893487230_users
```

### How rollback works?
- Every migration class has two methods, `up` and `down`. The `down` is called during the rollback process.
- You (the developer) are responsible for writing correct instructions to undo the `up` method changes. For example, if the `up` method creates a table, then the `down` method must drop.
- After the rollback, Lucid considers the migration file as pending, and running `migration:run` will re-run it. So you can modify this file and then re-run it.

## Avoiding Rollbacks
Performing a rollback during development is perfectly fine since there is no fear of data loss. However, performing a rollback in production is not an option in the majority of cases. Consider this example:

- You create and run a migration to set up the `users` table.
- Over time, this table has received data since the app is running in production.
- Your product has evolved, and now you want to add a new column to the `users` table.
You cannot simply roll back, edit the existing migration, and re-run it because the rollback will drop the `users` table.

Instead, you create a new migration file to alter the existing `users` table by adding the required column. In other words, migrations should always move forward.

### Alter example
Following is an example of creating a new migration to alter the existing table.

```sh
node ace make:migration add_last_login_column --table=users

# CREATE: database/migrations/1618894308981_add_last_login_columns.ts
```

Open the newly created file and alter the database table using the `this.schema.table` method.

```ts
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.dateTime('last_login_at')
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('last_login_at')
    })
  }
}
```

Re-run the `migration:run` command to run the newly created migration file.

```sh
node ace migration:run

# migrated database/migrations/1618894308981_add_last_login_columns
```

## Migrations Config
The configuration for migrations is stored inside the `config/database.ts` file under the connection config object.

```ts
{
  mysql: {
    client: 'mysql',
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
An array of paths to lookup for migrations. You can also define path to an installed package. For example:

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

## Running migrations programmatically
Using the `Migrator` module, you can run migrations programmatically. This is usually helpful when you want to run migrations from a web interface and not the command line.

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
The `migrator.getList` method returns a list of all the migrations, including the completed and the pending ones. This is the same list you see when you run the `node ace migration:list` command.

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
- The `skipped` status means there were no migrations to run or roll back.
