Validates the property to be a valid string. Optionally you can define the options to **trim the whitespace** and **escape the value**.

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
- The `trim` option removes the surrounding whitespace

## Mark as optional
You can mark the property to be optional by chaining the `optional` method. Only the `undefined` values are considered optional. We treat `null` as a valid value and it will fail the string validation.

```ts
{
  title: schema.string.optional({
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
