The [Schema class](https://github.com/adonisjs/lucid/blob/master/src/Schema/index.ts) is meant to be extended to run SQL DDL operations as code. You can import and use the base schema class as follows:

```ts
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

class UserSchema extends BaseSchema {
}
```

## Lifecycle methods

### up
The `up` method is used to define the operations to be executed when running `node ace migration:run` command. In this method you always perform constructive operations like **create a table** or **alter a table**.

```ts
class UserSchema extends BaseSchema {
  public async up() {
  }
}
```

### down
The `down` method is supposed to undo the actions executed by the `up` method. You need to manually use the equivalent API for running the undo actions.

For example: If the `up` method create a new table using the `createTable` method, then `down` method can use the `dropTable` method.

```ts
class UserSchema extends BaseSchema {
  public async up() {
    this.schema.createTable('users', () => {
    })
  }

  public async down() {
    this.schema.dropTable('users')
  }
}
```

## Methods/Properties
Following is the list of methods and properties available on the schema class.

### now
The `now` method is a helper to make set the default value of a column to the `CURRENT_TIMESTAMP`.

```ts
table.timestamp('created_at').defaultsTo(this.now())
```

### raw
Creates a raw query to be used for running DDL statements.

```ts
this.schema
  .raw(`SET sql_mode='TRADITIONAL'`)
  .table('users', (table) => {
  })
```

### defer
The `defer` method allows you to wrap custom database operations inside a defer block. Deferring actions is required for following reasons.

- Ensure that your custom actions are executed in the right sequence
- Ensure your actions are not executed when running migrations in dry run mode.

```ts
public async up() {
  this.defer(async () => {
    // Only executed when not running in dry run mode
    await this.db.from('users')
  })
}
```

### execUp
The method invoked internally during the migration process to execute the user defined `up` method.

### execDown
The method invoked internally during the migration process to execute the user defined `down` method.

### debug
A property to enable/disable queries debugging for the given schema class. By default the debugging is inherited from the [query client](/api/database/query-client) used by the schema class.

```ts
class UserSchema extends BaseSchema {
  public debug = false
}
```

### disableTransactions
A property to enabled/disable wrapping database queries inside a transaction. By default the property value is set to `false`.

```ts
class UserSchema extends BaseSchema {
  public disableTransactions = true
}
```

### schema
Returns a reference to the [schema builder](/api/database/schema-builder). The value is getter and returns a new instance of every access.

```ts
class UserSchema extends BaseSchema {
  public up() {
    // every access call returns a new instance
    console.log(this.schema !== this.schema)
  }
}
```
