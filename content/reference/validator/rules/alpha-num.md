Validates the value to only have letters, numeric or both of them. **The validation rule only works with the `string` schema
type**.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  username: schema.string([
    rules.alphaNum(),
  ])
}
```

You can also allow the string to have `spaces`, `dash` and `underscore` characters.

```ts
{
  username: schema.string([
    rules.alphaNum({
      allow: ['space', 'underscore', 'dash']
    })
  ])
}
```
