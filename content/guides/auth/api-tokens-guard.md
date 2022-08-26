---
summary: Authenticate requests using Opaque access tokens
---

The API guard uses the database-backed **opaque access token** to authenticate the user requests. You may want to use the API guard when creating an API that should be accessed by a third-party client, or for any other system that does not support cookies.

## Tokens storage
The API tokens guard allows you store tokens either in a SQL database or store them inside Redis. Both the storage options have their own use cases.

### SQL storage
The SQL storage method is suitable when API tokens are not the primary mode of authentication. For example: You may want to allow the users of your application to create personal access tokens (just like the way GitHub does) and authenticate the API requests using that.

In this scenario, you will not generate too many tokens in bulk and also most of the tokens will live forever.

Configuration for tokens is managed inside the `config/auth.ts` file under the guard config object.

```ts
{
  api: {
    driver: 'oat',
    provider: {
      driver: 'lucid',
      identifierKey: 'id',
      uids: ['email'],
      model: () => import('App/Models/User'),
    },
    // highlight-start
    tokenProvider: {
      type: 'api',
      driver: 'database',
      table: 'api_tokens',
      foreignKey: 'user_id',
    },
    // highlight-end
  }
}
```

#### type
The type property holds the type of the token you are generating. Make sure to give it a unique name when you have multiple API token guards in use.

The unique name ensures that two guards generating the token for the same user does not have overlap or any conflicts.

---

#### driver
The name of the driver. It will always be `database` when storing the tokens inside a SQL table.

---

#### table
The database table to use for storing the tokens. During the initial setup process, AdonisJS will create the migration file for the tokens table. However, you can also create a migration manually and copy the contents from the [stub file](https://github.com/adonisjs/auth/blob/develop/templates/migrations/api_tokens.txt)

----

#### foreignKey
The foreign key to build the relationship between the user and the token. Later, this will allow you to also list all the tokens for a given user.

---

### Redis storage
The redis storage is suitable when API tokens are the primary mode of authentication. For example: You authenticate the requests from your mobile app using token-based authentication.

In this scenario, you would also want tokens to expire after a given period of time and redis can automatically clear the expired tokens from its storage.

Configuration for tokens is managed inside the `config/auth.ts` file under the guard config object.

```ts
{
  api: {
    driver: 'oat',
    provider: {
      driver: 'lucid',
      identifierKey: 'id',
      uids: ['email'],
      model: () => import('App/Models/User'),
    },
    // highlight-start
    tokenProvider: {
      type: 'api',
      driver: 'redis',
      redisConnection: 'local',
      foreignKey: 'user_id',
    },
    // highlight-end
  }
}
```

#### type
The type property holds the type of the token you are generating. Make sure to give it a unique name when you have multiple API token guards in use.

The unique name ensures that two guards generating the token for the same user does not have overlap or any conflicts.

---

#### driver
The name of the driver. It will always be `redis` when storing the tokens in a redis database.

---

#### redisConnection
Reference to a connection defined inside the `config/redis.ts` file. Make sure to read the [redis guide](../digging-deeper/redis.md) for the initial setup.

----

#### foreignKey
The foreign key to build the relationship between the user and the token.

---

## Generating tokens
You can generate an API token for a user using the `auth.generate` or the `auth.attempt` method. The `auth.attempt` method lookup the user from the database and verifies their password.

- If the user credentials are correct, it will internally call the `auth.generate` method and returns the token.
- Otherwise an [InvalidCredentialsException](https://github.com/adonisjs/auth/blob/develop/src/Exceptions/InvalidCredentialsException.ts) is raised.

```ts
import Route from '@ioc:Adonis/Core/Route'

Route.post('login', async ({ auth, request, response }) => {
  const email = request.input('email')
  const password = request.input('password')

  try {
    // highlight-start
    const token = await auth.use('api').attempt(email, password)
    return token
    // highlight-end
  } catch {
    return response.unauthorized('Invalid credentials')
  }
})
```

You can either manually handle the exception and return a response, or let the exception handle itself and create a response using [content negotiation](https://github.com/adonisjs/auth/blob/develop/src/Exceptions/InvalidCredentialsException.ts#L87-L105).

---

### auth.generate
If the `auth.attempt` lookup strategy does not fit your use case, then you can manually lookup the user, verify their password and call the `auth.generate` method to generate a token for them.

:::note

The `auth.login` method is an alias for the `auth.generate` method.

:::

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
    return response.unauthorized('Invalid credentials')
  }

  // Generate token
  const token = await auth.use('api').generate(user)
})
```

---

### Managing tokens expiry
You can also define the expiry for the token at the time of the generating it.

```ts
await auth.use('api').attempt(email, password, {
  expiresIn: '7 days'
})

