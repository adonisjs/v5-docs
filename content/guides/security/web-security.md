---
summary: A complete guide to securing web applications in AdonisJS
---

You can protect your web applications from common web attacks like **CSRF**, **XSS**, **content sniffing** and more using the `@adonisjs/shield` package. 

It is recommended to use this package when creating a server-rendered app using AdonisJS.

If you are using AdonisJS to create an API server, then you must rely on your frontend framework's security layer.

:::div{class="setup"}

:::codegroup

```sh
// title: 1. Install
npm i @adonisjs/shield
```

```sh
// title: 2. Configure
node ace configure @adonisjs/shield
```

```ts
// title: 3. Register middleware
// Add following to start/kernel.ts

Server.middleware.register([
  () => import('@ioc:Adonis/Core/BodyParser'),
  // highlight-start
  () => import('@ioc:Adonis/Addons/Shield')
  // highlight-end
])
```

:::


## CSRF protection
[CSRF (Cross-Site Request Forgery)](https://owasp.org/www-community/attacks/csrf) is an attack that tricks the user of your web apps to perform form submissions without their explicit consent.

To protect against the CSRF attacks, your application should be able to distinguish between the form submissions triggered by your app vs. some other malicious website.

AdonisJS generates a unique token (known as CSRF token) for every HTTP request and associates it with the user session for later verification. Since, the token is generated on the backend, the malicious website has no way of getting access to it.

The token must be present alongside the other form fields in order for CSRF check to pass. You can access it using the `csrfField` inside your Edge templates.

```edge
<form action="{{ route('PostsController.store') }}" method="post">
  // highlight-start
  {{ csrfField() }}
  // highlight-end

  <div>
    <label for="title">Post title</label>
    <input type="text" name="title">
  </div>
  <hr>

  <button type="submit">Create Post</button>
</form>
```

That is all you need to do.

### Configuration
The shield middleware relies on the config stored inside the `config/shield.ts` file. Feel free to tweak the configuration options as per your requirements.

```ts
export const csrf: ShieldConfig['csrf'] = {
  enabled: true,
  exceptRoutes: [],
  enableXsrfCookie: true,
  methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  cookieOptions:  {
    domain: '',
    path: '/',
    maxAge: '2h',
    httpOnly: true,
    secure: false,
    sameSite: false,
  }
}
```

#### enabled
Enable/disable the CSRF protection all together. You may find yourself disabling it during tests when hitting the form endpoints directly.

---

#### exceptRoutes
Ignore certain routes from being validated for the CSRF token. You may find it useful, when creating a hybrid app with API endpoints and the server rendered forms by exempting API endpoints from CSRF token validation.

```ts
{
  exceptRoutes: [
    '/api/users',
    '/api/users/:id',
    '/api/posts'
  ]
}
```

For more advanced use cases, you can register a function and dynamically filter routes from being validated.

```ts
{
  exceptRoutes: (ctx) => {
    // ignore all routes starting with /api/
    return ctx.request.url().includes('/api/')
  }
}
```

---

#### methods
HTTP methods to validate for the availability of the CSRF token. You must add all the HTTP verbs you are using to handle form submissions.

```ts
{
  methods: ['POST', 'PUT', 'PATCH', 'DELETE']
}
```

---

#### enableXsrfCookie
Setting the value to `true` instructs the shield middleware to read the CSRF token from the `X-XSRF-TOKEN` header. Read the [Ajax form submissions](#ajax-form-submissions) section to learn more.

---

#### cookieOptions
An object of cookie options. Read the [Cookie](../http/cookies.md) section to learn more.

---

### CSRF token for SPA
The Single page applications render forms on the frontend and hence they do not have access to the `csrfField` view global. However, you can read the token value from the `XSRF-TOKEN` cookie and send it to the server via `X-XSRF-TOKEN` header.

The cookie technique is already widely supported by frameworks like [Angular](https://angular.io/api/common/http/HttpClientXsrfModule) and request libraries like axios.

However, do make sure to enable the cookie feature by setting the value of `enableXsrfCookie = true` inside the `config/shield.ts` file.

### CSRF token for RESTful APIs
If you are creating RESTful API server, then you don't need CSRF protection, unless you are relying on cookies for user authentication. If you are relying on cookies for authentication, then simply follow the instructions of [CSRF token for SPA](#csrf-token-for-spa) section.

## CSP
[CSP (Content security policy)](https://content-security-policy.com) helps you define the trusted sources for loading and executing **scripts**, **styles**, **fonts**, etc and reduce the risk of XSS attacks.

You can configure the CSP header by tweaking the configuration options inside the `config/shield.ts` file.

```ts
// title: config/shield.ts
export const csp: ShieldConfig['csp'] = {
  enabled: false,
  directives: {},
  reportOnly: false,
}
```

#### enabled
Enable/disable CSP protection all together.

---

#### directives
Configure the CSP header directives. We recommend reading about them on [https://content-security-policy.com](https://content-security-policy.com/#directive). The `dash-case` directive names are defined as `camelCase` inside the shield config file.


<!-- About the quotes around 'self': https://github.com/adonisjs/core/discussions/3233 -->
```ts
directives: {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com', '@nonce'],
  fontSrc: ["'self'", 'https://fonts.googleapis.com'],
}
```

---

#### reportOnly
Set the value to true, if you want the CSP violations to result in a warning rather than an error. [Learn more](https://content-security-policy.com/report-only/).

---

### CSP nonce
To define [nonce-based](https://content-security-policy.com/nonce/) inline script and style tags, you have to make use of the `@nonce` keyword.

```ts
directives: {
  scriptSrc: ["'self'", '@nonce'],
}
```

Next, make use of the `cspNonce` view helper to define the nonce attribute on the inline script and style tags.

```edge
<script nonce="{{ cspNonce }}">
</script>
```

You can also access the `nonce` attribute using the `response.nonce` property.

```ts
Route.get('/', ({ response }) => {
  return {
    nonce: response.nonce
  }
})
```

## DNS prefetching
Using the `dnsPrefetch` setting from the `config/shield.ts` file, you can control the behavior for the [X-DNS-Prefetch-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control) header.

```ts
export const dnsPrefetch: ShieldConfig['dnsPrefetch'] = {
  enabled: true,
  allow: true,
}
```

#### enabled
Enable/disable the header all together.

---

#### allow
Setting the value to true will define the `X-DNS-Prefetch-Control` header with the value `'on'`, otherwise `'off'` value is defined.

## Frame guard
The `xFrame` config property manages the [X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options) header.

```ts
export const xFrame: ShieldConfig['xFrame'] = {
  enabled: true,
  action: 'DENY',
}
```

#### enabled
Enable/disable the header all together.

---

#### action
Define the header value. It must be one from `DENY`, `SAMEORIGIN` or `ALLOW-FROM`. The `ALLOW-FROM` action also needs the domain name to allow.

```ts
{
  enabled: true,
  action: 'ALLOW-FROM',
  domain: 'foo.com'
}
```

## HSTS
Control whether or not the website should be accessible via HTTP  using the [Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) header.

The configuration for HSTS is stored inside the `config/shield.ts` file.

```ts
export const hsts: ShieldConfig['hsts'] = {
  enabled: true,
  maxAge: '180 days',
  includeSubDomains: true,
  preload: false,
}
```

#### enabled
Enable/disable the `Strict-Transport-Security` all together.

---

#### maxAge
Define how long the browser should remember the header value.

---

#### includeSubDomains
When set to `true`, the rule will be applied to site's subdomains as well.

---

#### preload
Whether or not to preload the header value from the HSTS preload service. [Learn more](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security#preloading_strict_transport_security)

## No sniffing
Using the `contentTypeSniffing` setting you can control the behavior for the [X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options) header.

The header is only set when the `enabled` property is set to true.

```ts
export const contentTypeSniffing: ShieldConfig['contentTypeSniffing'] = {
  enabled: true,
}
```
