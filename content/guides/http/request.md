---
summary: Reference to the HTTP request class. You can access data for the current HTTP request, including the **request body**, **uploaded files**, **cookies** and much more.
---

The instance of the [request class](https://github.com/adonisjs/http-server/blob/develop/src/Request/index.ts) allows you to access data for the current HTTP request, including the **request body**, **uploaded files**, **cookies** and much more.

You can access the `request` object from the HTTP context instance passed to the route handler, middleware, and exception handler.

```ts
Route.get('/', (ctx) => {
  console.log(ctx.request.url())
})
```

With destructuring

```ts
Route.get('/', async ({ request }) => {
  console.log(request.url())
})
```

## Request data

You can access the request data using one of the following methods.

```ts
Route.post('posts', async ({ request }) => {
  /**
   * Access the entire request body
   */
  console.log(request.body())

  /**
   * Access the parsed query string object
   */
  console.log(request.qs())

  /**
   * A merged copy of the request body and the query
   * string
   */
  console.log(request.all())

  /**
   * Cherry pick fields from the "request.all()" output
   */
  console.log(request.only(['title', 'description']))

  /**
   * Omit fields from the "request.all()" output
   */
  console.log(request.except(['csrf_token', 'submit']))

  /**
   * Access value for a single field
   */
  console.log(request.input('title'))
  console.log(request.input('description'))
})
```

### Query string and params

The parsed query string can be accessed using the `request.qs()` method.

```ts
request.qs()
```

The `request.params()` method returns the route parameters.

```ts
Route.get('/posts/:id/:slug', async ({ request }) => {
  /*
   * URL: /posts/1/hello-world
   * Params: { id: '1', slug: 'hello-world' }
   */
  console.log(request.params())
})
```

You can also access a single parameter using the `request.param` method.

```ts
request.param('id')

// Default value for optional params
request.param('id', 1)
```

### Request body

The request body is parsed using the pre-configured bodyparser middleware. Open the `start/kernel.ts` file and ensure that the following middleware is registered inside the list of the global middlewares.

```ts
// title: start/kernel.ts
Server.middleware.register([
  () => import('@ioc:Adonis/Core/BodyParserMiddleware')
])
```

Once the bodyparser middleware has been registered, you can use one of the following methods to access the request body.

```ts
request.body()

// A merged copy of query string and the request body
request.all()
```

The `request.input` method allows reading value for a single field. Optionally, you can define a default value to be returned when the actual value is `null` or `undefined`.

```ts
request.input('title')

// If title is missing
request.input('title', 'Hello world')
```

The `request.only` and `request.except` method allows selecting or ignoring specific fields.

```ts
// Cherry pick
const body = request.only(['title', 'description'])

// Omit
const body = request.except(['submit', 'csrf_token'])
```

### Supported content types

The bodyparser is capable of parsing the following content types.

#### JSON

The JSON parser processes request sending the JSON string with one of the following content types.

- application/json
- application/json-patch+json
- application/vnd.api+json
- application/csp-report

You can add more content types to the `json.types` array inside the `config/bodyparser.ts` file, and the JSON parser will also process them.

---

#### URL encoded

Request sending a URL encoded string with `content-type='application/x-www-form-urlencoded'` is parsed using the URL encoding parser.

---

#### Multipart

The multipart requests with `content-type='multipart/form-data'` are parsed using the multipart parser. Make sure to read the guide on [file uploads](./file-uploads.md) to view all available configuration options.

---

#### Raw

All requests with `content-type='text/*'` are read using the raw parser. You can further process the raw string inside a middleware or the route handler.

You can use the raw parser to process custom/unsupported content types. For example

#### Register the custom content type

```ts
// title: config/bodyparser.ts
{
  raw: {
    // ...
    types: ['text/*', 'my-custom-content-type']
  }
}
```

#### Create a middleware to parse the content type further

```ts
Route
  .get('/', ({ request }) => {
    console.log(request.all())
  })
  // highlight-start
  .middleware(async ({ request }, next) => {
    const contentType = request.header('content-type')

    if (contentType === 'my-custom-content-type') {
      const body = request.raw()
      const parsed = someCustomParser(body)
      request.updateBody(parsed)
    }

    await next()
  })
  // highlight-end
```

## Request route

The `request` class holds the current matching route for the HTTP request and you can access it as follows:

```ts
Route.get('/', ({ request }) => {
  /**
   * The route pattern
   */
  console.log(request.route.pattern)

  /**
   * The handler that handles the route request
   */
  console.log(request.route.handler)

  /**
   * Middleware attached to the route
   */
  console.log(request.route.middleware)

  /**
   * Route name (exists if route is named)
   */
  console.log(request.route.name)
})
```

You can also check if the current request URL matches a given route or not.

```ts
if (request.matchesRoute('/posts/:id')) {
}
```

Or pass an array to check for more than one route. The method returns true if any of the routes match the current request URL.

```ts
if (request.matchesRoute(['/posts/:id', '/posts/:id/comments'])) {
}
```

## Request URL

You can access the request URL using the `request.url()` method. It returns the pathname without the domain name or the port.

```ts
request.url()

// Include query string
request.url(true)
```

The `request.completeUrl()` method returns the complete URL, including the domain and the port (if any).

```ts
request.completeUrl()

// Include query string
request.completeUrl(true)
```

## Request method

### method

Returns the HTTP method for the given request. The spoofed method is returned when [form method spoofing](#form-method-spoofing) is enabled.

```ts
request.method()
```

### intended

The `intended` method returns the actual HTTP method and not the spoofed one.

```ts
request.intended()
```

## Request id

Request ids [help you debug and trace logs](https://blog.heroku.com/http_request_id_s_improve_visibility_across_the_application_stack) for a given HTTP request by associating a unique id to every log entry.

AdonisJS follows the industry standard and has first-class support for working with the `X-Request-Id` header.

### Generating request ids

Open the `config/app.ts` and set the value of `http.generateRequestId` to true.

Also, the request-id is only generated when the `X-Request-Id` header is not set. This allows you to generate the request ids at your proxy server level and then reference them inside your AdonisJS application.

```ts
// title: config/app.ts
{
  http: {
    generateRequestId: true
  }
}
```

### Access request id

The `request.id()` method returns the request-id by reading the `X-Request-Id` header. The flow looks as follows:

- Read the value of the `X-Request-Id` header. Return the value if it is present.
- Generate and set the header manually if the `generateRequestId` flag is enabled in the config.
- Return `null` when the header is missing, and `generateRequestId` is disabled.

```ts
request.id()
```

### Request id inside logs

The logger instance attached to the HTTP context automatically sets the `request_id` property on every log statement.

```ts
Route.get('/', ({ logger }) => {
  // { msg: 'hello world', request_id: 'ckk9oliws0000qt3x9vr5dkx7' }
  logger.info('hello world')
})
```

## Request headers

The `request.headers()` and the `request.header()` method gives you access to the request headers.

```ts
// all headers
console.log(request.headers())
```

The `header` method returns the value for a single header field. The header name is **not case sensitive**.

```ts
request.header('X-CUSTOM-KEY') === request.header('x-custom-key')

// With default value
request.header('x-header-name', 'default value')
```

## Request IP address

The `request.ip()` method returns the most trusted IP address for the HTTP request. Make sure to read the [trusted proxy](#trusted-proxy) section to understand how you can get the correct IP address when your application is behind a proxy server.

```ts
request.ip()
```

The `request.ips()` method returns an array of IP addresses starting from the most trusted to the least trusted IP address.

```ts
request.ips()
```

### Custom IP reterval method

If the trusted proxy settings are not enough to determine the correct IP address, you can implement your own custom `getIp` method.

Open the `config/app.ts` file and define the `getIp` method as follows:

```ts
http: {
  getIp(request) {
    const nginxRealIp = request.header('X-Real-Ip')
    if (nginxRealIp) {
      return nginxRealIp
    }

    return request.ips()[0]
  }
}
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


## Content negotiation

[Content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation) is a mechanism that is used for serving different representations of a resource from the same URL.

The client making the request can negotiate for the **resource representation**, **charset**, **language**, and **encoding** using different `Accept` headers, and you can handle them as follows.

### request.accepts

The `request.accepts` method takes an array of content types (including shorthands) and returns the most appropriate content type by inspecting the `Accept` header. You can find the list of supported content types [here](https://github.com/jshttp/mime-db/blob/master/db.json).

```ts
Route.get('posts', async ({ request, view }) => {
  const posts = [
    {
      title: 'Adonis 101',
    },
  ]

  switch (request.accepts(['html', 'json'])) {
    case 'html':
      return view.render('posts/index', { posts })
    case 'json':
      return posts
    default:
      return view.render('posts/index', { posts })
  }
})
```

### request.language

Negotiate for the requested language based upon the `Accept-language` header.

```ts
const language = request.language(['fr', 'de'])

if (language) {
  return view.render(`posts/${language}/index`)
}

return view.render('posts/en/index')
```

### request.encoding

Find the best encoding using the `Accept-encoding` header.

```ts
switch (request.encoding(['gzip', 'br'])) {
  case 'gzip':
    return compressAsGzip(someValue)
  case 'br':
    return compressAsBr(someValue)
  default:
    return value
}
```

### request.charset

Find the best charset using the `Accept-charset` header.

```ts
const charset = request.charset(['utf-8', 'hex', 'ascii'])
return Buffer.from('hello-world').toString(charset || 'utf-8')
```

## Trusted proxy

The majority of Node.js applications are deployed behind a proxy server like Nginx or Caddy. Hence, the value of [remoteAddress](https://nodejs.org/api/net.html#net_socket_remoteaddress) is the IP address of the proxy server and not the client.

However, all the proxy servers set the [`X-Forwaded`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#proxies) headers to reflect the request's original values, and you must inform AdonisJS to trust the proxy server headers.

You can control which proxies to trust by modifying the `http.trustProxy` value inside the `config/app.ts`.

```ts
// title: config/app.ts
{
  http: {
    trustProxy: proxyAddr.compile(valueComesHere)
  }
}
```

### Boolean values

Setting the value to `true` will trust the left-most entry in the `X-Forwarded-*` header. Whereas the `false` assumes the application directly faces the Internet and value for `request.connection.remoteAddress` is used.

```ts
{
  trustProxy: proxyAddr.compile(true)
}
```

### Ip addresses

You can also define a single or an array of proxy server IP addresses to trust.

```ts
{
  trustProxy: proxyAddr.compile('127.0.0.0/8')
}

// or
{
  trustProxy: proxyAddr.compile(['127.0.0.0/8', 'fc00:ac:1ab5:fff::1/64'])
}
```

The following shorthand keywords can also be used in place of IP addresses.

- `loopback`: Pv4 and IPv6 loopback addresses (like `::1` and `127.0.0.1`).
- `linklocal`: IPv4 and IPv6 link-local addresses (like `fe80::1:1:1:1` and `169.254.0.1`).
- `uniquelocal`: IPv4 private addresses and IPv6 unique-local addresses (like `fc00:ac:1ab5:fff::1` and `192.168.0.1`).

### Custom function

You can also define a custom function that returns a boolean on a per request basis.

```ts
{
  trustProxy: proxyAddr.compile((address, index) => {
    return address === '127.0.0.1' || address === '123.123.123.123'
  })
}
```

### Proxy headers in use

The following methods from the request class rely on a trusted proxy to return the correct value.

- **hostname**: The value of `request.hostname()` is derived from the `X-Forwarded-Host` header.
- **protocol**: The value of `request.protocol()` is derived from the `X-Forwarded-Proto` header.
- **ip/ips**: The value of `request.ips()` and `request.ip()` is derived from the `X-Forwaded-For` header. However, the `http.getIp` configuration method takes precendence when defined. [Learn more](#custom-ip-reterval-method)

## CORS

AdonisJS has in-built support for responding to the [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) `OPTIONS` requests. Just enable it inside the `config/cors.ts` file.

```ts
// title: config/cors.ts
{
  enabled: true,
  // ...rest of the config
}
```

The config file is extensively documented. Make sure to go through all the options and read the associated comments to understand its usage.

## Other methods and properties

Following is the list of other available methods and properties on the Request class.

### updateBody

Allows you to update the request body with a custom payload. It would be best if you weren't doing it unless creating a package that purposefully mutates the request body.

```ts
request.updateBody(myCustomPayload)
```

### updateRawBody

The `updateRawBody` allows updating the raw request body. The raw body is always a string.

```ts
request.updateRawBody(JSON.stringify(myCustomPayload))
```

### updateQs

The `updateQs` allows updating the value of parsed query string.

```ts
request.updateQs(someCustomParser(request.parsedUrl.query))
```

### original

Returns the request's original body parsed by the bodyparser. Calling the `updateBody` method does not change the original payload.

```ts
request.original()
```

### hasBody

Find if the request has a body. The bodyparser uses this method to know if the request has a body before parsing it.

```ts
if (request.hasBody()) {
  // parse request body
}
```

## Extending Request class

You can extend the Request class using **macros** or **getters**. The best place to extend the request is inside a custom service provider.

Open the pre-existing `providers/AppProvider.ts` file and write the following code inside the `boot` method.

```ts
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  public static needsApplication = true
  constructor(protected app: ApplicationContract) {}

  // highlight-start
  public async boot() {
    const Request = this.app.container.use('Adonis/Core/Request')

    Request.macro('wantsJSON', function () {
      const types = this.types()
      return (
        types[0] && (types[0].includes('/json') || types[0].includes('+json'))
      )
    })
  }
  // highlight-end
}
```

In the above example, we have added the `wantsJSON` method to the request class. It reads the `Accept` header's value and returns true if the first value negotiates for JSON.

You can use the newly added method as follows.

```ts
Route.get('/', ({ request }) => {
  if (request.wantsJSON()) {
    return {}
  }
})
```

### Informing typescript about the method

The `wantsJSON` property is added at the runtime, and hence TypeScript does not know about it. To inform the TypeScript, we will use [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces) and add the property to the `RequestContract` interface.

Create a new file at path `contracts/request.ts` (the filename is not important) and paste the following contents inside it.

```ts
// title: contracts/request.ts
declare module '@ioc:Adonis/Core/Request' {
  interface RequestContract {
    wantsJSON(): boolean
  }
}
```

## Additional reading

Following are some of the additional guides to learn more about the topics not covered in this document.

- [Cookies](./cookies.md)
- [File uploads](./file-uploads.md)
- [Validations](../validator/introduction.md)
