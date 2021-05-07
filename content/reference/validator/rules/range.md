Validates the value to be within a given range. The rule can only be used with the `number` schema type.

In the following example, the value of `age < 18` and `> 40` will fail the validation.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  age: schema.number([
    rules.range(18, 40)
  ])
}
```
