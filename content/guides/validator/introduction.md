AdonisJS has inbuilt support for validating data using a pre-defined validation schema. Since, the validator is baked into the core of the framework, there is no need to install any additional dependencies. Just define the schema and validate the data against it.

```ts
import Route from '@ioc:Adonis/Core/Route'
import { schema } from '@ioc:Adonis/Core/Validator'

Route.post('posts', async ({ request }) => {
  /**
   * Schema definition
   */
  const newPostSchema = schema.create({
    title: schema.string({ trim: true }),
    body: schema.string({ escape: true }),
    categories: schema.array().members(schema.number()),
  })

  /**
   * Validate request body against schema
   */
  const payload = await request.validate({ schema: newPostSchema })
})
```

The validator also **extracts the static types** from the schema definition. Meaning, you get the runtime validations along with the static type safety from a single schema definition.

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1611685370/v5/validator-static-types.jpg)

## Built with HTTP in mind
