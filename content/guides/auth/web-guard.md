---
summary: Authenticate requests using session and cookies
---

The web guard uses sessions/cookies to login a user. You must use the web guard when **creating a server rendered application**, or for **an API having a first-party client running on the same domain/sub-domain**.

:::note

The web guard relies on the `@adonisjs/session` package. Make sure to install and [configure](../http/session.md) it first.

:::

## Login
You can login the user using the `auth.attempt` or the `auth.login` method. The `auth.attempt` method lookup the user from the database and verifies their password.

- If the user credentials are correct, it will internally call the `auth.login` method and create the session.
- Otherwise an [InvalidCredentialsException](https://github.com/adonisjs/auth/blob/develop/src/Exceptions/InvalidCredentialsException.ts) is raised.

```ts
import Route from '@ioc:Adonis/Core/Route'

Route.post('login', async ({ auth, request, response }) => {
  const email = request.input('email')
  const password = request.input('password')

  try {
    // highlight-start
    await auth.use('web').attempt(email, password)
    response.redirect('/dashboard')
    // highlight-end
  } catch {
    return response.badRequest('Invalid credentials')
  }
})
```

You can either manually handle the exception and return a response, or let the exception handle itself and create a response using [content negotiation](https://github.com/adonisjs/auth/blob/develop/src/Exceptions/InvalidCredentialsException.ts#L87-L105).

---

### auth.login
If the `auth.attempt` lookup strategy does not fit your use case, then you can manually lookup the user, verify their password and call the `auth.login` method to create a session for them.

```ts
import User from 'App/Models/User'
import Route from '@ioc:Adonis/Core/Route'
import Hash from '@ioc:Adonis/Core/Hash'

Route.post('login', async ({ auth, request, response }) => {
  const email = request.input('email')
  const password = request.input('password')

  // Lookup user manually
  const user = await User
    .query()
    .where('email', email)
    .where('tenant_id', getTenantIdFromSomewhere)
    .whereNull('is_deleted')
    .firstOrFail()

  // Verify password
  if (!(await Hash.verify(user.password, password))) {
    return response.badRequest('Invalid credentials')
  }

  // Create session
  await auth.use('web').login(user)
})
```

---

### auth.loginViaId
Similar to the `auth.login` method, the `loginViaId` method creates the login session for the user using their id.

```ts
// Login user using the id
await auth.use('web').loginViaId(1)
```

---

### Using remember me option
All the login methods `attempt`, `login`, and `loginViaId` accepts a boolean value as the last argument to create a remember me cookie for the logged in user.

```ts
const rememberMe = true

await auth.use('web').attempt(email, password, rememberMe)
await auth.use('web').login(user, rememberMe)
await auth.use('web').loginViaId(1, rememberMe)
```

If the user session expires, the remember me cookie will be used to create another session for the user. The remember me token is stored inside the `users` table itself and currently only one remember me token is allowed.

## Authenticate subsequent requests
Once the user is logged-in with the login session, you can authenticate the subsequent requests using the `auth.authenticate` method. It will verify the user session and lookup the user inside the database.

The [AuthenticationException](https://github.com/adonisjs/auth/blob/develop/src/Exceptions/AuthenticationException.ts) is raised, if the session is invalid or the user does not exists inside the database.

Otherwise, you can access the logged-in user using the `auth.user` property.

```ts
import Route from '@ioc:Adonis/Core/Route'

Route.get('dashboard', async ({ auth }) => {
  await auth.use('web').authenticate()
  console.log(auth.use('web').user!)
})
```

Calling this method manually inside every single route is not practical and hence you can make use of the auth middleware stored inside the `./app/Middleware/Auth.ts` file.

<div class="doc-cta-wrapper">

[Learn more about the auth middleware →](./middleware.md)

</div>

## Logout
You can logout the user by calling the `auth.logout` method. It will destroy the user login session and the remember me cookie. The remember me token inside the `users` is also set to null.

```ts
import Route from '@ioc:Adonis/Core/Route'

Route.post('/logout', async ({ auth, response }) => {
  await auth.use('web').logout()
  response.redirect('/login')
})
```

## Other methods/properties
Following is the list of available methods/properties available for the `web` guard.

### viaRemember
Find it the current request is authenticated using the remember token or not. This is will be set to `true` when:

- You initially logged in the user with the remember me token.
- The login session has expired during the current request and the remember me cookie was present and valid to login the user.

```ts
auth.use('web').viaRemember
```

---

### isLoggedOut
Find if the user has been logged out during the current request. The value will be `true` right after calling the `auth.logout` method.

```ts
await auth.use('web').logout()

auth.use('web').isLoggedOut
```

---

### isLoggedIn
Find if user is logged in or not. The value is `true` right after calling the `auth.login` method or when the `auth.authenticate` check passes.

```ts
await auth.use('web').authenticate()
auth.use('web').isLoggedIn // true
```

```ts
await auth.use('web').attempt(email, password)
auth.use('web').isLoggedIn // true
```

---

### isGuest
Find if the user is a guest (meaning not logged in). The value is always the opposite of the `isLoggedIn` flag.

---

### isAuthenticated
Find if the current request has passed the authentication check. This flag is different from the `isLoggedIn` flag and not set to true during the `auth.login` call.


```ts
await auth.use('web').authenticate()
auth.use('web').isAuthenticated // true
```

```ts
await auth.use('web').attempt(email, password)
auth.use('web').isAuthenticated // false
```

---

### authenticationAttempted
Find if an attempt to authenticate the current request has been made. The value is set to `true` when you call the `auth.authenticate` method

```ts
auth.use('web').authenticationAttempted // false

await auth.use('web').authenticate()
auth.use('web').authenticationAttempted // true
```

---

### provider
Reference to the underlying user provider used by the guard.

---

### verifyCredentials
A method to verify the user credentials. The `auth.attempt` method uses this method under the hood. The [InvalidCredentialsException](https://github.com/adonisjs/auth/blob/develop/src/Exceptions/InvalidCredentialsException.ts) exception is raised when the credentials are invalid.

```ts
try {
  await auth.use('web').verifyCredentials(email, password)
} catch (error) {
  console.log(error)
}
```

---

### check
The method is same as the `auth.authenticate` method. However, it does not raise any exception when the request is not authenticated. Think of it as an optional attempt to check if the user is logged in or not.

```ts
await auth.use('web').check()

if (auth.use('web').isLoggedIn) {
}
```
