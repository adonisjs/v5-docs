---
summary: Introduction for the AdonisJS schema-based validator
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
    title: schema.string(),
    body: schema.string(),
    categories: schema.array().members(schema.number()),
  })

  /**
   * Validate request body against the schema
   */
  const payload = await request.validate({ schema: newPostSchema })
})
```

The validator also **extracts the static types** from the schema definition. You get the runtime validations and the static type safety from a single schema definition.

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1611685370/v5/validator-static-types.jpg)

## Schema composition
The schema definition is divided into three main parts.

- The `schema.create` method defines the shape of the data you expect.
- The `schema.string`, `schema.number`, and other similar methods define the data type for an individual field.
- Finally, you use the `rules` object to apply additional validation constraints on a given field. For example: Validating a string to be a valid email is unique inside the database.

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1617601990/v5/schema-101.png)

:::note
The `rules` object is imported from `@ioc:Adonis/Core/Validator`

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'
```
:::

If you look carefully, we have separated the **format validations** from **core data types**. So, for example, there is no data type called `schema.email`. Instead, we use the `rules.email` method to ensure a string is formatted as an email.

This separation helps extend the validator with custom rules without creating unnecessary schema types that have no meaning. For example, there is no thing called **email type**; it is just a string, formatted as an email.

## Working with optional and null values
All the fields are **required** by default. However, you can make use of the `optional`, `nullable`, and `nullableAndOptional` modifiers to mark fields as optional.

All of these modifiers serve different purposes. Let's take a closer look at them.

| Modifier | Validation behavior | Return payload |
|------------|---------------------|---------------|
| `optional` | Allows both `null` and `undefined` values to exist | Removes the key from the return payload is not is non-existing |
| `nullable` | Allows `null` values to exists. However, the field must be defined in the validation data | Returns the field value including null. |
| `nullableAndOptional` | Allows both `null` and `undefined` values to exist. (Same as modifier 1) | Only removes the key when the value is undefined, otherwise returns the field value |

### Use case for `nullable` modifier

You will often find yourself using the `nullable` modifier to allow optional fields within your application forms. 

In the following example, when the user submits an empty value for the `fullName` field, the server will receive `null,` and hence you can update their existing full name inside the database to null.

```ts
schema: schema.create({
  fullName: schema.string.nullable(),
})
```

### Use case for `nullableAndOptional` modifier

If you create an API server that accepts PATCH requests and allows the client to update a portion of a resource, you must use the `nullableAndOptional` modifier.

In the following example, if the `fullName` is undefined, you can assume that the client does not want to update this property, and if it is `null`, they want to set the property value of `null`.

```ts
const payload = await request.validate({
  schema: schema.create({
    fullName: schema.string.nullableAndOptional(),
  })
})

const user = await User.findOrFail(1)
user.merge(payload)
await user.save()
```

### Use case for `optional` modifier
The `optional` modifier is helpful if you want to update a portion of a resource without any optional fields.

The `email` property may or may not exist in the following example. But the user cannot set it `null`. If the property is not in the request, you will not update the email.

```ts
const payload = await request.validate({
  schema: schema.create({
    email: schema.string.optional(),
  })
})

const user = await User.findOrFail(1)
user.merge(payload)
await user.save()
```

## Validating HTTP requests
You can validate the request body, query-string, and route parameters for a given HTTP request using the `request.validate` method. In case of a failure, the `validate` method will raise an exception.

```ts
import Route from '@ioc:Adonis/Core/Route'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

Route.post('users', async ({ request, response }) => {
  /**
   * Step 1 - Define schema
   */
  const newUserSchema = schema.create({
    username: schema.string(),
    email: schema.string([
      rules.email()
    ]),
    password: schema.string([
      rules.confirmed(),
      rules.minLength(4)
    ])
  })

  try {
    /**
     * Step 2 - Validate request body against
     *          the schema
     */
    const payload = await request.validate({
      schema: newUserSchema
    })
  } catch (error) {
    /**
     * Step 3 - Handle errors
     */
    response.badRequest(error.messages)
  }
})
```

We recommend **NOT self-handling** the exception and let AdonisJS [convert the exception](https://github.com/adonisjs/validator/blob/develop/src/ValidationException/index.ts#L25-L49) to a response using content negotiation.

Following is an explanation of how content negotiation works.

### Server rendered app

If you build a standard web application with server-side templating, we will redirect the client back to the form and pass the errors as session flash messages.

Following is the structure of error messages inside the session's flash store.

```ts
{
  errors: {
    username: ['username is required']
  }
}
```

You can access them using the `flashMessages` global helper.

```edge
@if(flashMessages.has('errors.username'))
  <p> {{ flashMessages.get('errors.username') }} </p>
@end
```

### Requests with `Accept=application/json` header
Requests negotiating for the JSON data type receive the error messages as an array of objects. Each error message contains the **field name**, the failed **validation rule**, and the **error message**.

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
Requests negotiating using `Accept=application/vnd.api+json` header, receives the error messages as per the [JSON API spec](https://jsonapi.org/format/#errors).

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
You can also use the validator outside of an HTTP request by importing the `validate` method from the Validator module. The functional API remains the same. However, you will have to manually provide the `data` to validate.

```ts
import { validator, schema } from '@ioc:Adonis/Core/Validator'

await validator.validate({
  schema: schema.create({
    // ... define schema
  }),
  data: {
    email: 'virk@adonisjs.com',
    password: 'secret'
  }
})
```

Also, since you perform the validation outside of an HTTP request, you will have to handle the exception and display the errors manually.

## Validator classes
Validator classes allow you to extract the inline schema from your controllers and move them to a dedicated class.

You can create a new validator by executing the following Ace command.

```sh
node ace make:validator CreateUser

# CREATE: app/Validators/CreateUserValidator.ts
```

All the validation related properties, including the `schema`, `messages` are defined as properties on the class.

```ts
// title: app/Validators/CreateUserValidator.ts
import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateUserValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public schema = schema.create({
  })

  public messages: CustomMessages = {}
}
```

### Using validator

Instead of passing an object with the `schema` property, you can now pass the class constructor to the `request.validate` method.

```ts
import Route from '@ioc:Adonis/Core/Route'
// highlight-start
import CreateUser from 'App/Validators/CreateUserValidator'
// highlight-end

Route.post('users', async ({ request, response }) => {
  // highlight-start
  const payload = await request.validate(CreateUser)
  // highlight-end
})
```

During validation, a new instance of the validator class is created behind the scenes. Also, the `request.validate` method will pass the current HTTP context as a first constructor argument.

You can also manually construct the class instance and pass any arguments you like. For example:

```ts
Route.post('users', async ({ request, response }) => {
  const payload = await request.validate(
    new CreateUser({
      countries: fetchAllowedCountries(),
      states: fetchAllowedStates()
    })
  )
})
```

Following is an example of using the validator classes outside of the HTTP request.

```ts
import { validator } from '@ioc:Adonis/Core/Validator'
import CreateUser from 'App/Validators/CreateUserValidator'

await validator.validate(
  new CreateUser({
    countries: fetchAllowedCountries(),
    states: fetchAllowedStates()
  })
)
```

## What's next?

- Read the cookbook on [validating server rendered forms](../../cookbooks/validator/validating-server-rendered-forms.md)
- Learn more about [custom messages](./custom-messages.md)
- Learn more about [error reporters](./error-reporters.md)
- View all the [available schema types](../../reference/validator/schema/string.md)
- View all the [available validation rules](../../reference/validator/rules/alpha.md)
