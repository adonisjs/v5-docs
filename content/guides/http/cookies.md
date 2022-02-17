---
summary: A reference to reading and writing cookies during the HTTP requests.
---

You work with cookies using the [request](./request.md) and the [response](./response.md) classes. The request class exposes the API for reading the existing cookies, and the response class allows creating, updating and deleting cookies.

```ts
import Route from '@ioc:Adonis/Core/Route'

Route.post('add-to-cart', async ({ request, response }) => {
  /**
   * Read cookie by name
   */
  const existingItems = request.cookie('cart-items', [])

  /**
   * Set/update cookie
   */
  const newItems = existingItems.concat([{ id: 10 }])
  response.cookie('cart-items', newItems)
})

Route.delete('clear-cart', async ({ response }) => {
  /**
   * Clear cookie
   */
  response.clearCookie('cart-items')
})
```

## Cookies configuration

You can tweak the configuration for cookies by modifying the `http.cookie` object inside the `config/app.ts` file.

```ts
// title: config/app.ts
http: {
  cookie: {
    domain: '',
    path: '/',
    maxAge: '2h',
    httpOnly: true,
    secure: false,
    sameSite: false,
  },
}
```

#### domain

Specifies the value for the domain attribute. By default, no domain is set, and most clients will consider the cookie to apply to only the current domain.

---

#### path

Specifies the value for the path attribute. By default, the path is considered the "default path".

---

#### maxAge

Specifies the value for the max-age attribute. The given value will be converted to an integer.

---

#### httpOnly

Specifies the `boolean` value for the httponly attribute. When truthy, the HttpOnly attribute is set. Otherwise, it is not.

---

#### secure

Specifies the `boolean` value for the secure attribute. When truthy, the Secure attribute is set. Otherwise, it is not. By default, the Secure attribute is not set.

---

#### sameSite

Specifies the boolean or string to be the value for the samesite attribute.

  - `true` will set the SameSite attribute to Strict for strict same site enforcement.
  - `false` will not set the SameSite attribute.
  - `'lax'` will set the SameSite attribute to Lax for lax same site enforcement.
  - `'none'` will set the SameSite attribute to None for an explicit cross-site cookie.
  - `'strict'` will set the SameSite attribute to Strict for strict same site enforcement.

The same set of options can also be defined at runtime when setting the cookie. We will merge the inline values with the default config.

```ts
response.cookie('user_id', 1, {
  httpOnly: false,
})
```

## Supported data types

Along with the string values, the following data types are also supported as cookies values.

```ts
// Object
response.cookie('user', {
  id: 1,
  fullName: 'virk',
})

// Array
response.cookie('product_ids', [1, 2, 3, 4])

// Boolean
response.cookie('is_logged_in', true)

// Number
response.cookie('visits', 10)

// Data objects are converted to ISO string
response.cookie('visits', new Date())
```

## Signed cookies

By default, all the cookies set by the `response.cookie` method are signed. Signed cookies contain a signature alongside the cookie value to prevent cookie tampering.

- The signature is computed from the cookie value, and in case of tampering, the signature will mismatch, and AdonisJS will ignore the cookie.
- The signature is generated using the `appKey` stored inside the `config/app.ts` file.
- The signed cookies are still readable by Base64 decoding them. You can use encrypted cookies if you want the value to be unreadable.

```ts
Route.get('/', async ({ request, response }) => {
  // set signed cookie
  response.cookie('user_id', 1)

  // read signed cookie
  request.cookie('user_id')
})
```

## Encrypted cookies

Unlike signed cookies, the encrypted cookie value cannot be decoded to plain text. You can use encrypted cookies for values that contain sensitive information and should not be readable by anyone.

- The cookie value is encrypted using the [Encryption](./../security/encryption.md) module.
- It uses the `appKey` stored inside the `config/app.ts` file as the encryption secret.

The encrypted cookies are defined using the `response.encryptedCookie` method. For example:

```ts
Route.get('/', async ({ response }) => {
  response.encryptedCookie('user_id', 1)
})
```

Similarly, to read the cookie value, you will have to use the `request.encryptedCookie` method.

```ts
Route.get('/', async ({ request }) => {
  console.log(request.encryptedCookie('user_id'))
})
```

## Plain cookies

Plain cookies hold Base64 encoded values with no signature or encryption in place. They are usually helpful when you want to access the cookie on frontend JavaScript and read/write its value.

You can define a plain cookie using the `plainCookie` method. For example:

```ts
Route.get('/', async ({ response }) => {
  response.plainCookie('user_id', 1)
})
```

If you want to access this cookie inside frontend JavaScript, do make sure to disable the `httpOnly` flag.

```ts
response.plainCookie('user_id', 1, {
  httpOnly: false,
})
```

You can read the cookie value inside JavaScript using the `document.cookie` property. Make sure to Base64 decode and JSON parse the value.

:::note
The following example is a naive implementation for reading the cookie value for demonstration only.
:::

```js
/**
 * Reading the cookie value
 */
const userIdValue = document.cookie.split('user_id=')[1].split(';')[0]

/**
 * Base 64 decoding the value
 */
const base64Decoded = atob(userIdValue)

/**
 * Converting the JSON string to an object
 */
const jsonParsed = JSON.parse(base64Decoded)
console.log(jsonParsed)
```
