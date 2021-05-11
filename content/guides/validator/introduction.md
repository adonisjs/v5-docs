---
summary: Introduction for the AdonisJS schema based validator
---

AdonisJS has first-class support for **parsing** and **validating** the request body, and there is no need to install any 3rd party packages for the same. Just define the validation schema and validate the request body against it.

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

## Schema composition
The schema definition is divided into three main parts.

- The `schema.create` methods defines the shape of the data you expect.
- The `schema.string`, `schema.number` and other similar methods defines the data type for an individual field.
- Finally, you use the `rules` object to apply additional validation constraints on a given field. For example: Validating a string to be a valid email and is unique inside the database.

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1617601990/v5/schema-101.png)

:::note
The `rules` object is imported from `@ioc:Adonis/Core/Validator`

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'
```
:::

If you look carefully, we have separated the **format validations** from **core data types**. For example: There is no data type called `schema.email`, instead we use the `rules.email` method to ensure a string is formatted as an email.

This separation helps a lot in extending the validator with custom rules, without creating unnecessary schema types that has no meaning. For example: There is no thing called **email type**, it is a just a string, formatted as an email.

### Marking fields as optional
 
The schema properties are required by default. However, you can mark them as optional by chaining the `optional` method. The optional variant is available for all the schema types.

```ts
schema.create({
  username: schema.string.optional(),
  password: schema.string.optional()
})
```

### Validating nested objects/arrays
You can validate nested objects and arrays using the [schema.array]() and [schema.object]() methods.

```ts
schema.create({
  user: schema
    .object()
    .members({
      username: schema.string(),
    }),

  tags: schema
    .array()
    .members(schema.string())
})
```

## Validating HTTP requests
You can validate the request body for a given HTTP request using the `request.validate` method. In case of a failure, the `validate` method will raise an exception.

```ts
import Route from '@ioc:Adonis/Core/Route'
import { schema } from '@ioc:Adonis/Core/Validator'

Route.post('users', async ({ request, response }) => {
  const newUserSchema = schema.create({
    // ... define schema
  })

  // highlight-start
  try {
    const payload = await request.validate({
      schema: newUserSchema
    })
  } catch (error) {
    response.badRequest(error.messages)
  }
  // highlight-end
})
```

We recommend **NOT self handling** the exception and let AdonisJS [convert the exception](https://github.com/adonisjs/validator/blob/develop/src/ValidationException/index.ts#L25-L49) to a response using content negotiation.

Following is an explanation on how content negotiation works.

### Server rendered app

If you are building a standard web application with server side templating, then we will redirect the client back to the form and pass the errors as session flash messages.

Following is the structure of error messages inside the session's flash store.

```ts
{
  errors: {
    username: ['username is required']
  }
}
```

You can access them using `flashMessages` global helper.

```edge
@if(flashMessages.has('errors.username'))
  <p> {{ flashMessages.get('errors.username') }} </p>
@end
```

### Requests with `Accept=application/json` header
Requests negotiating for the JSON data type receives the error messages as an array of objects. Each error message contains the **field name**, the failed **validation rule** and the **error message**.

```ts
{
  errors: [
    {
      field: 'title',
      rule: 'required',
      message: 'required validation failed',
    },
  ]
}
```

### JSON API
Requests negotiating using `Accept=application/vnd.api+json` header, recieves the error messages as per the [JSON API spec](https://jsonapi.org/format/#errors).

```ts
{
  errors: [
    {
      code: 'required',
      source: {
        pointer: 'title',
      },
      title: 'required validation failed'
    }
  ]
}
```

## Standalone validator usage
You can also use the validator outside of an HTTP request by importing the `validate` method from the Validator module. The functional API remains the same, however you will have to manually provide the `data` to validate.

```ts
import { validate, schema } from '@ioc:Adonis/Core/Validator'

await validate({
  schema: schema.create({
    // ... define schema
  }),
  data: {
    email: 'virk@adonisjs.com',
    password: 'secret'
  }
})
```

Also, since you are performing the validation outside of an HTTP request. You will have to self handle the exception and display the errors manually.

## Validator classes
Validator classes allows you extract the inline schema from your controllers and move them to a dedicated class.

You can create a new validator by executing the following ace command.

```sh
node ace make:validator CreateUser

# CREATE: app/Validators/CreateUser.ts
```

All the validation related properties including the `schema`, `messages` are defined as properties on the class.

```ts
// title: app/Validators/CreateUser.ts
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateUser {
  constructor (protected ctx: HttpContextContract) {
  }

  public schema = schema.create({
  })

  public messages = {}
}
```

### Using validator

Instead of passing an object with the `schema` property, you can now pass the class constructor to the `request.validate` method.

```ts
import Route from '@ioc:Adonis/Core/Route'
// highlight-start
import CreateUser from 'App/Validators/CreateUser'
// highlight-end

Route.post('users', async ({ request, response }) => {
  // highlight-start
  await request.validate(CreateUser)
  // highlight-end
})
```

During validation, a new instance of the validator class is created behind scenes. Also, the `request.validate` method will pass the current HTTP context as first constructor argument.

You can also manually construct the class instance and pass any arguments you like. For example:

```ts
Route.post('users', async ({ request, response }) => {
  await request.validate(
    new CreateUser({
      countries: fetchAllowedCountries(),
      states: fetchAllowedStates()
    })
  )
})
```

Following is an example of using the validator classes outside of the HTTP request.

```ts
import { validate } from '@ioc:Adonis/Core/Validator'
import CreateUser from 'App/Validators/CreateUser'

await validator.validate(
  new CreateUser({
    countries: fetchAllowedCountries(),
    states: fetchAllowedStates()
  })
)
```

## What's next?

- Read the blog post on validating API requests.
- Read the blog post on validating server rendered forms.
- Learn more about [custom messages](./custom-messages.md).
- Learn more about [error reporters](./error-reporters.md).
- View all the [available schema types](../../reference/validator/schema/string.md).
- View all the [available validation rules](../../reference/validator/rules/alpha.md).
