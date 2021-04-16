Validates the value to be a valid IP address. Optionally, you can also enforce the IP version as `4` or `6`.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  ip: schema.string({}, [
    rules.ip()
  ])
}
```

```ts
{
  ip: schema.string({}, [
    rules.ip({ version: 6 })
  ])
}
```
