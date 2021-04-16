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
You can mark the object to be optional by chaining the `optional` method. Only the `undefined` values are considered optional. We treat `null` as a valid value and it will fail the object validation.

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

## Accept any elements
You can also define an object that accepts any properties. The object properties are not further validated to have a specific type.

```ts
{
  colors: schema.object().anyMembers()
}
```
