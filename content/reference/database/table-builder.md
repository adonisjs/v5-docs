---
summary: Database table builder complete API reference
---

The table builder allows you to **create**, **drop**, or **rename** columns on a selected database table.

You get access to the table builder instance by calling one of the following schema builder methods.

```ts
class UserSchema extends BaseSchema {
  public up() {
    // highlight-start
    this.schema.createTable('users', (table) => {
      console.log(table) // 👈 Table builder
    })

    this.schema.table('users', (table) => {
      console.log(table) // 👈 Table builder
    })
    // highlight-end
  }
}
```

## Methods/Properties
Following is the list of methods/properties available on the table builder class.

---

### dropColumn
Drop a column by its name.

```ts
this.schema.table('users', (table) => {
  table.dropColumn('name')
})
```

---

### dropColumns
Drop more than one column by providing multiple arguments.

```ts
this.schema.table('users', (table) => {
  table.dropColumns('first_name', 'last_name')
})
```

---

### renameColumn
Rename a column. The method accepts the existing column name as the first argument and the new name as the second argument.

```ts
this.schema.table('users', (table) => {
  table.renameColumn('name', 'full_name')
})
```

---

### increments

Adds an auto-incrementing column. The column is also marked as the primary key unless disabled explicitly.

- In PostgreSQL, the column has the `serial` data type.
- In Amazon Redshift, it is an `integer indentity (1,1)`.

```ts
this.schema.createTable('users', (table) => {
  table.increments('id')
})
```

Define an incrementing column, but do not mark it as the primary key.

```ts
this.schema.createTable('users', (table) => {
  table.increments('other_id', { primaryKey: false })
})
```

---

### integer

Add an integer column.

```ts
this.schema.createTable('users', (table) => {
  table.integer('visits')
})
```

---

### bigInteger
Adds a `bigint` column in MYSQL and PostgreSQL. For all other database drivers, it defaults to a normal integer.

:::note
BigInt column values are returned as a string in query results. 
:::

```ts
this.schema.createTable('users', (table) => {
  table.bigInteger('visits')
})
```

---

### text

Adds a text column to the database. You can optionally define the text datatype to be `mediumtext` or `longtext`. The data type is ignored if the underlying driver is not MySQL.

```ts
this.schema.createTable('posts', (table) => {
  table.text('content_markdown', 'longtext')
})
```

---

### string

Add a string column with an optional length. The length defaults to `255`, if not specified.

```ts
this.schema.createTable('posts', (table) => {
  table.string('title')

  // Explicit length
  table.string('title', 100)
})
```

---

### float

Adds a float column, with **optional precision (defaults to 8)** and **scale (defaults to 2)**.

```ts
this.schema.createTable('products', (table) => {
  table.float('price')

  /**
   * Explicit precision and scale
   */
  table.float('price', 8, 2)
})
```

---

### decimal

Adds a decimal column, with **optional precision (defaults to 8)** and **scale (defaults to 2)**.

Specifying `null` as precision creates a decimal column that can store numbers of precision and scale. (Only supported for Oracle, SQLite, Postgres)

```ts
this.schema.createTable('products', (table) => {
  table.decimal('price')

  /**
   * Explicit precision and scale
   */
  table.decimal('price', 8, 2)
})
```

---

### boolean

Adds a boolean column. Many databases represent `true` and `false` as `1` and `0` and return the same value during SQL queries.

```ts
this.schema.createTable('posts', (table) => {
  table.boolean('is_published')
})
```

---

### date
Adds a date column to the database table.

```ts
this.schema.createTable('users', (table) => {
  table.date('dob')
})
```

---

### dateTime
Adds a DateTime column to the database table. The method accepts the column name as the first argument, alongside the options object to configure the `precision` and use the `timestampz` data type.

- You can enable/disable the `timestampz` data type for PostgreSQL. It is enabled by default.
- You can define the column precision for **MySQL 5.6+**.

```ts
this.schema.createTable('users', (table) => {
  table
    .dateTime('some_time', { useTz: true })
    .defaultTo(this.now())

  // Or define the precision
  table
    .dateTime('some_time', { precision: 6 })
    .defaultTo(this.now(6))
})
```

---

### time
Adds a time column with optional precision for MySQL. It is not supported on Amazon Redshift.

