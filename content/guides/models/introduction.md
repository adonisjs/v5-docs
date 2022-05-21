---
summary: An introduction to the Lucid ORM data models, built on the active record pattern.
---

Along with the Database query builder, Lucid also has data models built on top of the [active record pattern](https://en.wikipedia.org/wiki/Active_record_pattern).

The data models layer of Lucid makes it super easy to **perform CRUD operations**, **manage relationships between models**, and **define lifecycle hooks**. 

We recommend using models extensively and reach for the standard query builder for particular use cases.

## What is the active record pattern?

Active Record is also the name of the ORM used by Ruby on Rails. However, the active record pattern is a broader concept that any programming language or framework can implement.

:::note

Whenever we say the term **active record**, we are talking about the pattern itself and not the implementation of Rails.

:::

The active record pattern advocates encapsulating the database interactions to language-specific objects or classes. Each database table gets its model, and each instance of that class represents a table row.

The data models clean up many database interactions since you can encode most of the behavior inside your models vs. writing it everywhere inside your codebase. 

For example, Your `users` table has a date field, and you want to format that before sending it back to the client. **This is how your code may look like without using data models**.

```ts
import { DateTime } from 'luxon'
const users = await Database.from('users').select('*')

return users.map((user) => {
  user.dob = DateTime.fromJSDate(user.dob).toFormat('dd LLL yyyy')
  return user
})
```

When using data models, you can encode the date formatting action within the model vs. writing it everywhere you fetch and return users.

```ts
import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

class User extends BaseModel {
  @column.date({
    serialize: (value) => value.toFormat('dd LLL yyyy')
  })
  public dob: DateTime
}
```

And use it as follows:

```ts
const users = await User.all()
return users.map((user) => user.toJSON()) // date is formatted during `toJSON` call
```

## Creating your first model
Assuming you already have Lucid [set up](../database/introduction.md), run the following command to create your first data model.

```sh
node ace make:model User

# CREATE: app/Models/User.ts
```

You can also generate the migration alongside the model by defining the `-m` flag.

```sh
node ace make:model User -m

# CREATE: database/migrations/1618903673925_users.ts
# CREATE: app/Models/User.ts
```

Finally, you can also create the factory for the model using the `-f` flag.

```sh
node ace make:model User -f

# CREATE: app/Models/User.ts
# CREATE: database/factories/User.ts
```

The `make:model` command creates a new model inside the `app/Models` directory. Every model must extend the `BaseModel` class to inherit additional functionality.

```ts
import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
```

## Columns
You will have to define your database columns as properties on the class and decorate them using the `@column` decorator. 

Since AdonisJS uses TypeScript, there is no way to get around WITHOUT defining the columns explicitly on the class. Otherwise, the TypeScript compiler will complain about the following error.

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1618899190/v5/models-property-error.png)

#### Points to note
- The `@column` decorator is used to distinguish between the standard class properties and the database columns.
- We keep the models lean and do not define database-specific **constraints**, **data types** and **triggers** inside models.
- Any option you define inside the models does not change/impact the database. You must use migrations for that.

To summarize the above points - **Lucid maintains a clear separation between migrations and the models**. Migrations are meant to create/alter the tables, and models are intended to query the database or insert new records.

---

### Defining columns
Now that you are aware of the existence of columns on the model class. Following is an example of defining the user table columns as properties on the `User` model.

```ts
import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public username: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public avatarUrl: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
```

The `@column` decorator additionally accepts options to configure the property behavior.

- The `isPrimary` option marks the property as the primary key for the given database table.
- The `serializeAs: null` option removes the property when you serialize the model to JSON.
- [View all available options](../../reference/orm/decorators.md#column) accepted by the `@column` decorator.

---

### Date columns
Lucid further enhances the date and the date-time properties and converts the database driver values to an instance of [luxon.DateTime](https://moment.github.io/luxon/).

All you need to do is make use of the `@column.date` or `@column.dateTime` decorators, and Lucid will handle the rest for you.

```ts
@column.date()
public dob: DateTime

@column.dateTime({ autoCreate: true })
public createdAt: DateTime

@column.dateTime({ autoCreate: true, autoUpdate: true })
public updatedAt: DateTime
```

Optionally, you can pass the `autoCreate` and `autoUpdate` options to always define the timestamps during the creation and the update operations. **Do note, setting these options doesn't modify the database table or its triggers.**

---

### Column names
Lucid assumes that your database columns names are defined as `snake_case` and automatically converts the model properties to snake case during database queries. For example:

```ts
await User.create({ avatarUrl: 'foo.jpg' })

// EXECUTED QUERY
// insert into "users" ("avatar_url") values (?)
```

#### Overwrite column names globally
If you are not using the `snake_case` convention in your database, then you can override the default behavior of Lucid by defining a custom [Naming Strategy](../../reference/orm/naming-strategy.md)

#### Overwrite column names inline
You can also define the database column names explicitly within the `@column` decorator. This is usually helpful for bypassing the convention in specific use cases.

```ts
@column({ columnName: 'user_id', isPrimary: true })
public id: number
```

## Models config
Following are the configuration options to overwrite the conventional defaults.

### primaryKey
Define a custom primary key (defaults to id). Setting the `primaryKey` on the model doesn't modify the database. Here, you are just telling Lucid to consider id as the unique value for each row.

```ts
class User extends Basemodel {
  public static primaryKey = 'email'
}
```

Or use the `primaryKey` column option.

```ts
class User extends Basemodel {
  @column({ isPrimary: true })
  public email: string
}
```

---

### table
Define a custom database table name. [Defaults](../../reference/orm/naming-strategy.md#tablename) to the plural and snake case version of the model name.

```ts
export default class User extends BaseModel {
  public static table = 'app_users'
}
```

---

### selfAssignPrimaryKey
Set this option to `true` if you don't rely on the database to generate the primary keys. For example, You want to self-assign `uuid` to the new rows.

```ts
import uuid from 'uuid/v4'
import { BaseModel, beforeCreate } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  public id: string

  @beforeCreate()
  public static assignUuid(user: User) {
    user.id = uuid()
  }
}
```

---

### connection
Instruct model to use a custom database connection defined inside the `config/database` file.

:::note

DO NOT use this property to switch the connection at runtime. This property only defines a static connection name that remains the same throughout the application's lifecycle.

:::

```ts
export default class User extends BaseModel {
  public static connection = 'pg'
}
```

## FAQs

<details>
  <summary>Does models creates the database tables automatically?</summary>
  
No. We do not sync your models with the database. Creating/altering tables must be done using [migrations](../database/migrations.md). Here are some of the reasons for not using models to create the database schema.

1. Generating database tables from models means defining all database-level constraints and config within the models. This adds unnecessary bloat to the models.
2. Not every database change is as simple as renaming a column. There are scenarios in which you want to migrate data from one table to another during re-structuring, and this cannot/should not be expressed within models.

</details>

<details>
<summary>I am coming from TypeORM, how should I define column types?</summary>

We do not express database types inside models. Instead, we follow the approach of **lean models** and keep database level config within migrations.

</details>

<details>
<summary>Can I move my Models somewhere else?</summary>

Yes. You are free to put your model wherever you want! If your models are inside the `app/Something` folder, you will use `App/Something/ModelName` to load your model.

</details>

## Additional reading

- Make sure to read the [models reference guide](../../reference/orm/base-model.md).
- [CRUD operations](./crud.md) using models.
- How to [serialize models](./serialization.md) to JSON.
