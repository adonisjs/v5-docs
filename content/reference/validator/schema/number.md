Validates the property to be a valid number. The string representation of a number will be casted to a number data type. For example: `"22"` becomes `22`.

```ts
import { schema } from '@ioc:Adonis/Core/Validator'

{
  marks: schema.number()
}
```

## Mark as optional
You can mark the property to be optional by chaining the `optional` method. The `undefined` and the `null` values are considered optional and removed from the validated object.

```ts
{
  marks: schema.number.optional()
}
```

## Mark as nullable
You can mark the property to be nullable by chaining the `nullable` method. The `nullable` fields must exist in the payload but can contain null values.

```ts
{
  marks: schema.number.nullable()
}
```

## Mark as nullable and optional
Mark the property both as `nullable` and `optional`. If the field value is undefined, it will be removed from the validated object. Otherwise, the validated value (including null) is returned.

```ts
{
  marks: schema.number.nullableAndOptional()
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
