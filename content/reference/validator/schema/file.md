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
