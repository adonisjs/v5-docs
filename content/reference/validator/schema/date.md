Validates the property to be a valid date object or a string representing a date. The values are casted to an instance of [luxon.DateTime](https://moment.github.io/luxon/#/tour?id=creating-a-datetime)

```ts
import { schema } from '@ioc:Adonis/Core/Validator'

{
  published_at: schema.date()
}
```

You can also enforce a format for the string values by defining a valid format accepted by luxon.

```ts
{
  published_at: schema.date({
    format: 'yyyy-MM-dd HH:mm:ss',
  })
}
```

Or use the following shorthand codes for standardized date/time formats.

```ts
{
  published_at: schema.date({
    format: 'rfc2822',
  })
}
~
// OR
{
  published_at: schema.date({
    format: 'sql',
  })
}

// OR
{
  published_at: schema.date({
    format: 'iso',
  })
}
```

## Mark as optional
You can mark the property to be optional by chaining the `optional` method. Only the `undefined` values are considered optional. We treat `null` as a valid value and it will fail the date validation.

```ts
{
  published_at: schema.date.optional({
    format: 'yyyy-MM-dd HH:mm:ss',
  })
}
```

## Define additional rules
You can define an array of additional rules as the second parameter.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  published_at: schema.date({}, [
    rules.after('today'),
    rules.before(10, 'days'),
  ])
}
```