```ts
this.schema.createTable('users', (table) => {
  table.time('some_time', { precision: 6 })
})
```

---

### timestamp
Adds a timestamp column to the database table. The method accepts the column name as the first argument, alongside the options object to configure the `precision` and use the `timestampz` data type.

- You can enable/disable the `timestampz` data type for PostgreSQL. It is enabled by default.
- Setting `useTz = true` will use the `DATETIME2` data type for MSSQL. It is disabled by default.
- You can define the column precision for **MySQL 5.6+**.

```ts
this.schema.createTable('users', (table) => {
  table.timestamp('created_at')

  // Enable timestampz and DATETIME2 for MSSQL
  table.timestamp('created_at', { useTz: true })

  // Use precision with MySQL
  table.timestamp('created_at', { precision: 6 })
})
```

---

### timestamps
Adds `created_at` and `updated_at` columns to the database table.

:::warning

Since AdonisJS uses Knex.js under the hood, your editor autocomplete feature will list the `timestamps` method in list of available methods.

However, we recommend not using this method and instead use the `timestamp` method for following reasons.

- The `timestamps` method is not chainable. Meaning you cannot add additional constraints like `index` or `nullable` to the column.
- You can create columns of type `timestampz` or `Datetime2`.

:::

```ts
this.schema.createTable('users', (table) => {
  table.timestamps()
})
```

By default, the `timestamps` method creates a **DATETIME** column. However, you can change it to a **TIMESTAMP** column by passing `true` as the first argument.

```ts
this.schema.createTable('users', (table) => {
  /**
   * Creates timestamp column
   */
  table.timestamps(true)
})
```

```ts
this.schema.createTable('users', (table) => {
  /**
   * Creates timestamp column
   * +
   * Set the default value to "CURRENT_TIMESTAMP"
   */
  table.timestamps(true, true)
})
```

---

### binary
Adds a binary column. The method accepts the column name as the first argument, with an optional length as the second argument (applicable for MySQL only).

```ts
this.schema.createTable('users', (table) => {
  table.binary('binary_column')
})
```

---

### enum / enu

Adds an enum column to the database. The method accepts the column name as the first argument, an array of enum options as the second argument, and an optional object of options as the third argument.

- In PostgreSQL, you can use the native enum type by setting the `options.useNative` value to true. Also, make sure to provide a unique name enum name via `options.enumName`.
- In PostgreSQL, we will create the enum before the column. If the enum type already exists, then you must set `options.existingType` to true.
- In Amazon Redshift, unchecked varchar(255) data type is used.

```ts
this.schema.createTable('users', (table) => {
  table.enu('account_status', ['PENDING', 'ACTIVE', 'SUSPENDED'], {
    useNative: true,
    enumName: 'user_account_status',
    existingType: false,
  })
})
```

You can also specify the PostgreSQL schema for the enum type.

```ts
table.enu('account_status', ['PENDING', 'ACTIVE', 'SUSPENDED'], {
    useNative: true,
    enumName: 'user_account_status',
    existingType: false,
    schemaName: 'public' // 👈
  })
```

Make sure to drop the enum when dropping the table.

```ts
this.schema.raw('DROP TYPE IF EXISTS "user_account_status"')
this.schema.dropTable('users')
```

---

### json
Adds a JSON column, using the built-in JSON type in **PostgreSQL**, **MySQL** and **SQLite**, defaulting to a text column in older versions or in unsupported databases.

```ts
this.schema.createTable('projects', (table) => {
  table.json('settings')
})
```

---

### jsonb
Same as the `json` method but uses the native `jsonb` data type (if possible).

```ts
this.schema.createTable('projects', (table) => {
  table.jsonb('settings')
})
```

---

### uuid
Adds a UUID column. The method accepts the column name as the only argument.

- Uses the built-in UUID type in PostgreSQL
- Uses the `char(36)` for all other databases

```ts
this.schema.createTable('users', (table) => {
  table.uuid('user_id')
})
```

Make sure also to create the UUID extension for PostgreSQL. You can also do it inside a dedicated migration file as follows:

```ts
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class SetupExtensions extends BaseSchema {
  public up() {
    this.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  }

  public down() {
    this.schema.raw('DROP EXTENSION IF EXISTS "uuid-ossp"')
  }
}
```

