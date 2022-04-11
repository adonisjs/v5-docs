Validates the property to be a valid [multipart file](../../../guides/http/file-uploads.md#retrieving-uploaded-files) parsed by the bodyparser. You can also define additional options to validate the file size and the extension name.

```ts
import { schema } from '@ioc:Adonis/Core/Validator'

{
  cover_image: schema.file({
    size: '2mb',
    extnames: ['jpg', 'gif', 'png'],
  }),
}
```

## Mark as optional
You can mark the property to be optional by chaining the `optional` method. The `undefined` and the `null` values are considered optional and removed from the validated object.

```ts
{
  cover_image: schema.file.optional({
    size: '2mb',
    extnames: ['jpg', 'gif', 'png'],
  })
}
```

## Mark as nullable
You can mark the property to be nullable by chaining the `nullable` method. The `nullable` fields must exist in the payload but can contain null values.

```ts
{
  cover_image: schema.file.nullable({
    size: '2mb',
    extnames: ['jpg', 'gif', 'png'],
  })
}
```

## Mark as nullable and optional
Mark the property both as `nullable` and `optional`. If the field value is undefined, it will be removed from the validated object. Otherwise, the validated value (including null) is returned.

```ts
{
  cover_image: schema.file.nullableAndOptional({
    size: '2mb',
    extnames: ['jpg', 'gif', 'png'],
  })
}
```

## Define additional rules
Currently there are NO rules available for the file schema type. However, if you were to create one, then you can pass it as the second argument.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  cover_image: schema.file(
    {
      size: '2mb',
      extnames: ['jpg', 'gif', 'png'],
    },
    [
      // NOTE: This rule does not exists.
      rules.dimensions({ minWidth: 100, minHeight: 200 })
    ]
  ),
}
```

## Custom messages options
The `file` schema type passes the `size` and the `extnames` to custom messages.

```ts
{
  'file.size': 'The file size must be under {{ options.size }}',
  'file.extname': 'The file must have one of {{ options.extnames }} extension names',
}
```
