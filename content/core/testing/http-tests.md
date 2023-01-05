AdonisJS ships with the Japa [API client](https://japa.dev/plugins/api-client) plugin. You can use it to test your application HTTP endpoints.

The primary use case for the API client is to test JSON responses. However, there are no technical limitations around other response types like HTML, or even plain text.

Tests using the API client to perform outside-in testing should be part of the `functional` test suite.

```sh
node ace make:test functional users/list

# CREATE: tests/functional/users/list.spec.ts
```

```ts
// title: tests/functional/users/list.spec.ts
import { test } from '@japa/runner'

test.group('List users', () => {
  test('get a paginated list of users', async ({ client }) => {
    const response = await client.get('/users')

    console.log(response.body())
  })
})
```

:::note
Please read the [Japa documentation](https://japa.dev/plugins/api-client#making-api-calls) to view all the available methods and assertions. This guide only documents the additional methods added by AdonisJS
:::

## Open API testing
The API client allows you to write assertions against your OpenAPI spec. 

Keep the spec YAML or JSON file inside the project root and register it within the `tests/boostrap.ts` file.

```ts
// title: tests/bootstrap.ts
export const plugins: Config['plugins'] = [
  // highlight-start
  assert({
    openApi: {
      schemas: [Application.makePath('api-spec.yml')],
    },
  }),
  // highlight-end
  runFailedTests(),
  apiClient(),
]
```

Once the schema is registered, you can make use of the `response.assertAgainstApiSpec` method to assert against the API spec.

```ts
test('get a paginated list of existing posts', async ({ client }) => {
  const response = await client.get('/posts')
  response.assertAgainstApiSpec()
})
```

- The assertion will use the **request method**, the **endpoint** and **response status code** to find the expected response schema.
- The actual response body is validated against the matching schema. 

Do note, only the shape of the response is tested and not the actual values. Therefore, you may have to write additonal assertions. For example:

```ts
// Assert that response is as per the schema
response.assertAgainstApiSpec()

// Assert for expected values
response.assertBodyContains({
  data: [{ title: 'Adonis 101' }, { title: 'Lucid 101' }]
})
```

## Cookies
You can read/write cookies during the request. The cookies are automatically signed during the request and converted to plain text in the response.

In the following example, a `user_preferences` cookie is sent to the server.

```ts
await client
  .get('/users')
  .cookie('user_preferences', { limit: 10 })
```

You can also read the cookies set by the server using the `response.cookies()` method.

```ts
const response = await client.get('/users')

console.log(response.cookies())
console.log(response.cookie('user_preferences'))

response.assertCookie('user_preferences')
```

### Encrypted cookies
By default the cookies are signed and unsigned during a request. You can make use of the `encryptedCookie` method to send encrypted cookies to the server.

```ts
await client
  .client('/users')
  .encryptedCookie('user_preferences', { limit: 10 })
```

### Plain cookies
You can also send plain cookies (base64 encoded) to the server using the `plainCookie` method.

```ts
await client
  .client('/users')
  .plainCookie('user_preferences', { limit: 10 })
```

## Session
The `@adonisjs/session` package extends the API client by providing additional methods to read/write session data during the request.

Sessions must use the `memory` driver during tests. Therefore, make sure to update the `SESSION_DRIVER` within the `.env.test` file.

```dotenv
// title: .env.test
SESSION_DRIVER=memory
```

### Writing session values

You can set the session data during the request using the `session` method. The session values will accessible by the server.

```ts
await client.get('/').session({ user_id: 1 })
```

Also, you can set the flash messages using the `flashMessages` method.

```ts
await client.get('/').flashMessages({
  errors: {
    title: ['Post title is required']
  }
})
```

### Reading session values
You can read the session data set by the server using the `session` method on the response object.

```ts
const response = await client.get('/')
console.log(response.session())
```

The flash messages can be accessed using the `flashMessages` method.

```ts
const response = await client.get('/')
console.log(response.flashMessages())
```

You can dump the session data to the console using the `dumpSession` method.

```ts
const response = await client.get('/')

// writes to the console
response.dumpSession()
```

## CSRF token
You can pass a CSRF token to the HTTP request by calling the `withCsrfToken` method on the request object. The method will set the CSRF secret session and passes the token inside the `x-csrf-token` header.

:::note
Ensure you have the `@adonisjs/session` package installed as CSRF secrets rely on the session storage. Also, the `SESSION_DRIVER` should be set to `memory` during testing.
:::

```ts
await client.post('/comments').withCsrfToken()
```

## Authentication
The `@adonisjs/auth` package extends the API client and adds the `loginAs` method you can use to login as a certain user when making the request.

The method accepts an instance of the user object to login with.

```ts
const user = await User.find(1)
await client.get('/posts').loginAs(user)
```

You can also specify the Auth guard to use when authenticating the user. The web guard will create the session, whereas the API tokens guard will generate a token and set it as the header.

```ts
const user = await User.find(1)

await client.get('/posts')
  .guard('api')
  .loginAs(user)
```

For basic authentication, you can use the `basicAuth` method. It accepts the user login credentials as arguments. Make sure you pass the plain password (not hashed) to the `basicAuth` method.

```ts
await client.get('/posts').basicAuth('email', 'password')
```

## File uploads
AdonisJS offers a great testing experience when dealing with file uploads. You can generate in-memory dummy files and fake the Drive implementation to not persist any files during tests.

Lets assume you want to test that a user can update their avatar with a valid image file under a certain size. Now, instead of keeping images of different sizes inside your project, you can use the AdonisJS `file` helpers to generate an in-memory image.

Similarly, instead of storing the user uploaded files on the disk or s3. You can call `Drive.fake()` method to collect user uploaded files within memory and write assertions against them.

Let's see how all this works in practice.

```ts
import { test } from '@japa/runner'
// highlight-start
import Drive from '@ioc:Adonis/Core/Drive'
import { file } from '@ioc:Adonis/Core/Helpers'
// highlight-end

test('a user can update avatar', async ({ client, assert }) => {
  // highlight-start
  /**
   * After this the server code using Drive
   * will not write any files on the disk
   */
  const fakeDrive = Drive.fake()

  /**
   * Creating a fake file to upload
   */
  const fakeAvatar = await file.generatePng('1mb')
  // highlight-end

  await client
    .put(`/me`)
    .loginAs(user)
    // highlight-start
    .file('avatar', fakeAvatar.contents, { filename: fakeAvatar.name })
    // highlight-end

  // highlight-start
  /**
   * Assert the file was uploaded successfully
   */
  assert.isTrue(await fakeDrive.exists(fakeAvatar.name))

  /**
   * Restore the Drive fake
   */
  Drive.restore()
  // highlight-end
})
```

## Additional assertions
You can validate the server response using the assertions available on the `response` object.

AdonisJS provides the following additional methods on top of the existing [Japa assertions](https://japa.dev/plugins/api-client#assertions-api).

### assertSession
Assert the given session exists. Optionally, you can also assert the session value.

```ts
response.assertSession('foo')

/**
 * Two assertions are executed under the hood
 * when the value is provided
 */
response.assertSession('foo', 'bar')
```

### assertSessionMissing
Assert the session does not exist in the response.

```ts
response.assertSessionMissing('foo')
```

### assertFlashMessage
Assert the given flash message exists. Optionally, you can also assert for a specific value.

```ts
response.assertFlashMessage('errors')

/**
 * Two assertions are executed under the hood
 * when the value is provided
 */
response.assertFlashMessage('errors', [
  {
    title: ['Post title is required']
  }
])
```

### assertFlashMissing
Assert the flash message does not exist in the response.

```ts
response.assertFlashMissing('success')
```
