Validates to the property to a valid object. Further you can define the shape of the object properties using the `object.members()` method.

In the following example, we expect the `profile` to be an object with the `username` and the `avatar_url` properties.

```ts
import { schema } from '@ioc:Adonis/Core/Validator'

{
  profile: schema.object().members({
    username: schema.string(),
    avatar_url: schema.string()
  })
}

// Valid data: { profile: { username: 'virk', avatar_url: 'somefile.jpg' } }
```

## Mark as optional
You can mark the property to be optional by chaining the `optional` method. The `undefined` and the `null` values are considered optional and removed from the validated object.

```ts
{
  profile: schema.object
    .optional() // 👈
    .members({
      username: schema.string(),
      avatar_url: schema.string()
    })
}
```

## Mark as nullable
You can mark the property to be nullable by chaining the `nullable` method. The `nullable` fields must exist in the payload but can contain null values.

```ts
{
  profile: schema.object
    .nullable() // 👈
    .members({
      username: schema.string(),
      avatar_url: schema.string()
    })
}
```

## Mark as nullable and optional
Mark the property both as `nullable` and `optional`. If the field value is undefined, it will be removed from the validated object. Otherwise, the validated value (including null) is returned.

```ts
{
  profile: schema.object
    .nullableAndOptional() // 👈
    .members({
      username: schema.string(),
      avatar_url: schema.string()
    })
}
```

## Accept any elements
You can also define an object that accepts any properties. The object properties are not further validated to have a specific type.

```ts
{
  colors: schema.object().anyMembers()
}
```
