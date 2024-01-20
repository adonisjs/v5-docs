AdonisJS ships with an official package (`@adonisjs/limiter`) to help you implement rate limiting within your applications.

The package must be installed and configured separately.

:::div{class="setup"}

:::codegroup

```sh
// title: 1. Install
npm i @adonisjs/limiter@1.0.2
```

```sh
// title: 2. Configure
node ace configure @adonisjs/limiter

# CREATE:  config/limiter.ts
# CREATE:  contracts/limiter.ts
# CREATE:  start/limiter.ts
# UPDATE: .adonisrc.json { providers += "@adonisjs/limiter" }
```

```ts
// title: 3. Register throttle middleware
/**
 * Make sure to add the following named middleware inside
 * the start/kernel.ts file
 */
Server.middleware.registerNamed({
  throttle: () => import('@adonisjs/limiter/build/throttle'),
})
```

:::


:::div{class="features"}

- Support for multiple storage backends. **Redis**, **PostgreSQL/MySQL** and **Memory**.
- Atomic increments
- Extensible API to add custom storage backends.
- Built on top of [rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible)

&nbsp;

- [View on npm](https://npm.im/@adonisjs/limiter)
- [View on GitHub](https://github.com/adonisjs/limiter)

:::

## Configuration
The configuration for the rate limiter is stored inside the `config/limiter.ts` file. Inside this file, you can define one or multiple stores to persist the limiter data. 

```ts
import { limiterConfig } from '@adonisjs/limiter/build/config'

export default limiterConfig({
  default: 'redis',
  stores: {
    redis: {
      client: 'redis',
      connectionName: 'local'
    }
  },
})
```

#### default
The `default` property is used to pick the default store for reading and writing limiter data.

---

#### stores
You can define multiple named stores within the `stores` object. Usually, you will be using only one store. However, there is a possibility to define multiple stores to meet the scaling needs of your application.

---

#### Redis store
The Redis store relies on the `@adonisjs/redis` package. Therefore, make sure to install and configure it first.

The redis connection details are defined inside the `config/redis.ts` file. In addition, you must mention the connection's name in the limiter's config file.

---

#### Database store
The Database store relies on the `@adonisjs/lucid` package. Therefore, make sure to install and configure it first.

The database connection details are defined inside the `config/database.ts` file. In addition, you should mention the connection's name inside the limiter's config file.

```ts
export default limiterConfig({
  default: 'db',
  stores: {
    db: {
      client: 'db',
      dbName: 'database_name',
      tableName: 'rate_limits',
      connectionName: 'connection_name',
      clearExpiredByTimeout: true,
    }
  }
})
```

If you decide to use the database store, you must create the `rate_limits` table using the following schema class.

```sh
node ace make:migration rate_limits
```

```ts
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'rate_limits'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('key', 255).notNullable().primary()
      table.integer('points', 9).notNullable()
      table.bigint('expire').unsigned()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## Rate limiting HTTP requests
You can rate limit incoming HTTP requests by defining the limiter conditions at runtime based upon the user IP address, user id, or any other unique identifier.

You can define the rate limit conditions within the `start/limiter.ts` file using the `Limiter.define` method.

- The first argument is the limiter's unique name.
- The second argument is the callback function that returns the config for the limiter. The callback receives the [HTTP context](../http/context.md) as the only argument.

```ts
// title: start/limiter.ts
import { Limiter } from '@adonisjs/limiter/build/services'

export const { limiters } = Limiter
  .define('global', (ctx) => {
    return Limiter.allowRequests(1000).every('1 min')
  })
```

Once you have defined a limiter, you can apply it on a route using the `throttle` middleware.

```ts
Route
  .get('/posts', 'PostsController.index')
  .middleware('throttle:global')
```

### Changing the throttle key
By default, we apply the rate limit on the request IP address. However, you can change to it any other identification key. For example, you can use the user id as the throttle key.

```ts
export const { limiters } = Limiter
  .define('global', function ({ auth }) {
    if (auth.user) {
      return Limiter
        .allowRequests(5000)
        .every('1 min')
        .usingKey(user.id) // 👈 using user id as the key
    }

    // Defaults to IP address
    return Limiter
      .allowRequests(1000)
      .every('1 min')
  })
```

### Changing the throttle response
You can change the throttle exception message by capturing the raised exception and mutating its properties. For example:

```ts
export const { limiters } = Limiter
  .define('main', function (ctx) {
    return Limiter
      .allowRequests(1000)
      .every('1 min')
      // highlight-start
      .limitExceeded((error) => {
        error.message = 'Rate limit exceeded'
        error.status = 429

        // A key-value pair of headers to set on the response
        console.log(error.headers)
      })
      // highlight-end
  })
```

### Allowing unlimited requests
You can allow unlimited requests for a given user or IP address by returning the `Limiter.noLimit()` return value from the callback. For example, allow unlimited calls for a premium client.

```ts
export const { limiters } = Limiter
  .define('main', ({ auth }) => {
    if (auth.user && await auth.user.membership() === 'premium') {
      return Limiter.noLimit()
    }

    return Limiter
      .allowRequests(1000)
      .every('1 min')
      .usingKey(user.id)
  })
```

### Switching between stores
You can specify the store you want to use by calling the `store` method.

```ts
export const { limiters } = Limiter
  .define('main', function (ctx) {
    return Limiter
      .allowRequests(1000)
      .every('1 min')
      // highlight-start
      .store('redis')
      // highlight-end
  })
```

## Login endpoint brute force protection
Login endpoints usually become the victim of brute force attacks. However, with the help of the rate limiter, you can minimize the risk of brute force by blocking the user's IP address after several login failures.

:::note
Feel free to tweak the block duration and number of allowed attempts per your application requirements.
:::

In the following example, we use the Limiter APIs to consume one request on login failure manually.

```ts
Route.post('login', 'AuthController.store')
```

```ts
import { Limiter } from '@adonisjs/limiter/build/services'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {
  public async store({ auth, request, response }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    // highlight-start
    // Step 1
    const throttleKey = `login_${email}_${request.ip()}`
    // highlight-end

    // highlight-start
    // Step 2
    const limiter = Limiter.use({
      requests: 10,
      duration: '15 mins',
      blockDuration: '30 mins',
    })
    // highlight-end

    // highlight-start
    // Step 3
    if (await limiter.isBlocked(throttleKey)) {
      return response.tooManyRequests('Login attempts exhausted. Please try after some time')
    }

    // highlight-end

    try {
      await auth.attempt(email, password)
    } catch (error) {
      // highlight-start
      // Step 4
      await limiter.increment(throttleKey)
      // highlight-end
      throw error
    }

    // highlight-start
    // Step 5
    await limiter.delete(throttleKey)
    // highlight-end
  }
}
```

1. The first step is to create a unique key using the email and the IP address. We also prefix the key with the action being performed.
2. Next, we create an instance of limiter allowing **10 failed login attempts** within the **window of 15 minutes**. If the user exhausts all the attempts, we will block them for the next **30 minutes**.
3. Before trying to log in, we check if the `throttleKey` has been blocked. If it is blocked, we return early by denying the request.
4. If the user login fails, we will increment the counter and re-throw the exception.
5. On successful login, we will delete the user attempts from the storage.

## Limiter manager API
Following is the list of available methods and properties on the Limiter manager class.

You can import the limiter manager as follows.

```ts
import { Limiter } from '@adonisjs/limiters/services'
```

---

### use
Create a limiter instance with the allowed number of requests and the duration. Optionally, you can also specify the backend store. The default store set inside the `start/limiter.ts` file will be used if not defined.

```ts
import { Limiter } from '@adonisjs/limiters/services'

const limiter = Limiter.use({
  request: 100,
  every: '1 min',
})

// Use a specific store
const limiter = Limiter.use('db', {
  request: 100,
  every: '1 min',
})
```

---

You can also define the block duration to block the user from making any more requests after they have exhausted their limit. You should consider blocking when trying to prevent specific endpoints from brute force attacks.

```ts
const limiter = Limiter.use({
  request: 100,
  every: '1 min',
  /**
   * Use will be blocked for 30mins once they
   * make 100 requests within one minute
   */
  blockDuration: '30 mins'
})
```

---

### define
Define a named limiter to be used during HTTP requests. The method accepts the limiter name as the first argument and a callback function as the second argument.

```ts
Limiter.define('global', (ctx) => {
  return Limiter.allowRequests(1000).every('1 min')
})
```

Since you have access to the current request HTTP context, you can dynamically apply different request limits based upon the logged-in user or an IP address.

---

### allowRequests
The `allowRequests` method creates an instance of the [Config builder](#limiter-config-builder). You can use the config builder further to define the duration of requests and the block duration.

```ts
Limiter.allowRequests(1000) // returns new HttpLimiterConfigBuilder()
```

---

### noLimit
The `noLimit` method is a descriptive way to not apply any limit on the current request by returning `null` from the limiter callback.

## Limiter API
Following is the list of available methods you can call on the Limiter to manually implement rate limiting within your app.

You can access the limiter instance using the `Limiter.use` method.

```ts
import { Limiter } from '@adonisjs/limiters/services'

const limiter = Limiter.use({
  request: 10,
  every: '15 mins',
})

// Use a specific store
const limiter = Limiter.use('db', {
  request: 10,
  every: '15 mins',
})
```

---

### get
Get the metadata of a given key. The method returns `null` if no requests have been consumed on the given key yet.

```ts
const response = await limiter.get(`global_${user.id}`)
if (!response) {
  // no requests consumed yet
}

response.remaining // Remaining number of requests
response.limit // Allowed number of requests
response.consumed // Requests consumed so far
response.retryAfter // Milliseconds to wait before limit gets revised
```

---

### remaining
Get the number of remaining requests for a given key.

```ts
if (await limiter.remaining(`global_${user.id}`)) {
  // key has requests remaining
}
```

---

### consume
Consume one request for the given key. The method raised an exception when all requests have already been consumed.

```ts
try {
  const response = await limiter.consume(`global_${user.id}`)
  // response is same as "limiter.get" response
} catch (error) {
  console.log(error instanceof ThrottleException)
  console.log(error.status)
  console.log(error.message)
  console.log(error.headers)
  console.log(error.limit)
  console.log(error.retryAfter)
}
```

---

### delete
Delete the key from the storage. Deleting a key will essentially revise the consumed requests.

```ts
await limiter.delete(`global_${user.id}`)
```

---

### block
Block a given key for the mentioned duration. For example, setting the duration to `0` will block the key forever. Blocking is usually helpful to slow down brute force attacks.

```ts
await limiter.block(`login_${email}_${ip}`, '30 mins')
```

---

### increment
Increment the count of consumed requests by one. The method is same as the `consume` method. However, it does not raise an exception when the limit is exhausted.

```ts
await limiter.increment(`global_${user.id}`)
```

---

### isBlocked
Check if the key is blocked from making any more requests. The [rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible) package does not have any special flag to know if a key is blocked, therefore we check if the consumed requests is greater than the allowed requests to find if the key is blocked or not.

```ts
if (await limiter.isBlocked(`global_${user.id}`)) {
  // consumed more than allowed limit
}
```

## Limiter config builder
The config builder allows you to use the fluent method chaining and create the config that you can use to apply the rate limit during HTTP requests.

You can access an instance of the config builder by calling the `allowRequests` method on the Limiter manager.

```ts
import { Limiter } from '@adonisjs/limiters/services'
Limiter.allowRequests(1000)
```

### allowRequests
Define the number of requests to be allowed for the given time duration.

---

### every
Define the time duration. Either you can specify the time in milliseconds or define a string expression supported by the [ms](https://npm.im/ms) package.

---

### limitExceeded
Define the callback to mutate the error raised when the request exceeds the number of allowed requests.

---

```ts
Limiter
  .allowRequests(1000)
  .limitExceeded((error) => {
    console.log(error instanceof ThrottleException)
    console.log(error.status)
    console.log(error.message)
    console.log(error.headers)
    console.log(error.limit)
    console.log(error.retryAfter)
  })
```

---

### store
Specify the backend store to use for persisting limiter data.

```ts
Limiter
  .allowRequests(1000)
  .store('db')
```

---

### usingKey
Define a custom key for throttling the requests. By default, the IP address is used.

```ts
Limiter
  .allowRequest(1000)
  .usingKey(user.id)
```
