Validates the value to only have letters. **The validation rule only works with the `string` schema
type**.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  username: schema.string([
    rules.alpha(),
  ])
}
```

You can also allow the string to have `spaces`, `dash` and `underscore` characters.

```ts
{
  username: schema.string([
    rules.alpha({
      allow: ['space', 'underscore', 'dash']
    })
  ])
}
```
