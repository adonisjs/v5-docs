The `requiredIf` rules allows you to mark a field as required when a certain condition is met. When using the `requiredIf` rules, you must mark the field as optional first.

## requiredIfExists

Validates the field to be present when other the field is present. For example: The user must fill out the shipping address when opted for delivery.

:::note

The opposite of this rule is `requiredIfNotExists`

:::

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  address: schema.string.optional([
    rules.requiredIfExists('needs_delivery')
  ])
}
```

## requiredIfExistsAll
Same as the `requiredIf` rule, but here you can define more than one field to exist in order for the field to be required.

:::note

The opposite of this rule is `requiredIfNotExistsAll`

:::


```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  tax_id: schema.string.optional([
    rules.requiredIfExistsAll(['owns_a_car', 'owns_a_house'])
  ])
}
```

## requiredIfExistsAny
Mark the current field as required, **when any of the other fields exists** and contains some value.

:::note

The opposite of this rule is `requiredIfNotExistsAny`

:::


```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  password: schema.string.optional([
    rules.requiredIfExistsAny(['username', 'email'])
  ])
}
```

## requiredWhen
Mark the current field as required **when the value of the other field matches a given criteria**.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  address: schema.string.optional([
    rules.requiredWhen('delivery_method', '=', 'shipping')
  ])
}
```

The `requiredWhen` rule support the following operators.

- `in` accepts an array of values
- `notIn` accepts an array of values
- `=` accepts a literal value
- `!=` accepts a literal value
- `>` accepts a numeric value
- `<` accepts a numeric value
- `>=` accepts a numeric value
- `<=` accepts a numeric value
