---
summary: Database schema builder complete API reference
---

The schema builder allows you **create**, **alter**, **drop**, and perform other SQL DDL operations.

You can access the schema builder instance using the `this.schema` property in your migration files.

```ts
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

class UserSchema extends BaseSchema {
  public up() {
    console.log(this.schema)
  }
}
```

## Methods/Properties
Following is the list of methods/properties available on the schema builder class.

---

### createTable
Creates a new database table. The method accepts the table name and a callback that receives the [table builder](./table-builder.md) instance to create table columns.

```ts
class UserSchema extends BaseSchema {
  public up() {
    // highlight-start
    this.schema.createTable('users', (table) => {
      table.increments()
      table.string('name')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
    // highlight-end
  }
}
```

---

### createSchema
Create the PostgreSQL schema. It accepts the schema name.

```ts
class FoundationSchema extends BaseSchema {
  public up() {
    // highlight-start
    this.schema.createSchema('public')
    // highlight-end
  }
}
```

---

### table/alterTable
Select a SQL table to alter its columns. The method accepts the table name and a callback that receives the [table builder](./table-builder.md) instance to modify the table columns.

```ts
class UserSchema extends BaseSchema {
  public up() {
    // highlight-start
    this.schema.alterTable('user', (table) => {
      /**
       * Drop the name column
       */
      table.dropColumn('name')

      /**
       * Add first_name and last_name columns
       */
      table.string('first_name')
      table.string('last_name')
    })
    // highlight-end
  }
}
```

---

### renameTable
Rename a table. The method accepts the existing table name as the first argument and the new name as the second argument.

```ts
class UserSchema extends BaseSchema {
  public up() {
    // highlight-start
    this.schema.renameTable('user', 'app_users')
    // highlight-end
  }
}
```

---

### dropTable
Drop an existing SQL table. The method accepts the table name as the only argument.

```ts
class UserSchema extends BaseSchema {
  public down() {
    // highlight-start
    this.schema.dropTable('users')
    // highlight-end
  }
}
```

---

### dropTableIfExists
Similar to the `dropTable` method, but conditionally drop the table if it exists.

```ts
class UserSchema extends BaseSchema {
  public down() {
    // highlight-start
    this.schema.dropTableIfExists('users')
    // highlight-end
  }
}
```

---

### dropSchema
Drop an existing PostgreSQL schema. The method accepts the schema name as the only argument.

```ts
class FoundationSchema extends BaseSchema {
  public down() {
    // highlight-start
    this.schema.dropSchema('public')
    // highlight-end
  }
}
```

---

### dropSchemaIfExists
Similar to the `dropSchema` method, but conditionally drop the schema if it exists.

```ts
class FoundationSchema extends BaseSchema {
  public down() {
    // highlight-start
    this.schema.dropSchemaIfExists('public')
    // highlight-end
  }
}
```

---

### raw
Run a SQL query from the raw string. Unlike the [raw query builder](./raw-query-builder.md), the `schema.raw` method does not accept bindings separately.

```ts
class UserSchema extends BaseSchema {
  public up() {
    // highlight-start
    this.schema
      .raw("SET sql_mode='TRADITIONAL'")
      // highlight-end
      .table('users', (table) => {
        table.dropColumn('name')
        table.string('first_name')
        table.string('last_name')
      })
  }
}
```

---

### withSchema
Specify the schema to select when running the SQL DDL statements. The method accepts the schema name as the only argument.

```ts
class UserSchema extends BaseSchema {
  public up() {
    // highlight-start
    this.schema
      .withSchema('public')
      // highlight-end
      .createTable('users', (table) => {
        table.increments()
        table.string('name')
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
  }
}
```
