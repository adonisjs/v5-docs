Enforces the value to be properly formatted as an email. **The validation rule only works with the `string` schema type**.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  email: schema.string([
    rules.email()
  ])
}
```

The `email` rule uses the `validator.isEmail` method from the [validatorjs](https://www.npmjs.com/package/validator) package. You can specify all of the options accepted by the `validator.isEmail` method. Just make sure to pass them in **camelCase form**.

```ts
{
  email: schema.string([
    rules.email({
      ignoreMaxLength: true,
      allowIpDomain: true,
      domainSpecificValidation: true,
    })
  ])
}
```

## Normalize email
You can make use of the `rules.normalizeEmail` method to normalize the email address.

The `normalizeEmail` rule uses the `validator.normalizeEmail` method from the [validatorjs](https://www.npmjs.com/package/validator) package. You can specify all of the options accepted by the `validator.normalizeEmail` method. Just make sure to pass them in **camelCase form**.

```ts
{
  email: schema.string([
    rules.email(),
    rules.normalizeEmail({
      allLowercase: true,
      gmailRemoveDots: true,
      gmailRemoveSubaddress: true,
    }),
  ])
}
```
