Validates the value to be after a given date/offset. **The rule can be only be used with the date schema type**.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  checkin_date: schema.date({}, [
    rules.after(2, 'days')
  ])
}
```

The `rules.after` method accepts a **duration** and the **offset** for the duration. Following are some of the examples for the same. You can use the TypeScript intellisense to discover rest of the available offsets.

```ts
rules.after(2, 'days')
rules.after(1, 'month')
rules.after(4, 'years')
rules.after(30, 'minutes')
```

You can also pass the one of the following shorthand keywords.

```ts
rules.after('today')
rules.after('tomorrow')
```

Also, you can make use of the `afterOrEqual` for enforcing the date to be same or after a given date.

```ts
{
  checkin_date: schema.date({}, [
    rules.afterOrEqual('today')
  ])
}
```

## Using Luxon dates

For more advanced use cases, you can pass an instance of the [luxon DateTime](https://moment.github.io/luxon/api-docs/index.html#datetime) object. **Do make sure to pass the value as a ref**.

```ts
// highlight-start
import { DateTime } from 'luxon'
// highlight-end
import { schema, rules } from '@ioc:Adonis/Core/Validator'

class HolidayValidator {
  // highlight-start
  public refs = schema.refs({
    allowedDate: DateTime.local().plus({ days: 2 })
  })
  // highlight-end

  public schema = schema.create({
    joining_date: schema.date({}, [
      // highlight-start
      rules.after(this.refs.allowedDate)
      // highlight-end
    ])
  })
}
```
