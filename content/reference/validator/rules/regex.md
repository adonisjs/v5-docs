Validates the value against the defined regex. The rule can only be used with the `string` schema type.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  username: schema.string([
    rules.regex(/^[a-zA-Z0-9]+$/)
  ])
}
```

You can pass the `RegExp` instance directly.

```ts
{
  username: schema.string([
    rules.regex(new RegExp('^[a-zA-Z0-9]+$'))
  ])
}
```
