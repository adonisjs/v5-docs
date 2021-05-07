Validates the value to be equal to a provided value. 

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  country: schema.string({}, [
    rules.equalTo('IN')
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
    teamsCountry: getTeamCountryFromSomeWhere(),
  })

  public schema = schema.create({
    country: schema.string({}, [
      rules.equalTo(this.refs.teamsCountry)
    ]),
  })
  // highlight-end

  public cacheKey = this.ctx.routeKey
}
```
