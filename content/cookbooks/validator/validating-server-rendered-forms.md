---
datetime: 2020-05-05
author: Virk
avatarUrl: https://res.cloudinary.com/adonis-js/image/upload/v1619103621/adonisjs-authors-avatars/DYO4KUru_400x400_shujhw.jpg
summary: Validating server rendered forms using the AdonisJS validator
---

This guide covers the usage of validator to validate the forms rendered on the server using Edge templates. We will use using [session flash messages](../../guides/http/session.md#session-flash-messages) to access the validator errors.

## Creating the form

:::note

The final example is hosted on codesandbox. [Click here](https://6zhxz.sse.codesandbox.io/posts/create) to preview the outcome or [edit the project](https://codesandbox.io/s/adonisv5-basic-form-validation-6zhxz) directly on codesandbox.

:::

AdonisJS does not interfere with your HTML and you define the forms using the standard HTML syntax. In other words, AdonisJS doesn't have any form builders doing magic behind the scenes, and hence you have the complete freedom to structure the HTML the way you want.

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

As you can notice, the entire document is vanilla HTML with no special syntax inside it. As a small improvement, you can replace the hard-coded form action `/posts` with the [route helper](../../guides/http/routing.md#url-generation) method.

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

## Validating the form

Let's continue with the same form we created above and implement the `PostsController.store` method to validate the incoming request.

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class PostsController {
  public async store({ request }: HttpContextContract) {
    const postSchema = schema.create({
      title: schema.string({ trim: true }, [
        rules.minLength(10)
      ]),
      body: schema.string(),
    })

    const payload = await request.validate({ schema: postSchema })
    console.log(payload)

    return 'Post created'
  }
}
```

#### schema.create

The `schema.create` method creates a new schema definition. The schema defines the shape of the data you expect.

---

#### schema.string

The `schema.string` method enforces the value to be a valid string. There are other similar methods to enforce different data types like a boolean, a number and so on.

Optionally, you can define additional validations on a property using the `rules` object.

---

#### request.validate

The `request.validate` method accepts the pre-defined schema and validates the request body against it.

If the validation fails, the validator will **redirect the client back** to the form along with the error messages and the form values.

If the validation succeeds, you can access the validated properties as the method return value.

## Displaying validation errors

The validation errors are shared with the form using [session flash messages](../../guides/http/session.md#flash-messages). Inside your edge templates, you can access them using the `flashMessages` global property.

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

## Retaining input values
Post redirect, the browser re-renders the page and the form values are reset to their initial state. However, you can access the submitted values using flash messages.

You can access the form input values using the field name. For example:

```edge
<div>
  <p>
    <label for="title"> Post title </label>
  </p>

  // highlight-start
  <input
    type="text"
    name="title"
    value="{{ flashMessages.get('title', '') }}"
  />
  // highlight-end
</div>
```

You can also nested values using the field name

```edge
<input
  type="text"
  name="user[email]"
  value="{{ flashMessages.get('user[email]', '') }}"
/>
```

## Displaying success message

The usage of flash messages is not only limited to the validation errors. You can also use them to display the success message post form submission. For example:

```ts
// title: Controller
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PostsController {
  // Create method

  // delete-start
  public async store({ request }: HttpContextContract) {
  // delete-end
  // insert-start
  public async store({ request, session, response }: HttpContextContract) {
  // insert-end

    // ... Collapsed existing code
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

## Form method spoofing

Standard HTML forms cannot make use of all the HTTP verbs beyond `GET` and `POST`. It means you cannot create a form with the method `PUT`.

However, AdonisJS allows you to spoof the HTTP method using the `_method` query string. In the following example, the request will be routed to the route listening for the `PUT` request.

```html
<form method="POST" action="/posts/1?_method=PUT"></form>
```

Form method spoofing only works:

- When the value of `http.allowMethodSpoofing` is set to true inside the `config/app.ts` file.
- And the original request method is `POST`.