---

### comment
Sets the comment for the table. Accepts the comment value as the only argument.

```ts
this.schema.createTable('users', (table) => {
  table.comment('Manages the app users')
})
```

---

### engine

Sets the engine for the database table. The method accepts the engine name as the only argument.

- The method is only available within a `createTable` call.
- The engine is only applicable to **MySQL** and ignored for other databases.

```ts
this.schema.createTable('users', (table) => {
  table.engine('MyISAM')
})
```

---

### charset

Sets the charset for the database table. The method accepts the charset value as the only argument.

- The method is only available within a `createTable` call.
- The charset is only applicable to **MySQL** and ignored for other databases.

```ts
this.schema.createTable('users', (table) => {
  table.charset('utf8')
})
```

---

### collate

Sets the collation for the database table. The method accepts the collation value as the only argument.

- The method is only available within a `createTable` call.
- The collation is only applicable to **MySQL** and ignored for other databases.

```ts
this.schema.createTable('users', (table) => {
  table.collate('utf8_unicode_ci')
})
```

---

### inherits
Set the parent table for inheritance. The method accepts the parent table name as the only argument.

- The method is only available within a `createTable` call.
- The `inherits` is only applicable to **PostgreSQL** and ignored for other databases.

```ts
this.schema.createTable('capitals', (table) => {
  table.inherits('cities')
})
```

---

### specificType
Create a column by defining its type as a raw string. The method allows you to create a database column, which is not covered by the standard table builder API.

The first argument is the column name, and the second argument is column type.

```ts
this.schema.createTable('users', (table) => {
  table.specificType('mac_address', 'macaddr')
})
```

---

### index
Adds an index to a table over the given columns. You must create the table before defining the index.

- The method accepts an array of columns as the first argument.
- An optional index name as the second argument
- And an optional index type as the third argument. The index type is only applicable for PostgreSQL and MySQL databases.

```ts
this.schema.alterTable('users', (table) => {
  table.index(['first_name', 'last_name'], 'user_name_index')
})
```

---

### dropIndex

Drop an existing index from the table columns. The method accepts columns as the first argument and an optional index name as the second argument.

```ts
this.schema.alterTable('users', (table) => {
  table.dropIndex(['first_name', 'last_name'], 'user_name_index')
})
```

---

### unique

Adds a unique index to a table over the given columns. A default index name using the columns is used unless `indexName` is specified.

```ts
this.schema.alterTable('posts', (table) => {
  table.unique(['slug', 'tenant_id'])
})
```

---

### foreign

Adds a foreign key constraint to a table for existing columns. Make sure the table already exists when using the `foreign` method.

- The methods one or more column names as the first argument.
- You can define a custom `foreignKeyName` as the second argument. If not specified, the column names are used to generate it.

```ts
this.schema.alterTable('posts', (table) => {
  table.foreign('user_id').references('users.id')
})
```

You can also chain the `onDelete` and `onUpdate` methods to define the triggers.

```ts
table
  .foreign('user_id')
  .references('users.id')
  .onDelete('CASCADE')
```

---

### dropForeign
Drop a pre-existing foreign key constraint. The method accepts one or more columns as the first argument and an optional foreign key name as the second argument.

```ts
this.schema.alterTable('posts', (table) => {
  table.dropForeign('user_id')
})
```

---

### dropUnique
Drop a pre-existing unique index. The method accepts an array of string(s) representing column names as the first argument and an optional index name as the second argument.

```ts
this.schema.alterTable('posts', (table) => {
  table.dropUnique(['email'])
})
```

---

### dropPrimary
Drop a pre-existing primary key constraint. The method accepts an optional constraint name (defaults to `tablename_pkey`).

```ts
this.schema.alterTable('posts', (table) => {
  table.dropPrimary()
})
```

---

### setNullable
Set the column to be nullable.

```ts
this.schema.alterTable('posts', (table) => {
  table.setNullable('full_name')
})
```

---

### dropNullable
Drop the nullable constraint from the column.

:::warning
The operation will fail, when the column already has null values.
:::

```ts
this.schema.alterTable('posts', (table) => {
  table.dropNullable('full_name')
})
```

## Chainable methods

