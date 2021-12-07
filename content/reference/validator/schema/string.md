Validates the property to be a valid string. Optionally you can define the options for **trimming the whitespace** and **escaping the value**.

```ts
import { schema } from '@ioc:Adonis/Core/Validator'

{
  title: schema.string({
    escape: true,
    trim: true
  })
}
```

- The `escape` option will convert `<`, `>`, `&`, `'`, `"` and `/` characters to HTML entities.
- The `trim` option removes the surrounding whitespace.

## Mark as optional
You can mark the property to be optional by chaining the `optional` method. The `undefined` and the `null` values are considered optional and removed from the validated object.

```ts
{
  title: schema.string.optional({
    escape: true,
    trim: true
  })
}
```

## Mark as nullable
You can mark the property to be nullable by chaining the `nullable` method. The `nullable` fields must exist in the payload but can contain null values.

```ts
{
  title: schema.string.nullable({
    escape: true,
    trim: true
  })
}
```

## Mark as nullable and optional
Mark the property both as `nullable` and `optional`. If the field value is undefined, it will be removed from the validated object. Otherwise, the validated value (including null) is returned.

```ts
{
  title: schema.string.nullableAndOptional({
    escape: true,
    trim: true
  })
}
```

## Define additional rules
You can define an array of additional rules as the second parameter.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  title: schema.string({}, [
    rules.alpha(),
    rules.minLength(10),
    rules.maxLength(200)
  ])
}
```
