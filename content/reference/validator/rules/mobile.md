Enforces the value to be properly formatted as a phone number. You can also define locales for country specific validation.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  mobile: schema.string([
    rules.mobile()
  ])
}
```

You can also specify one or more locales to force format validation for a specific country.

```ts
{
  mobile: schema.string([
    rules.mobile({
      locales: ['pt-BR', 'en-IN', 'en-US']
    })
  ])
}
```

## Strict mode
Enabling the strict mode forces the user to always define the country code and prefix the phone number with `+` symbol.

```ts
{
  mobile: schema.string([
    rules.mobile({ strict: true })
  ])
}
```
