Validates the property to be a valid number. The string representation of a number will be casted to a number data type. For example: `"22"` becomes `22`.

```ts
import { schema } from '@ioc:Adonis/Core/Validator'

{
  marks: schema.number()
}
```

## Mark as optional
You can mark the property to be optional by chaining the `optional` method. Only the `undefined` values are considered optional. We treat `null` as a valid value and it will fail the number validation.

```ts
{
  marks: schema.number.optional()
}
```

## Define additional rules
You can define an array of additional rules as the first parameter.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  marks: schema.number([
    rules.unsigned(),
    rules.range(10, 100),
  ])
}
```