await auth.use('api').generate(user, {
  expiresIn: '30 mins'
})
```

The redis driver will automatically delete the expired tokens. However, for SQL storage, you will have write a custom script and delete token with `expires_at` timestamp smaller than today.

## Token properties
Following is the list of properties on the token object generated using the `auth.generate` method.

### type
The token is always set to `'bearer'`.

---

### user
The user for which the token was generated. The value of the user relies on the underlying user provider used by the guard.

---

### expiresAt
An instance of the [luxon Datetime](https://moment.github.io/luxon/api-docs/index.html#datetime) representing a static time at which the token will expire. Only exists, if have explicitly defined the expiry for the token.

---

### expiresIn
Time in seconds after which the token will expire. It is a static value and does not change as the time passes by.

---

### meta
Any meta data attached with the token. You can define the meta data in the options object at the time of generating the token.

:::note

The underlying storage drivers will persist the meta data to the database. In case of SQL, make sure to also create the required columns.

:::

```ts
await auth.use('api').attempt(email, password, {
  ip_address: '192.168.1.0'
})
```

---

### name
The name to associate with the token. This is usually helpful when you allow the users of your application to generate personal access tokens (just like the way GitHub does) and give them a memorable name.

The name property only exists, when you have defined it at the time of generating the token.

```ts
await auth.use('api').attempt(email, password, {
  name: 'For the CLI app'
})
```

---

### token
The value for the generated token. You must share this value with the client and the client must store it securely.

You cannot get access to this value later, as the value stored inside the database is a hash of the token that cannot be converted to a plain value.

---

### tokenHash
The value stored inside the database. Make sure to never share the token hash with the client.

During the `auth.authenticate` request, we will compare the value provided by the client against the token hash.


---

### toJSON
Converts the token to an object that you can send back in response to a request. The `toJSON` method contains the following properties.

```ts
{
  type: 'bearer',
  token: 'the-token-value',
  expires_at: '2021-04-28T17:43:37.235+05:30'
  expires_in: 604800
}
```

## Authenticate subsequent requests
Once the client receives the API token, they must send it back on every HTTP request under the `Authorization` header. The header must be formatted as follows:

```text
Authorization = Bearer TOKEN_VALUE
```

You can verify if the token is valid or not using the `auth.authenticate` method. The [AuthenticationException](https://github.com/adonisjs/auth/blob/develop/src/Exceptions/AuthenticationException.ts) is raised, if the token is invalid or the user does not exists inside the database.

Otherwise, you can access the logged-in user using the `auth.user` property.

```ts
import Route from '@ioc:Adonis/Core/Route'

Route.get('dashboard', async ({ auth }) => {
  await auth.use('api').authenticate()
  console.log(auth.use('api').user!)
})
```

Calling this method manually inside every single route is not practical and hence you can make use of the auth middleware stored inside the `./app/Middleware/Auth.ts` file.

<div class="doc-cta-wrapper">

[Learn more about the auth middleware →](./middleware.md)

</div>

## Revoke tokens
During the logout phase, you can revoke the token by deleting it from the database. The token again must be sent under the `Authorization` header.

The `auth.revoke` method will remove the token sent during the current request from the database.

```ts
import Route from '@ioc:Adonis/Core/Route'

Route.post('/logout', async ({ auth, response }) => {
  await auth.use('api').revoke()
  return {
    revoked: true
  }
})
```

## Other methods/properties
Following is the list of available methods/properties available for the `api` guard.

### isLoggedIn
Find if user is logged in or not. The value is `true` right after calling the `auth.generate` method or when the `auth.authenticate` check passes.

```ts
await auth.use('api').authenticate()
auth.use('api').isLoggedIn // true
```

```ts
await auth.use('api').attempt(email, password)
auth.use('api').isLoggedIn // true
```

---

### isGuest
Find if the user is a guest (meaning not logged in). The value is always the opposite of the `isLoggedIn` flag.

---

### isAuthenticated
Find if the current request has passed the authentication check. This flag is different from the `isLoggedIn` flag and NOT set to true during the `auth.login` call.


```ts
await auth.use('api').authenticate()
auth.use('api').isAuthenticated // true
```

```ts
await auth.use('api').attempt(email, password)
auth.use('api').isAuthenticated // false
```

---

### isLoggedOut
Find if the token was revoked during the current request. The value will be `true` right after calling the `auth.revoke` method.

```ts
await auth.use('api').revoke()
auth.use('api').isLoggedOut
```

---


### authenticationAttempted
Find if an attempt to authenticate the current request has been made. The value is set to `true` when you call the `auth.authenticate` method

```ts
auth.use('api').authenticationAttempted // false

await auth.use('api').authenticate()
auth.use('api').authenticationAttempted // true
```

---

### provider
Reference to the underlying user provider used by the guard.

---

### tokenProvider
Reference to the underlying token provider used by the guard.

---

### verifyCredentials
A method to verify the user credentials. The `auth.attempt` method uses this method under the hood. The [InvalidCredentialsException](https://github.com/adonisjs/auth/blob/develop/src/Exceptions/InvalidCredentialsException.ts) exception is raised when the credentials are invalid.

```ts
try {
  await auth.use('api').verifyCredentials(email, password)
} catch (error) {
  console.log(error)
}
```

---

### check
The method is same as the `auth.authenticate` method. However, it does not raise any exception when the request is not authenticated. Think of it as an optional attempt to check if the token is valid for the current request or not.

```ts
await auth.use('api').check()

if (auth.use('api').isLoggedIn) {
}
```
