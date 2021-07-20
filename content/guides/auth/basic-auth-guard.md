---
summary: Authenticate requests using HTTP Basic authentication
---

The basic auth guard uses the [HTTP basic authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#basic_authentication_scheme) for authenticating the requests.

There is no concept of **explicit login and logout** with basic auth. The credentials for authentication are sent on every request and you can validate them using the `auth.authenticate` method.

- If the user credentials are incorrect, then the auth package will deny the request with `WWW-Authenticate` header.
- If the credentials are correct, then you will be able to access the logged in user details.

:::note

The basic auth guard relies on the underlying user provider to lookup and validate the user credentials

:::

```ts
import Route from '@ioc:Adonis/Core/Route'

Route
  .get('posts', async ({ auth }) => {
    await auth.use('basic').authenticate()

    return `You are logged in as ${auth.user!.email}`
  })
```

You can also make use of the [auth middleware](./middleware.md) to guard routes using the basic auth guard.

```ts
import Route from '@ioc:Adonis/Core/Route'

Route
  .get('posts', async ({ auth }) => {
    return `You are logged in as ${auth.user!.email}`
  })
  .middleware('auth', { guards: ['basic'] })
```
