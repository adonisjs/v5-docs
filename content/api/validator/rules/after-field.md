Similar to the [after rule](./after.md). However, instead of defining a date/offset for comparison, you define **a field to check against**. For example:

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  checkin_date: schema.date(),
  checkout_date: schema.date({}, [
    rules.afterField('checkin_date')
  ]),
}
```

Also, you can make use of the `afterOrEqualToField` for enforcing the date to be same or after a given field.

```ts
{
  drafted_at: schema.date(),
  published_at: schema.date({}, [
    rules.afterOrEqualToField('drafted_at')
  ]),
}
```
