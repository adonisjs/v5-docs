Validates the value to be less than to a provided value. 

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  age: schema.number({}, [
    rules.lessThan(18)
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
    endDate: getDateFromSomeWhere(),
  })

  public schema = schema.create({
    startDate: schema.string({}, [
      rules.lessThan(this.refs.endDate)
    ]),
  })
  // highlight-end

  public cacheKey = this.ctx.routeKey
}
```
