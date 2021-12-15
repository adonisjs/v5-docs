---
summary: Guard routes from unauthenticated users using the Auth middleware
---

During the setup process, the auth package creates the following two middleware inside the `./app/Middleware` directory. You can use these middleware to guard the routes against the un-authenticated requests.

## Auth middleware
The auth middleware is stored inside the `app/Middleware/Auth.ts` file. You must register it as a named middleware inside the `start/kernel.ts` file.

```ts
// title: start/kernel.ts
Server.middleware.registerNamed({
  auth: () => import('App/Middleware/Auth')
})
```

Once registered, you can attach the `auth` middleware to the application routes. For example:

```ts
Route.group(() => {
  
}).middleware('auth')
```

The auth middleware optionally accepts the guards to use for authenticating the current request. It will loop over all the defined guards and stops when any of the guards is able to authenticate the request.

- The request continues when the request is authenticated
- Otherwise, the [AuthenticationException](https://github.com/adonisjs/auth/blob/develop/src/Exceptions/AuthenticationException.ts) is raised. The exception uses [content negotiation](https://github.com/adonisjs/auth/blob/develop/src/Exceptions/AuthenticationException.ts#L113-L149) to make the response.

```ts
Route.group(() => {
  
}).middleware('auth:web,api')
```

## Silent Auth middleware
The silent auth middleware silently checks if the user is logged-in or not. The request still continues as usual, even when the user is not logged-in.

This middleware is helpful when you want to render a public webpage, but also show the currently logged in user details somewhere in the page (maybe the header).

To summarize, this middleware does not force the users to be logged-in, but will fetch their details if they are logged-in and provide it you through out the request lifecycle.

If you plan to use this middleware, then you must register it inside the list of global middleware.

```ts
// title: start/kernel.ts
Server.middleware.register([
  () => import('@ioc:Adonis/Core/BodyParser'),
  // highlight-start
  () => import('App/Middleware/SilentAuth')
  // highlight-end
])
```
