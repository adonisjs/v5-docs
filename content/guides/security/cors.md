[Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) support is baked into the framework core, and hence there is no need to install any additional packages.

Make sure CORS is enabled inside the `config/cors.ts` file by setting the `enabled` property to true.

:::note
If the config file is missing, then create a new one manually and copy/paste the contents from the [CORS stub](https://github.com/adonisjs/core/blob/develop/templates/config/cors.txt).
:::

```ts
// title: config/cors.ts
{
  "enabled": true
}
```

## Allowed origin
You can control the origins to allow for the CORS request using the `origin` property. This property controls the [Access-Control-Allow-Origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin) header.

#### Boolean value
Setting the value to `true` will allow any origin. Whereas setting the value to `false` will disallow any origin.

```ts
{
  origin: true
}
```

---

#### String or array of origins
You can allow one or more origins by defining them as a string or an array of strings.

```ts
{
  origin: 'adonisjs.com',
}

// or
{
  origin: ['adonisjs.com']
}
```

---

#### Wildcard
Set the value of `Access-Control-Allow-Origin` to a wildcard.

```ts
{
  origin: '*'
}
```

---

#### Function
You can also define a function as the value for the `origin` property to decide which origin to allow or disallow at runtime.

The method receives the current origin as the only argument and must return a **boolean**, a **wildcard**, or a **string/array of allowed origins**.

```ts
const ALLOWED_ORIGINS = []

{
  origin: (requestOrigin: string) => {
    return ALLOWED_ORIGINS.includes(requestOrigin)
  }
}
```

## Allowed methods
The `methods` property controls the method to allow during the preflight request. The [Access-Control-Request-Method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Request-Method) header value is checked against the allowed methods.

```ts
{
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE']
}
```

## Allowed headers
The `headers` property controls the headers to allow during the preflight request. The [Access-Control-Request-Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Request-Headers) header value is checked against the `headers` property.

#### Boolean value
Setting the value to `true` will allow all the headers. Whereas setting the value to `false` will dis-allow all the headers.

```ts
{
  headers: true
}
```

#### String or array of headers
You can allow one or more headers by defining them as a string or an array of strings.

```ts
{
  headers: [
    'Content-Type',
    'Accept',
    'Cookie'
  ]
}
```

---

#### Function
You can also define a function as the value for the `headers` property to decide which headers to allow or disallow at runtime.

The method receives the current header value as the only argument and must return a **boolean** or a **string/array of allowed origins**.

```ts
const ALLOWED_HEADERS = []

{
  headers: (requestHeaders: string) => {
    return ALLOWED_ORIGINS.includes(requestHeaders)
  }
}
```

## Exposed headers
The `exposeHeaders` property controls the headers to expose via [Access-Control-Expose-Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers) header during the preflight request.

```ts
{
  exposeHeaders: [
    'cache-control',
    'content-language',
    'content-type',
    'expires',
    'last-modified',
    'pragma',
  ]
}
```

## Allow credentials
The `credentials` property controls whether or not to set the [Access-Control-Allow-Credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials) header during the preflight request.

```ts
{
  credentials: true
}
```

## Max age
The `maxAge` property controls the [Access-Control-Max-Age](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age) response header. **The value is in seconds**.

- Setting the value to `null` will not set the header.
- Whereas, setting it to `-1` does set the header but disables the cache.

```ts
{
  maxAge: 90
}
```
