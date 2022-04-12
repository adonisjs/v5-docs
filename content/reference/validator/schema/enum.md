Validates the property to be one from the available choices. The return value data type for the `enum` type is a TypeScript union.

```ts
import { schema } from '@ioc:Adonis/Core/Validator'

{
  account_type: schema.enum(
    ['twitter', 'github', 'instagram'] as const
  )
}
```

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1618248238/v5/literal-union-enum.jpg)

You can also make use of TypeScript enums.

```ts
enum SocialAccounts {
  TWITTER = 'twitter',
  GITHUB = 'github',
  INSTAGRAM = 'instagram',
}

{
  account_type: schema.enum(Object.values(SocialAccounts))
}
```

## Mark as optional
You can mark the property to be optional by chaining the `optional` method. The `undefined` and the `null` values are considered optional and removed from the validated object.

```ts
{
  account_type: schema.enum.optional(Object.values(SocialAccounts))
}
```

## Mark as nullable
You can mark the property to be nullable by chaining the `nullable` method. The `nullable` fields must exist in the payload but can contain null values.

```ts
{
  account_type: schema.enum.nullable(Object.values(SocialAccounts))
}
```

## Mark as nullable and optional
Mark the property both as `nullable` and `optional`. If the field value is undefined, it will be removed from the validated object. Otherwise, the validated value (including null) is returned.

```ts
{
  account_type: schema.enum.nullableAndOptional(Object.values(SocialAccounts))
}
```

## Define additional rules
You can define an array of additional rules as the second parameter.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  account_type: schema.enum(Object.values(SocialAccounts), [
    rules.unique({
      table: 'user_social_accounts',
      column: 'service',
    }),
  ])
}
```

## enum options as refs
If your enum options relies on the runtime values and you are using the schema caching, then you must move them to the refs.

Following is example of defining options via refs.

```ts
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/**
 * Dummy implementation returning hardcoded list of cities
 */
function getCities(_state: string) {
  return  ['Mumbai', 'Pune', 'Nagpur']
}

export default class CreateUserValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  // highlight-start
  public refs = schema.refs({
    cities: getCities(this.ctx.request.input('state'))
  })

  public schema = schema.create({
    city: schema.enum(this.refs.cities)
  })
  // highlight-end

  public cacheKey = this.ctx.routeKey
}
```

## enumSet
The `schema.enumSet` type is similar to the `enum` type, instead it accepts an array of one or more values.

In the following example, the user can select **one or more** skills.

```ts
{
  skills: schema.enumSet([
    'Programming',
    'Design',
    'Marketing',
    'Copy writing',
  ] as const)
}
```

## Custom messages options
The `enum` and the `enumSet` schema types passes the choices array to custom messages.

```ts
{
  'enum': 'The value must be one of {{ options.choices }}',
  'enumSet': 'The values must be one of {{ options.choices }}',
}
```
