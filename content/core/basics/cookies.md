All the request cookies are automatically parsed during an HTTP request. You can read cookies using the [request](./request.md) class and set/clear cookies using the [response](./response.md) class.

```ts
// title: Read cookies
import router from '@adonisjs/core/services/router'

router.get('cart', async ({ request }) => {
  const cartItems = request.cookie('cart_items', [])
  console.log(cartItems)
})
```

```ts
// title: Set cookies
import router from '@adonisjs/core/services/router'

router.post('cart', async ({ request, response }) => {
  const id = request.input('product_id')
  response.cookie('cart_items', [{ id }])
})
```

```ts
// title: Clear cookies
import router from '@adonisjs/core/services/router'

router.delete('cart', async ({ request, response }) => {
  response.clearCookie('cart_items')
})
```

## Configuration

The default configuration for setting cookies is defined inside the `config/app.ts` file. Feel free to tweak the options as per your application requirement.

```ts
http: {
  cookie: {
    domain: '',
    path: '/',
    maxAge: '2h',
    httpOnly: true,
    secure: false,
    sameSite: false,
  }
}
```

The options are converted to [set-cookie attributes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes). The `maxAge` property accepts a string based time expression and its value will be converted to seconds.

The same set of options can be overridden at the time of the setting the cookies. 

```ts
response.cookie('key', value, {
  domain: '',
  path: '/',
  maxAge: '2h',
  httpOnly: true,
  secure: false,
  sameSite: false,
})
```

## Supported data types

The cookie values are serialised to a string using `JSON.stringify` and therefore you can use the following JavaScript data types as cookie values.

- string
- number
- bigInt
- boolean
- null
- object
- array 

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

// BigInt
response.cookie('visits', BigInt(10))

// Data objects are converted to ISO string
response.cookie('visits', new Date())
```

## Signed cookies

The cookies set using the `response.cookie` method are signed. A signed cookie is tamper-proof, meaning changing the cookie contents will invalidate its signature and the cookie will be ignored.

The cookies are signed using the `appKey` defined inside the `config/app.ts` file.


:::note

The signed cookies are still readable by Base64 decoding them. You can use encrypted cookies if you want the cookie value to be unreadable.


:::


```ts
import router from '@adonisjs/core/services/router'

router.get('/', async ({ request, response }) => {
  // set signed cookie
  response.cookie('user_id', 1)

  // read signed cookie
  request.cookie('user_id')
})
```

## Encrypted cookies

Unlike signed cookies, the encrypted cookie value cannot be decoded to plain text. You can use encrypted cookies for values that contain sensitive information and should not be readable by anyone.

Encrypted cookies are set using the `response.encryptedCookie` method and read using the `request.encryptedCookie` method. Under the hood, these methods uses the [Encryption module](../security/encryption.md).

```ts
import router from '@adonisjs/core/services/router'

router.get('/', async ({ request, response }) => {
  // set encrypted cookie
  response.encryptedCookie('user_id', 1)

  // read encrypted cookie
  request.encryptedCookie('user_id')
})
```

## Plain cookies

Plain cookies are meant to be used when you want the cookie to be accessed by your frontend code using the `document.cookie` value. 

By default, we stringify and base64 encode raw values so that you can use `objects` and `arrays` for the cookie value. However, the encoding of the value can be turned off as well.

Plain cookies are defined using the `response.plainCookie` method and can be read using the `request.plainCookie` method.

```ts
import router from '@adonisjs/core/services/router'

router.get('/', async ({ request, response }) => {
  // set plain cookie
  response.plainCookie('user', { id: 1 }, {
    httpOnly: true
  })

  // read plain cookie
  request.plainCookie('user')
})
``` 

To turn off encoding, set `encoding: false` in the options object.

```ts
response.plainCookie('token', tokenValue, {
  httpOnly: true,
  encoding: false,
})

// Read plain cookie with encoding off
request.plainCookie('token', {
  encoded: false
})
```
