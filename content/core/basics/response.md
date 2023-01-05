An instance of the [response class]() is used to respond to HTTP requests. AdonisJS supports sending **HTML fragments**, **JSON objects**, **streams**, and much more. The response instance can be accessed using the `ctx.response` property.

## Sending response

The simplest way to send a response is to return a value from the route handler.

```ts
import route from '@adonisjs/core/services/router'

route.get('/', async () => {
  /** Plain string */
  return 'This is the homepage.'

  /** Html fragment */
  return '<p> This is the homepage </p>'

  /** JSON response */
  return { page: 'home' }

  /** Converted to ISO string */
  return new Date()
})
```

Along with returning a value from the route handler, you can also use the `response.send` method to explicitly set the response body. However, calling the `response.send` method multiple times will overwrite the old body and only keeps the latest one.

```ts
import route from '@adonisjs/core/services/router'

route.get('/', async ({ response }) => {
  /** Plain string */
  response.send('This is the homepage')

  /** Html fragment */
  response.send('<p> This is the homepage </p>')

  /** JSON response */
  response.send({ page: 'home' })

  /** Converted to ISO string */
  response.send(new Date())
})
```

A custom status code for the response can be set using the `response.status` method.

```ts
response.status(200).send({ page: 'home' })

// Send empty 201 response
response.status(201).send('')
```

## Streaming content

The `response.stream` method allows piping a stream to the response. The method internally destroys the stream after it finishes.

The `response.stream` method does not set the `content-type` and the `content-length` headers; you must set them explicitly before streaming the content.

```ts
import route from '@adonisjs/core/services/router'

route.get('/', async ({ response }) => {
  const image = fs.createReadStream('./some-file.jpg')
  response.stream(image)
})
```

A 500 status code is sent to the client in case of an error. However, you can customize the error code and message by defining a callback as the second param.

```ts
const image = fs.createReadStream('./some-file.jpg')

response.stream(image, () => {
  const message = 'Unable to serve file. Try again'
  const status = 400
  
  return [message, status]
})
```

## Downloading files

We recommend using the `response.download` method over the `response.stream` method when you want to stream files from the disk. This is because the `download` method automatically sets the `content-type` and the `content-length` headers.

```ts
import app from '@adonisjs/core/services/app'
import route from '@adonisjs/core/services/router'

route.get('/uploads/:file', async ({ response, params }) => {
  const filePath = app.makePath(`uploads/${params.file}`)

  response.download(filePath)
})
```

Optionally you can generate an [Etag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) for the file contents. Using Etags will help the browser re-use the cached response from the previous request (if any).

```ts
const filePath = app.makePath(`uploads/${params.file}`)
const generateEtag = true

response.download(filePath, generateEtag)
```

Similar to the `response.stream` method, you can send a custom error message and status code by defining a callback as the last parameter.

```ts
const filePath = app.makePath(`uploads/${params.file}`)
const generateEtag = true

response.download(filePath, generateEtag, (error) => {
  if (error.code === 'ENOENT') {
    return ['File does not exists', 404]
  }

  return ['Cannot download file', 400]
})
```

### Force downloading files

The `response.attachment` method is similar to the `response.download` method, but it forces the browsers to save the file on the user's computer by setting the [Content-Disposition](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition) header.

```ts
import app from '@adonisjs/core/services/app'
import route from '@adonisjs/core/services/router'

route.get('/uploads/:file', async ({ response, params }) => {
  const filePath = app.makePath(`uploads/${params.file}`)

  response.attachment(filePath, 'custom-filename.jpg')
})
```

## Setting response headers

You can set the response headers using the `response.header` method. This method overrides the existing header value (if it already exists).

```ts
import app from '@adonisjs/core/services/app'
import route from '@adonisjs/core/services/router'

route.get('/', async ({ response }) => {
  response.header('Content-type', 'text/html')
})
```

You can use the `response.append` method to append values to existing header values.

```ts
response.append('Set-cookie', 'cookie-value')
```

The `response.removeHeader` method removes the existing header.

```ts
response.removeHeader('Set-cookie')
```

## Redirects

The `response.redirect` method returns an instance of the [Redirect]() class. The redirect class uses fluent API to construct the redirect URL.

The simplest way to perform a redirect is to call the `redirect.toPath` method with the redirection path.

```ts
import app from '@adonisjs/core/services/app'
import route from '@adonisjs/core/services/router'

route.get('/posts', async ({ response }) => {
  response.redirect().toPath('/articles')
})
```

The redirect class also allows constructing a URL from a pre-registered route. The `redirect.toRoute` method accepts the [route identifier]() as the first parameter and the route params as the second parameter.

```ts
import app from '@adonisjs/core/services/app'
import route from '@adonisjs/core/services/router'

route
  .get('/articles/:id', async () => {
  })
  .as('articles.show')

route.get('/posts/:id', async ({ response, params }) => {
  response
    .redirect()
    .toRoute('articles.show', { id: params.id })
})
```

### Redirect back to the previous page

During form submissions, you might want to redirect the user back to the previous page in case of validation errors. You can do that using the `redirect.back` method.

```ts
response.redirect().back()
```

### Redirection status code

The default status for redirect responses is `302`, and you can change it by calling the `redirect.status` method.

```ts
  response
    .redirect()
    .status(301)
    .toRoute('articles.show', { id: params.id })
```

### Redirect with query string

You can use the `withQs` method to append a query string to the redirect URL. The method accepts an object of key-value pair and converts it to a string.

```ts
response
    .redirect()
    .withQs({ page: 1, limit: 20 })
    .toRoute('articles.index')
```

To forward the query string from the current request URL, call the `withQs` method without any parameters.

```ts
// Forward current URL query string
response
  .redirect()
  .withQs()
  .toRoute('articles.index')
```

When redirecting back to the previous page, the `withQs` method will forward the query string of the previous page.

```ts
// Forward current URL query string
response
  .redirect()
  .withQs()
  .back()
```

## Response body serialization

The response body set using the `response.send` method gets serialized to a string before it is [written as response](https://nodejs.org/dist/latest-v18.x/docs/api/http.html#responsewritechunk-encoding-callback) to the outgoing message stream.

Following is the list of supported data types and their serialization rules.

- Arrays and Objects are stringified using the [safe stringify function](https://github.com/poppinss/utils/blob/next/src/json/safe_stringify.ts). The method is similar to `JSON.stringify` but removes the circular references and serializes `BigInt(s)`.
- The number and boolean values are converted to a string.
- The instance of the Date class is converted to a string by calling the `toISOString` method.
- Regular expressions and error objects are converted to a string by calling the `toString` method.
- Any other data type results in an exception.


### Content type inference

After the response has been serialized, the response class automatically infers and sets the `content-type` and the `content-length` headers.


:::note

Both the headers are only set when they have yet to be defined.


:::

Following is the list of rules we follow to set the `content-type` header.

- Content type is set to `application/json` for arrays and objects.
- It is set to `text/html` for HTML fragments.
- JSONP responses are sent with the `text/javascript` content type.
- The content type is set to `text/plain` for everything else.
