---
datetime: 2022-04-24
author: Melchyore
avatarUrl: https://avatars.githubusercontent.com/u/6685773?v=4
summary: Learn how to use Ally with API guard
---

[Ally](https://github.com/adonisjs/ally) is an AdonisJS package to handle social authentication with OAuth providers like Google, Twitter, GitHub, and so on.

Using Ally in MAP (Multi-Page Application) is painless. However, when it comes to SPA (Single-Page Application), things start to get tricky.

Instead of installing packages on your SPA that will handle social authentication, we will use our AdonisJS application as single source of truth.

## Setup Ally
You can read the [official docs](https://docs.adonisjs.com/guides/auth/social) to setup Ally.

Once installed and configured, you will need to configure your provider(s). For the sake of this guide, we will use Google.

## Setup Google provider
Open `config/ally.ts` file and add your client id and client secret. To get your ID and secret, you need to setup a Google OAuth 2.0 application in the [Google developer console](https://console.developers.google.com/) and create credentials for OAuth client using a Google account.

Once your application created, you will have to create credentials. On `Credentials` page, click the `CREATE CREDENTIALS` button and select OAuth Client ID. Select Web Application as Application type. Choose a name for your application. Then, you need to add an URI for `Authorised JavaScript origins`. It **MUST** be the domain of your SPA, in my case, it will be `http://localhost:9000`. Finally, you have to add another URI for the redirection. In the `Authorised redirect URIs`, add an URL like: `http://localhost:9000/auth/google` (it depends on your SPA domain and port, I am using localhost to test if everything is working).

Inside `config/ally.ts`, add the same redirect URL:
```ts
  google: {
    driver: 'google',
    clientId: Env.get('GOOGLE_CLIENT_ID'),
    clientSecret: Env.get('GOOGLE_CLIENT_SECRET'),
    callbackUrl: 'http://localhost:9000/auth/google',
  },
```

## Get redirect URL from server
Using the Google configuration provided above, our AdonisJS application can now generate a redirect URL that can be sent to our SPA.

```ts
Route.get('/:provider/redirect', async ({ ally, auth, response, params }) => {
  if (await auth.check()) {
    return response.notAcceptable()
  }

  return response.send(await ally.use(params.provider).stateless().redirectUrl())
})
```

We can use this route to get the redirect URL for any provider.
The condition will return a response with status code = 406 as we don't want our logged in users to access the redirect URL.

:::note

If you are using Vue as frontend framework, you can send a request to the above route using axios or fetch API inside the callback of **onMounted** hook, get the URL and add it to a button component.

:::

## Handling the callback request
Now that we have our redirect URL, we can access it from the SPA. Click on it, you will be prompted with a consent form where you can choose your Google account. After choosing your account, you will be redirected to the callback URL provided (which is http://localhost:9000/auth/google).

Google provider will add a query to our redirect URL. We will use it to send a request to the server.

```ts
/**
 * Construct URL for the callback route.
 */
const url = new URL('http://localhost:3333/google/callback')

/**
 * Add the query provided by google.
 */
url.search = window.location.search

/**
 * Send the final request. You can use Axios if you want.
 */
const response = await fetch(url.toString(), {
  method: 'GET',
  headers: {
    Accept: 'application/json'
  },
  credentials: 'include'
})
```

Below is the code for the callback route handler.
```ts
import User from 'App/Models/User'

Route.get('/:provider/callback', async ({ ally, auth, response, params }) => {
  /**
   * If user is alrady logged in, do not execute the callback.
   */
  if (await auth.check()) {
    return response.notAcceptable()
  }

  const provider = ally.use(params.provider).stateless()

  /**
   * User has explicitly denied the login request.
   */
  if (provider.accessDenied()) {
    return 'Access was denied'
  }

  /**
   * There was an unknown error during the redirect.
   */
  if (provider.hasError()) {
    return provider.getError()
  }

  const { token } = await provider.accessToken()
  const providerUser = await provider.userFromToken(token)

  /**
   * Insert the user in database if it doesn't exist,
   * otherwise we return it. We are also storing the access token,
   * so we cas use it later for other operations.
   */
  const user = await User.firstOrCreate({
    email: providerUser.email!
  }, {
    accessToken: token,
    isVerified: providerUser.emailVerificationState === 'verified'
  })

  /**
   * Attach a profile to the user with data from provider.
   */
  await user.related('profile').firstOrCreate({
    lastName: providerUser.original.family_name,
    firstName: providerUser.original.given_name,
  })

  const oat = await auth.use('api').login(user, {
    expiresIn: '7days'
  })

  /**
   * Create a cookie where the Opaque Access Token
   * will be stored with maxAge = 7 days.
   */
  response.cookie(
    String(Env.get('API_TOKEN_COOKIE_NAME')),
    oat.token,
    { maxAge: 60 * 60 * 24 * 7, sameSite: 'none', 'secure': true, httpOnly: true }
  )

  /**
   * Everything is OK!
   */
  return response.ok(user)
})
```

So... you are certainly wondering how does it work? In fact, we are using the SPA as an intermediary to pass callback URL to the server. That's all.

## Authorize subsequent requests
In order to check if a user is authenticated for subsequent requests, we can create a new middleware to grab the Opaque Access Token from the cookie and append it to the request headers.

To do so, run this command to generate a new middleware file

```sh
node ace make:middleware SetAuthorizationHeader
```

Then, add the following content

```ts
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Env from '@ioc:Adonis/Core/Env'

export default class SetAuthorizationHeader {
  public async handle ({ request }: HttpContextContract, next: () => Promise<void>) {
    const token = request.cookie(String(Env.get('API_TOKEN_COOKIE_NAME')))

    if (token) {
      request.headers().authorization = `Bearer ${token}`
    }

    await next()
  }
}
```

Finally, you need to register the middleware in the global middleware array, inside `start/kernel.ts`

```ts
Server.middleware.register([
  () => import('@ioc:Adonis/Core/BodyParser'),
  () => import('@ioc:Adonis/Addons/Shield'),
  () => import('App/Middleware/SetAuthorizationHeader'),
  // Other middleware
])
```

Now, you can add the [Auth middleware](https://docs.adonisjs.com/guides/auth/middleware) to a route and it will check the token and grant access or deny if it has expired.
