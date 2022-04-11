Enforces the value to have minimum length as per defined by the rule. The rule can only be applied to `string` or an `array` schema type.

In the following example, the username with less than 4 characters will fail the validation.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  username: schema.string({}, [
    rules.minLength(4)
  ])
}
```

Following is an example of applying the `minLength` rule on an array.

```ts
{
  tags: schema
    .array([
      rules.minLength(1)
    ])
    .members(schema.string())
}
```

## Custom messages options
The `minLength` validation rule passes the `minLength` option to custom messages.

```ts
{
  'minLength': 'The array must have minimum of {{ options.minLength }} items',
}
```
