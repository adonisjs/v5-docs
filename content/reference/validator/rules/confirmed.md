Enforce the field under validation is also confirmed using the `_confirmation` convention. You will mostly use this rule for password confirmation.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  password: schema.string([
    rules.confirmed()
  ])
}

/**
 Valid data: {
    password: 'secret',
    password_confirmation: 'secret'
 }
 */
```

Optionally, you can also change the field name that should be checked for the confirmation. It is usually helpful when you are not using the `snake_case` convention for the field names.

```ts
{
  password: schema.string([
    rules.confirmed('passwordConfirmation')
  ])
}

/**
 Valid data: {
    password: 'secret',
    passwordConfirmation: 'secret'
 }
 */
```

## Custom message
You can define custom message for the `confirmed` rule on confirmation field.

```ts
{
  'password_confirmation.confirmed': 'Password do not match'
}
```
