Validates the value to be greater than to a provided value. 

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  age: schema.number({}, [
    rules.greaterThan(18)
  ])
}
```

If the provided value is computed at runtime and you are using schema caching, then you must make use of `refs`.

```ts
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  // highlight-start
  public refs = schema.refs({
    startDate: getDateFromSomeWhere(),
  })

  public schema = schema.create({
    endDate: schema.string({}, [
      rules.greaterThan(this.refs.startDate)
    ]),
  })
  // highlight-end

  public cacheKey = this.ctx.routeKey
}
```
