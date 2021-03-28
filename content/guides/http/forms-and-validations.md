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

## Creating the form

:::showcase

The final example is hosted on codesandbox. [Click here](https://6zhxz.sse.codesandbox.io/posts/create) to preview the outcome or [edit the project](https://codesandbox.io/s/adonisv5-basic-form-validation-6zhxz) directly on codesandbox.

:::

AdonisJS does not interfere with your HTML, and you define the forms using the standard HTML syntax. In other words, AdonisJS doesn't have any form builders doing magic behind the scenes, and hence you have the complete freedom to structure the HTML the way you want.

The following is the HTML form to create a new blog post by accepting the post **title** and **body**.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Create a new blog post</title>
  </head>
  <body>
    <form action="/posts" method="POST">
      <div>
        <p>
          <label for="title"> Post title </label>
        </p>

        <input type="text" name="title" />
      </div>

      <div>
        <p>
          <label for="body"> Post body </label>
        </p>

        <textarea name="body" cols="30" rows="10"></textarea>
      </div>

      <div>
        <button type="submit">Create Post</button>
      </div>
    </form>
  </body>
</html>
```

As you can notice, the entire document is vanilla HTML with no special syntax inside it. As a small improvement, you can replace the hard-coded form action `/posts` with a helper method `route`.

Assuming the following route declarations.

```ts
import Route from '@ioc:Adonis/Core/Route'

Route.get('posts/create', 'PostsController.create')
Route.post('posts', 'PostsController.store')
```

You can get the route URL for storing a new post using its `controller.action` name.

```edge
// delete-start
<form action="/posts" method="POST">
// delete-end
// insert-start
<form action="{{ route('PostsController.store') }}" method="POST">
// insert-end
 <!-- Rest of the form -->
</form>
```

### Why use the route helper?

If you were to change the route URL inside the routes file, you would have to remember to change the form action. On the other hand, the [route helper]() automates this process for you, resulting in more maintainable code.

## Validating the form

Let's continue with the same form we created above and implement the `PostsController.store` method to validate the incoming request.

```ts
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class PostsController {
  public async store({ request }: HttpContextContract) {
    const postSchema = schema.create({
      title: schema.string(),
      body: schema.string(),
    })

    const payload = await request.validate({ schema: postSchema })
    console.log(payload)

    return 'Post created'
  }
}
```

#### schema.create

The `schema.create` method creates a new schema definition. You always begin by creating a new schema.

#### schema.string

The `schema.string` method enforces the value to be a valid string. There are other methods to enforce different data types like `schema.boolean`, `schema.number`, etc.

#### request.validate

The `request.validate` method accepts the pre-defined schema and validates the request body against it.

If the validation fails, the validator will **redirect the client back** to the form along with the error messages and the form values.

If the validation succeeds, the next line of code _(`console.log(data)` in this case)_ will be executed.

## Displaying validation errors

Upon validation failure, the user is redirected back to the form, along with the **error messages** and the **form data** inside the [session flash messages](./session.md#flash-messages).

Inside the edge templates, you can access the flash messages using the `flashMessages` global property.

#### Errors structure inside flash messages

```ts
{
  errors: {
    title: ['required validation failed'],
    body: ['required validation failed'],
  }
}
```

#### Access error messages

```edge
{{ flashMessages.get('errors.title') }}
{{ flashMessages.get('errors.body') }}
```

#### Form data structure inside flash messages

```ts
{
  title: 'Hello world',
}
```

#### Access form data

```edge
<input
  type="text"
  name="title"
  value="{{ flashMessages.get('title', '') }}"
/>
```

## Custom validation messages

You can define custom messages for validation errors by passing a `messages` object to the `request.validate` method. For example:

```ts{app/Controllers/Http/PostsController.ts}
const payload = await request.validate({
  schema: postSchema,

 // highlight-start
  messages: {
    'title.required': 'Enter the post title',
    'body.required': 'Write some content for the post',
  },
 // highlight-end
})
```

You can define the custom messages just for the `rule` name or be more specific by combining the `field.rule` name. Make sure to also read the dedicated guide on validator [custom messages](../validator/custom-messages.md).

## Success message

The usage of flash messages is not only limited to the validation errors. You can also use them to display the success message post form submission. For example:

```ts{Controller}
import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PostsController {
  // Create method

  // delete-start
  public async store({ request }: HttpContextContract) {
  // delete-end
  // insert-start
  public async store({ request, session }: HttpContextContract) {
  // insert-end

    // ... Collpased existing code
    console.log(payload)

    // delete-start
    return 'Post created'
    // delete-end
    // insert-start
    session.flash('success', 'Post created successfully')
    response.redirect().back()
    // insert-end
  }
}
```

#### Access the success message inside edge template

```edge
@if(flashMessages.has('success'))
 <p>{{ flashMessages.get('success') }}</p>
@endif
```

## Validation errors for JSON responses

So far in this guide, we have covered the use case of accessing the error messages inside the Edge templates via flash messages. However, this is not the only way to access the error messages. In fact, this is not even the default way.

The validator uses [content negotiation](./request.md#content-negotiation) for choosing the appropriate response type.

- For standard HTML-based form submissions, the user gets redirected back to the form along with the error messages inside the session flash store.
- HTTP requests with `Accept=application/json` header receives the validation errors in the JSON format, as shown below.

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

- HTTP requests with `Accept=application/vnd.api+json` header, receives the error messages as per the [JSON API spec](https://jsonapi.org/format/#errors).

## Form method spoofing

Standard HTML forms cannot make use of all the HTTP verbs beyond `GET` and `POST`. It means you cannot create a form with the method `PUT`.

However, AdonisJS allows you to spoof the HTTP method using the `_method` query string. In the following example, the request will be routed to the route listening for the `PUT` request.

```html
<form method="POST" action="/posts/1?_method=PUT"></form>
```

Form method spoofing only works:

- When the value of `http.allowMethodSpoofing` is set to true inside the `config/app.ts` file.
- And the original request method is `POST`.
