The `trim` is sanitization rule to trim all the whitespace from the left and the right of the string.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  username: schema.string([
    rules.trim()
  ])
}
```
