Validates the value to be before a given date/offset. **The rule can be only be used with the date schema type**.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  joining_date: schema.date({}, [
    rules.before(2, 'days')
  ])
}
```

The `rules.before` method accepts a **duration** and the **offset** for the duration. Following are some of the examples for the same. You can use the TypeScript intellisense to discover rest of the available offsets.

```ts
rules.before(2, 'days')
rules.before(1, 'month')
rules.before(4, 'years')
rules.before(30, 'minutes')
```

You can also pass the one of the following shorthand keywords.

```ts
rules.before('today')
rules.before('yesterday')
```

Also, you can make use of the `beforeOrEqual` for enforcing the date to be same or after a given date.

```ts
{
  joining_date: schema.date({}, [
    rules.beforeOrEqual('today')
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

class UserValidator {
  // highlight-start
  public refs = schema.refs({
    allowedDate: DateTime.local().minus({ days: 2 })
  })
  // highlight-end

  public schema = schema.create({
    checkin_date: schema.date({}, [
      // highlight-start
      rules.before(this.refs.allowedDate)
      // highlight-end
    ])
  })
}
```
