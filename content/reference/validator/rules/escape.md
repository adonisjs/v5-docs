The `escape` is sanitization rule to replace `<`, `>`, `&`, `'`, `"` and `/` with HTML entities.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  username: schema.string([
    rules.escape()
  ])
}
```
