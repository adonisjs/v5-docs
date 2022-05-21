The `trim` is sanitization rule to trim all the whitespaces from the left and the trim of the string.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  username: schema.string([
    rules.trim()
  ])
}
```
