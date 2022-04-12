Validates the value to ensure it is not inside an array of provided values.

:::note

There is no `rules.in` rule. We encourage you to use the [enum schema type](../schema/enum.md) as it provides better static type safety.

:::

```ts
{
  username: schema.string([
    rules.notIn(['admin', 'super', 'root'])
  ])
}
```

## Providing values as a ref

If your list options relies on the runtime values and you are using schema caching, then you must move them to the `refs`.

Following is example of defining options via refs.

```ts
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  // highlight-start
  public refs = schema.refs({
    unallowedValues: getValuesFromSomewhere(),
  })

  public schema = schema.create({
    username: schema.string([
      rules.notIn(this.refs.unallowedValues)
    ]),
  })
  // highlight-end

  public cacheKey = this.ctx.routeKey
}
```

## Custom messages options
The `notIn` validation rule passes the `values` array as the only option to custom messages.

```ts
{
  'notIn': 'The {{ field }} value cannot be one of {{ options.values }}',
}
```
