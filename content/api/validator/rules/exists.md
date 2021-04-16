Queries the database to ensure the value exists inside a given database table and column.

:::note

The validation rule is added by `@adonisjs/lucid` package. So make sure it is [installed and configured](../../../guides/database/setup.md), before using this rule.

:::

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  slug: schema.string({}, [
    rules.exists({ table: 'categories', column: 'slug' })
  ])
}
```

## Case insensitivity

Many databases perform case sensitive queries. So either you can transform the value to `lowerCase` in JavaScript or make use of the `caseInsensitive` option to convert value to lowercase during the query.

```ts
{
  username: schema.string({}, [
    rules.exists({
      table: 'users',
      column: 'username',
      caseInsensitive: true,
    })
  ])
}
```

Following is an example of the query executed behind the scenes.

```sql
SELECT username FROM users WHERE LOWER(username) = LOWER(?)
```

## Additional constraints

Additionally, you can also define `where` and `whereNot` constraints as an object of key-value pair. The `key` is the column name.

```ts
{
  slug: schema.string({}, [
    rules.exists({
      table: 'categories',
      column: 'slug',
      // highlight-start
      where: {
        tenant_id: 1,
        status: 'active',
      },
      // highlight-end
    })
  ])
}
```

```sql
SELECT slug FROM categories
  WHERE slug = ?
  AND tenant_id = ?
  AND status = ?
```

We perform a `whereIn` query if the value is an **array**. For example:

```ts
rules.exists({
  table: 'categories',
  column: 'slug',
  // highlight-start
  where: {
    group_id: [1, 2, 4],
  },
  // highlight-end
})
```

```sql
SELECT slug FROM categories
  WHERE slug = ?
  AND group_id IN (?, ?, ?)
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
    username: schema.string({}, [
      rules.exists({
        table: 'users',
        column: 'username',
        // highlight-start
        where: { tenant_id: this.refs.tenantId },
        // highlight-end
      })
    ])
  })

}
```
