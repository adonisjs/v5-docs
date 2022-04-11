Enforces the value to have maximum length as per defined by the rule. The rule can only be applied to `string` or an `array` schema type.

In the following example, the username with greater than 40 characters will fail the validation.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  username: schema.string({}, [
    rules.maxLength(40)
  ])
}
```

Following is an example of applying the `maxLength` rule on an array.

```ts
{
  tags: schema
    .array([
      rules.maxLength(10)
    ])
    .members(schema.string())
}
```

## Custom messages options
The `maxLength` validation rule passes the `maxLength` option to custom messages.

```ts
{
  'maxLength': 'The array can contain maximum of {{ options.maxLength }} items',
}
```