Following is the list of methods you can chain on the schema building methods as modifiers to the column. 

### alter

Marks the column as an alters/modify instead of the default add. The method is not supported by SQLite or Amazon Redshift drivers.

:::note

The alter statement is not incremental. You must redefine the constraints that you want to apply to the column.

:::

```ts
this.schema.alterTable('posts', (table) => {
  // drops both NOT NULL constraint and the default value (if applied earlier)
  table.integer('age').alter()
})
```

---

### index

Define an index for the current column. The method accepts the following two optional arguments.

- An optional index name as the first argument.
- And an optional index type as the second argument. The index type is only applicable for PostgreSQL and MySQL databases.

```ts
this.schema.table('posts', (table) => {
  table.string('slug').index('posts_slug')
})
```

---

### primary

Mark the current column as the primary key. Optionally, you can define the constraint name as the first argument.

On Amazon Redshift, all columns included in a primary key must be not nullable.

```ts
this.schema.table('posts', (table) => {
  table.integer('id').primary()
})
```

If you want to define a composite primary key, you must use the `table.primary` method.

```ts
this.schema.table('posts', (table) => {
  table.primary(['slug', 'tenant_id'])
})
```

---

### unique
Mark the current column as unique. On Amazon Redshift, this constraint is not enforced, but the query planner uses it.

```ts
this.schema.table('users', (table) => {
  table.string('email').unique()
})
```

---

### references
Define the column that the current column references as a foreign key. 

```ts
this.schema.table('posts', (table) => {
  table.integer('user_id').references('id').inTable('users')
})
```

You can also define the `tableName.columnName` together and remove the `inTable` method all together.

```ts
this.schema.table('posts', (table) => {
  table.integer('user_id').references('users.id')
})
```

---

### inTable
Define the table for the foreign key referenced column.

```ts
this.schema.table('posts', (table) => {
  table.integer('user_id').references('id').inTable('users')
})
```

---

### onDelete
Define the `onDelete` command for the foreign key. The command is expressed as a string value.

```ts
this.schema.table('posts', (table) => {
  table
    .integer('user_id')
    .references('id')
    .inTable('users')
    .onDelete('CASCADE')
})
```

---

### onUpdate
Define the `onUpdate` command for the foreign key. The command is expressed as a string value.

```ts
this.schema.table('posts', (table) => {
  table
    .integer('user_id')
    .references('id')
    .inTable('users')
    .onUpdate('RESTRICT')
})
```

---

### defaultTo
Define the default value for the column to be used during the insert. 

In MSSQL a constraintName option may be passed to ensure a specific constraint name:

```ts
this.schema.table('posts', (table) => {
  table.boolean('is_published').defaultTo(false)
  
  // For MSSQL
  table
    .boolean('is_published')
    .defaultTo(false, { constraintName: 'df_table_value' })
})
```

---

### unsigned
Mark the current column as unsigned. 

```ts
this.schema.table('posts', (table) => {
  table
    .integer('user_id')
    .unsigned() // 👈
    .references('id')
    .inTable('users')
})
```

---

### notNullable
Mark the current column as NOT nullable.

:::note
Consider using [dropNullable](#dropnullable) method when altering the column. 
:::

```ts
this.schema.table('users', (table) => {
  table.integer('email').notNullable()
})
```

---

### nullable
Mark the current column as nullable.

:::note
Consider using [setNullable](#setnullable) method when altering the column. 
:::

```ts
this.schema.table('users', (table) => {
  table.text('bio').nullable()
})
```

---

### first
Sets the column to be inserted on the first position, only used in MySQL alter tables.

```ts
this.schema.alterTable('users', (table) => {
  table.string('email').first()
})
```

---

### after
Sets the column to be inserted after another, only used in MySQL alter tables.

```ts
this.schema.alterTable('users', (table) => {
  table.string('avatar_url').after('password')
})
```

---

### comment
Sets the comment for a column

```ts
this.schema.alterTable('users', (table) => {
  table.string('avatar_url').comment('Only relative names are stored')
})
```

---

### collate
Sets the collation for a column (only works in MySQL).

```ts
this.schema.alterTable('users', (table) => {
  table
    .string('email')
    .unique()
    .collate('utf8_unicode_ci')
})
```
