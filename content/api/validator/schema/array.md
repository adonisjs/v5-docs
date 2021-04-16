Validates the property to be an array. Further you can define the shape of the array elements using the `array.members()` method.

In the following example, the `tags` property accepts an array of numbers.

```ts
import { schema } from '@ioc:Adonis/Core/Validator'

{
  tags: schema.array().members(schema.number())
}

// Valid data: [1, 3, 8, 11, 22]
```

Following is an example of accepting an array of objects with `username` and the `email` properties.

```ts
{
  users: schema.array().members(
    schema.object().members({
      username: schema.string(),
      email: schema.string(),
    })
  ),
}

// Valid data: [{ username: 'virk', email: 'virk@adonisjs.com' }]
```

## Mark as optional
You can mark the array to be optional by chaining the `optional` method. Only the `undefined` values are considered optional. We treat `null` as a valid value and it will fail the array validation.

In the following example, we expect the array either to be `undefined` or have alteast one element.

```ts
{
  tags: schema.array
    .optional([
      rules.minLength(1)
    ]) // 👈
    .members(schema.number())
}
```

## Validating array length
You can validate the array length by using the `minLength` and the `maxLength` rules. In the following example, we accept a minimum of 1 and a maximum of 5 tags.

```ts
{
  tags: schema
    .array([
      rules.minLength(1),
      rules.maxLength(5)
    ])
    .members(schema.number()),  
}
```

## Accept any elements
You can also define an array that accepts any elements. The array elements are not further validated to have a specific type.

```ts
{
  themeOptions: schema.array().anyMembers()
}
```
