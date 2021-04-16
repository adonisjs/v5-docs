Similar to the [before rule](./before.md). However, instead of defining a date/offset for comparison, you define **a field to check against**. For example:

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  checkout_date: schema.date(),
  checkin_date: schema.date({}, [
    rules.beforeField('checkout_date')
  ]),
}
```

Also, you can make use of the `beforeOrEqualToField` for enforcing the date to be same or after a given field.

```ts
{
  published_on: schema.date(),
  drafted_on: schema.date({}, [
    rules.beforeOrEqualToField('published_on')
  ]),
}
```
