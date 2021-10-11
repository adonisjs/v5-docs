---
summary: Database schema classes complete API reference
---

Schema migration classes must extend the [Base Schema class](https://github.com/adonisjs/lucid/blob/master/src/Schema/index.ts) class to run SQL DDL operations as code.

You can create a new schema migration by running the `node ace make:migration` command.

```ts
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

class UserSchema extends BaseSchema {
}
```

## Lifecycle methods
Every schema class has the following lifecycle methods that get executed when you run or rollback the migrations.

---

### up
The `up` method is used to define the operations to be executed when running the `node ace migration:run` command. In this method, you always perform constructive operations like **create a table** or **alter a table**.

```ts
class UserSchema extends BaseSchema {
  public async up() {
  }
}
```

---

### down
The `down` method is supposed to undo the actions executed by the `up` method. You need to use the equivalent API for running the undo actions manually.

For example, If the `up` method creates a new table using the `createTable` method, then the `down` method can use the `dropTable` method.

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

---

### now
The `now` method is a helper to set the default value to the `CURRENT_TIMESTAMP`.

```ts
table.timestamp('created_at').defaultTo(this.now())
```

---

### raw
Creates a raw query to be used for running DDL statements.

```ts
class UserSchema extends BaseSchema {
  public up() {
    // highlight-start
    this.defer(async () => {
      await this.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    })
    // highlight-end
  }
}
```

---

### defer
The `defer` method allows you to wrap custom database operations inside a defer block. Deferring actions is required for the following reasons.

- Ensure that your custom actions are executed in the right sequence
- Ensure your actions are not executed when migrations are running in dry-run mode.

```ts
public async up() {
  this.defer(async () => {
    // Only executed when not running in dry-run mode
    await this.db.from('users')
  })
}
```

---

### debug
A property to enable/disable queries debugging for the given schema class. By default, the debugging is inherited from the [query client](./query-client.md) used by the schema class.

```ts
class UserSchema extends BaseSchema {
  public debug = false
}
```

---

### disableTransactions
A property to enable/disable wrapping database queries inside a transaction.  The transactions are enabled by default. All the statements inside a given migration file are wrapped inside a single transaction.

```ts
class UserSchema extends BaseSchema {
  public disableTransactions = true
}
```

---

### schema
Returns a reference to the [schema builder](./schema-builder.md). The property is getter and returns a new instance of schema builder on every access.

```ts
class UserSchema extends BaseSchema {
  public up() {
    // every access call returns a new instance
    console.log(this.schema !== this.schema)
  }
}
```

---

### execUp
The method is invoked internally during the migration process to execute the user-defined `up` method. **You should never call this method manually**.

---

### execDown
The method is invoked internally during the migration process to execute the user-defined `down` method. **You should never call this method manually**.

---
