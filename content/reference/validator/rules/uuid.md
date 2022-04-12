Enforce the value of field under validation is a valid `uuid`. You can also optionally enforce a specific uuid version.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  id: schema.string([
    rules.uuid()
  ])
}
```

Following is an example of validating the `id` to be a `uuidv4` string. 

```ts
{
  id: schema.string([
    rules.uuid({ version: 4 })
  ])
}
```
