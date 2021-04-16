Enforces the value to be properly formatted as an email. **The validation rule only works with the `string` schema type**.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  email: schema.string({}, [
    rules.email()
  ])
}
```

You can also define the following options to control the validation behavior.

```ts
{
  email: schema.string({}, [
    rules.email({
      sanitize: true,
      ignoreMaxLength: true,
      domainSpecificValidation: true,
    })
  ])
}
```

#### allowIpDomain
By default, the IP addresses cannot be defined as the host of the email. Set the option to `true` to allow IP addresses as well.

---

#### ignoreMaxLength
The email address is validated for its max length. Optionally, you can disable the check by enabling the `ignoreMaxLength` option.

---

#### domainSpecificValidation
Enable this option to perform domain specific validations. For example: disallowing certain syntactically valid email addresses that are rejected by GMail.

---

#### sanitize
Not a validation option, but instead can be used to transform the local part of the email (before the @ symbol) to all lowercase.

---
