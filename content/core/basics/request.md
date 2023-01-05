An instance of the [request class]() holds data for the ongoing HTTP request, including the **request body**, **reference to uploaded files**, **cookies**, **request headers**, and much more. The request instance can be accessed using the `ctx.request` property.

## Query string and route params

The `request.qs` method returns the parsed query string as an object.

```ts
import route from '@adonisjs/core/services/router'

router.post('/', async ({ request }) => {
  /*
   * URL: /?sort_by=id&direction=desc
   * qs: { sort_by: 'id', direction: 'desc' }
   */
  request.qs()
})
```

The `request.params` method returns an object of [Route params](./routing.md#route-params).

```ts
import route from '@adonisjs/core/services/router'

router.post('posts/:slug/comments/:id', async ({ request }) => {
  /*
   * URL: /posts/hello-world/comments/2
   * params: { slug: 'hello-world', id: '2' }
   */
  request.params()
})
```

You can also access a single parameter using the `request.param` method.

```ts
import route from '@adonisjs/core/services/router'

router.post('posts/:slug/comments/:id', async ({ request }) => {
  const slug = request.param('slug')
  const commentId = request.param('id')
})
```

## Request body

AdonisJS parses the request body using the [body-parser middleware](../reference/config.md#bodyparser) registered inside the `start/kernel.ts` file.

You can access the request body using the `request.body()` method. It returns the parsed request body as an object.

```ts
import route from '@adonisjs/core/services/router'

router.post('/', async ({ request }) => {
  console.log(request.body())
})
```

The `request.all` method returns a merged copy of both the request body and the query string.

```ts
import route from '@adonisjs/core/services/router'

router.post('/', async ({ request }) => {
  console.log(request.all())
})
```

### Cherry-picking values

The `request.input`, `request.only`, and the `request.except`  methods can cherry-pick specific properties from the request data. All the cherry-picking methods lookup for values inside both the request body and the query string.

The `request.only` method returns an object with only the mentioned properties.

```ts
import route from '@adonisjs/core/services/router'

router.post('login', async ({ request }) => {
  const credentials = request.only(['email', 'password'])
  
  console.log(credentials)
})
```

The `request.except` method returns an object excluding the mentioned properties.

```ts
import route from '@adonisjs/core/services/router'

router.post('register', async ({ request }) => {
  const userDetails = request.except(['password_confirmation'])
  
  console.log(userDetails)
})
```

The `request.input` method returns the value for a specific property. Optionally, you can pass a default value as the second argument. The default value is returned when the actual value is missing.

```ts
import route from '@adonisjs/core/services/router'

router.post('comments', async ({ request }) => {
  const email = request.input('email')
  const commentBody = request.input('body')
})
```

## Request URL

The `request.url` method returns the request URL relative to the hostname. By default, the return value does not include the query string. However, you can get the URL with query string by calling `request.url(true)`.

```ts
import route from '@adonisjs/core/services/router'

router.get('/users', async ({ request }) => {
  /*
   * URL: /users?page=1&limit=20
   * url: /users
   */
  request.url()

  /*
   * URL: /users?page=1&limit=20
   * url: /users?page=1&limit=20
   */
  request.url(true) // returns query string
})
```

The `request.completeUrl` method returns the complete URL, including the hostname. Again, unless explicitly told, the return value does not include the query string.

```ts
import route from '@adonisjs/core/services/router'

router.get('/users', async ({ request }) => {
  request.completeUrl()
  request.completeUrl(true) // returns query string
})
```

## Request headers

The `request.headers` method returns the request headers as an object. 

```ts
import route from '@adonisjs/core/services/router'

router.get('/', async ({ request }) => {
  console.log(request.headers())
})
```

You can access the value for an individual header using the `request.header` method.

```ts
import route from '@adonisjs/core/services/router'

router.get('/', async ({ request }) => {
  request.header('x-request-id')

  // Header name is not case sensitive
  request.header('X-REQUEST-ID')
})
```

## Request method

The `request.method` method returns the HTTP method for the current request. This method returns the spoofed method when [form method spoofing]() is enabled, and you can use the `request.intended` method to get the original request method.

```ts
import route from '@adonisjs/core/services/router'

router.patch('posts', async ({ request }) => {
  /**
   * The method that was used for route matching
   */
  console.log(request.method())

  /**
   * The actual request method
   */
  console.log(request.intended())
})
```

## User IP Address

The `request.ip` method returns the user IP address for the current HTTP request. This method relies on the [`X-Forwarded-For`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)  header set by proxy servers like Nginx or Caddy.


:::note

Make sure to read the [trusted proxies]() section to configure the proxies that should be trusted by your application.


:::

```ts
import router from '@adonisjs/core/services/router'

router.get('/', async ({ request }) => {
  console.log(request.ip())
})
```

The `request.ips` method returns an array of all the IP addresses set by intermediate proxies. The array is sorted by most trusted to least trusted IP address.

```ts
import router from '@adonisjs/core/services/router'

router.get('/', async ({ request }) => {
  console.log(request.ips())
})
```

## Content negotiation 

AdonisJS provides several methods for [content-negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation#server-driven_content_negotiation) by parsing all the commonly supported `Accept` headers. For example, you can use the `request.types` method to get a list of all the content types accepted by a given request.

The return value of the `request.types` method is ordered by the client's preference (most preferred first).

```ts
import router from '@adonisjs/core/services/router'

router.get('/', async ({ request }) => {
  console.log(request.types())
})
```

Following is the complete list of content negotiation methods.

| Method | HTTP header in use |
|---------|------------------|
| types | [Accept](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept) |
| languages | [Accept-language](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language) |
| encodings | [Accept-encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding) |
| charsets | [Accept-charset](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Charset) |

Sometimes you want to find the preferred content type based on what the server can support. 

For the same, you can use the `request.accepts` method. The method takes an array of supported content types and returns the most preferred one after inspecting the `Accept` header. A `null` value is returned when unable to find a match.

```ts
import router from '@adonisjs/core/services/router'

router.get('posts', async ({ request, view }) => {
  const posts = [
    {
      title: 'Adonis 101',
    },
  ]
  
  const bestMatch = request.accepts(['html', 'json'])

  switch (bestMatch) {
    case 'html':
      return view.render('posts/index', { posts })
    case 'json':
      return posts
    default:
      return view.render('posts/index', { posts })
  }
})
```

Similar to `request.accept`, the following methods can be used to find the preferred value for other `Accept` headers.

```ts
// Preferred language
const language = request.language(['fr', 'de'])

// Preferred encoding
const encoding = request.encoding(['gzip', 'br'])

// Preferred charset
const charset = request.charset(['utf-8', 'hex', 'ascii'])
```

## Generating request ids

Request ids help you [debug and trace application issues](https://blog.heroku.com/http_request_id_s_improve_visibility_across_the_application_stack) from logs by assigning a unique id to every HTTP request. By default, request id creation is disabled. However, you can enable it inside the `config/app.ts` file.


:::note

Request ids are generated using the [cuid](https://github.com/paralleldrive/cuid) package. Before generating an id, we check for the `X-Request-Id` request header and use its value (if it exists).


:::

```ts
{
  http: {
    generateRequestId: true
  }
}
```

Once enabled, you can access the id using the `request.id` method.

```ts
router.get('/', ({ request }) => {
  // ckk9oliws0000qt3x9vr5dkx7
  console.log(request.id())
})
```

The same request id is also added to all the logs generated using the `ctx.logger` instance.

```ts
router.get('/', ({ logger }) => {
  // { msg: 'hello world', request_id: 'ckk9oliws0000qt3x9vr5dkx7' }
  logger.info('hello world')
})
```

## Configuring trusted proxies

Most Node.js applications are deployed behind a proxy server like Nginx or Caddy. Therefore we have to rely on HTTP headers such as `X-Forwarded-Host`, `X-Forwarded-For`, and `X-Forwarded-Proto` to know about the real end-client making an HTTP request.

These headers are only used when your AdonisJS application can trust the source IP address. 

You can configure which IP addresses to trust within the `config/app.ts` file using the `http.trustProxy` configuration option.

```ts
import proxyAddr from 'proxy-addr'

{
  http: {
    trustProxy: proxyAddr.compile([
      '127.0.0.1/8',
      '::1/128'
    ])
  }
}
```

The value for `trustProxy` can also be a function. The method should return `true` if the IP address is trusted; otherwise, return `false`.

```ts
{
  http: {
    trustProxy: ((address) => {
      return address === '127.0.0.1' || address === '123.123.123.123'
    })
  }
}
```

If you are running Nginx on the same server as your application code, you need to trust the loopback IP addresses, i.e. (127.0.0.1).

```ts
{
  http: {
    trustProxy: proxyAddr.compile('loopback')
  }
}
```

Suppose your application is only accessible through a load balancer, and you do not have a list of IP addresses for that load balancer. Then, you can trust the proxy server by defining a callback that always returns `true`.

```ts
{
  http: {
    trustProxy: () => true
  }
}
```

## Configuring body-parser

The Body-parser middleware of AdonisJS relies on the `config/bodyparser.ts` file. The config file configures the content types and the parser to use for those content types.

| Content type | Parser used |
|------------|------------|
| `application/json` | JSON parser |
| `application/json-patch+json` | JSON parser |
| `application/vnd.api+json` | JSON parser |
| `application/csp-report` | JSON parser |
| `application/x-www-form-urlencoded` | Form parser |
| `multipart/form-data` | Multipart parser |
| `text/*` | Raw text parser |

Each parser accepts a different set of options you can use to configure them. You can set the `types` array to empty to turn off the parser completely.

The following configuration block represents the JSON parser. The upper limit of the body this parser allows is set to `1mb`, and the types array represents the request content types to parse.

```json
{
  json: {
    encoding: 'utf-8',
    limit: '1mb',
    strict: true,
    types: [
      'application/json',
      'application/json-patch+json',
      'application/vnd.api+json',
      'application/csp-report',
    ],
  }
}
```

### Convert empty strings to null

HTML forms send an empty string in the request body when an input field has no value. This behavior of HTML forms makes data normalization at the database layer harder.

For example, if you have a database column `country` set to nullable, you would want to store `null` as a value inside this column when the user does not select a country.

However, with HTML forms, the backend receives an empty string, and you will insert an empty string into the database instead of leaving the column as `null`.

The Body-parser middleware can perform this normalization automatically for you. Make sure the `convertEmptyStringsToNull` flag is true inside the `form` and the `multipart` parser config blocks.

```ts
{
  form: {
    // ... rest of the config
    convertEmptyStringsToNull: true
  },

  multipart: {
    // ... rest of the config
    convertEmptyStringsToNull: true
  }
}
```

:::note


This normalization is not available for JSON payloads since a JSON request body is set manually by the frontend form libraries. Therefore, you should set empty input fields to `null` before making the Ajax request.


:::

## Configuring query string parser

Query strings from the request URL are parsed using the [qs](http://npmjs.com/qs) module. You can configure the parser settings inside the `config/app.ts` file.

[View the list](https://github.com/adonisjs/http-server/blob/next/src/types/qs.ts#L11) of all the available options.

```ts
http: {
  qs: {
    parse: {
    },
  }
}
```
