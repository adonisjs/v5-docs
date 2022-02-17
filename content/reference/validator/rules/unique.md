Queries the database to ensure the value **does NOT exists** inside a given database table and column.

:::note

The validation rule is added by `@adonisjs/lucid` package. So make sure it is [installed and configured](../../../guides/database/setup.md), before using this rule.

:::

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  email: schema.string({}, [
    rules.unique({ table: 'users', column: 'email' })
  ])
}
```

## Case insensitivity

Many databases perform case sensitive queries. So either you can transform the value to `lowerCase` in JavaScript or make use of the `caseInsensitive` option to convert value to lowercase during the query.

```ts
{
  email: schema.string({}, [
    rules.unique({
      table: 'users',
      column: 'email',
      caseInsensitive: true,
    })
  ])
}
```

Following is an example of the query executed behind the scenes.

```sql
SELECT email FROM users WHERE LOWER(email) = LOWER(?)
```

## Additional constraints

Additionally, you can also define `where` and `whereNot` constraints as an object of key-value pair. The `key` is the column name.

```ts
{
  email: schema.string({}, [
    rules.unique({
      table: 'users',
      column: 'email',
      // highlight-start
      where: {
        tenant_id: 1,
      },
      // highlight-end
    })
  ])
}
```

```sql
SELECT email FROM users WHERE email = ? AND tenant_id = ?
```

We perform a `whereIn` query if the value is an **array**. For example:

```ts
rules.unique({
  table: 'users',
  column: 'email',
  // highlight-start
  where: {
    account_type: ['member', 'vip'],
  },
  // highlight-end
})
```

```sql
SELECT string FROM users
  WHERE email = ?
  AND account_type IN (?, ?)
```

## Using refs

If you are caching your validation schema using the `cacheKey` and your **where constraints** relies on a runtime value, then you must make use of refs.

```ts
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateUserValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  // highlight-start
  public refs = schema.refs({
    tenantId: this.ctx.auth.user!.tenantId
  })
  // highlight-end

  public schema = schema.create({
    email: schema.string({}, [
      rules.unique({
        table: 'users',
        column: 'email',
        // highlight-start
        where: { tenant_id: this.refs.tenantId },
        // highlight-end
      })
    ])
  })
}
```
