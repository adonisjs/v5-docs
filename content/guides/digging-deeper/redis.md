---
summary: Use the Redis module of AdonisJS to interact with a Redis database.
---

AdonisJS has its own first party package for working with Redis databases. It internally uses [ioredis](https://github.com/luin/ioredis) but improves the **pub/sub layer** and provides first class support for **connections management** and **health checks**.

The first step is  to install and configure the package using the following instructions.

:::div{class="setup"}

:::codegroup

```sh
// title: 1. Install
npm i @adonisjs/redis@7.3.4
```

```sh
// title: 2. Configure
node ace configure @adonisjs/redis

# CREATE: config/redis.ts
# CREATE: contracts/redis.ts
# UPDATE: .env
# UPDATE: tsconfig.json { types += "@adonisjs/redis" }
# UPDATE: .adonisrc.json { providers += "@adonisjs/redis" }
```

```ts
// title: 3. Validate environment variables  
/**
 * Make sure to add the following validation rules to the
 * `env.ts` file to validate the environment variables.
 */
export default Env.rules({
  // ...existing rules
  REDIS_CONNECTION: Env.schema.enum(['local'] as const),
  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PORT: Env.schema.number(),
  REDIS_PASSWORD: Env.schema.string.optional(),
})
```

:::


:::div{class="features"}

- Improved pub/sub support
- Boilerplate free multiple connections management
- Inbuilt health checks

&nbsp;

- [View on npm](https://npm.im/@adonisjs/redis)
- [View on GitHub](https://github.com/adonisjs/redis)

:::


## Configuration
The configuration for redis is stored inside `config/redis.ts` file. You can define one or more named connections inside this file and their lifecycle will be managed automatically for you.

```ts
import { redisConfig } from '@adonisjs/redis/build/config'

export default redisConfig({
  connection: Env.get('REDIS_CONNECTION'),

  connections: {
    local: {
      host: Env.get('REDIS_HOST'),
      port: Env.get('REDIS_PORT'),
      password: Env.get('REDIS_PASSWORD', ''),
      db: 0,
      keyPrefix: '',
    },
  },
})
```

#### connection
Default connection to use for making all redis queries. The connection value is inferred from the `REDIS_CONNECTION` environment variable.

---

#### connections
A list of available connections that you are planning to use in your application. Feel free to add/remove connections from this object.

## Usage
Once the setup has been done, you can import the module and execute redis commands. All the methods from [ioredis](https://github.com/luin/ioredis) are supported as it is by the AdonisJS redis module.

```ts
import Redis from '@ioc:Adonis/Addons/Redis'

await Redis.set('foo', 'bar')
const value = await Redis.get('foo')
```

You can switch between connections using the `Redis.connection` method. We create/manage singleton instances for every connection and use it throughout the lifecycle of the application.

```ts
import Redis from '@ioc:Adonis/Addons/Redis'

await Redis
  .connection('session') // 👈 Switching connection
  .set('foo', 'bar')
```

## Pub/Sub
Redis forces you to maintain two separate connections when using `pub/sub`, where the subscriber uses a dedicated connection just listening for new messages.

In AdonisJS,  we have improved the API of pub/sub and manage the subscriber connection internally for you, so that you don't have to create and manage it manually.

For demonstration, lets create a pub/sub channel for tracking user signups. Begin by creating a new preload file by executing the following Ace command.

```sh
node ace make:prldfile redis

# ✔  create    start/redis.ts
```

Open the newly created file and paste the following code snippet inside it.

```ts
// title: start/redis.ts
import Redis from '@ioc:Adonis/Addons/Redis'

Redis.subscribe('user:signup', (user: string) => {
  console.log(JSON.parse(user))
})
```

Next, create a dummy route to publish to the `user:signup` channel on every new HTTP request.

```ts
// title: start/routes.ts
import Route from '@ioc:Adonis/Core/Route'
import Redis from '@ioc:Adonis/Addons/Redis'

Route.get('/signup', async () => {
  await Redis.publish('user:signup', JSON.stringify({ id: 1 }))

  return 'handled'
})
```

- The `Redis.subscribe` method listens for messages on a given channel. 
- The `Redis.publish` method is used to publish events to a given channel.
- The messages are passed as string, since Redis doesn't support other data types during Pub/sub.


### Pattern pub/sub
Redis also supports pub/sub using patterns. Instead of `subscribe`, you have to use the `psubscribe` method.

```ts
Redis.psubscribe('user:*', (event: string, user: string) => {
  console.log(event, JSON.stringify(user))
})
```

## Health checks
The Redis module uses the AdonisJS [health check](./health-check.md) module to report the connections health. All you need to do is enable it inside the config file.

```ts
// title: config/redis.ts
{
  local: {
    host: Env.get('REDIS_HOST', '127.0.0.1') as string,
    port: Env.get('REDIS_PORT', '6379') as string,
    password: Env.get('REDIS_PASSWORD', '') as string,
    db: 0,
    keyPrefix: '',
    healthCheck: true, // 👈 health check
  },
}
```

Now, you can use the health check module to view the status of your redis connections.

```ts
import Route from '@ioc:Adonis/Core/Route'
import HealthCheck from '@ioc:Adonis/Core/HealthCheck'

Route.get('health', async ({ response }) => {
  const report = await HealthCheck.getReport()
  
  return report.healthy
    ? response.ok(report)
    : response.badRequest(report)
})
```

!["Unhealthy connection report"](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1618204027/v5/redis-connection-health-check.png)

## Closing connections
You can close the redis connections using one of the following methods.

### quit
The `quit` method closes the redis connection gracefully. This method will wait for all queued commands to finish.

```ts
await Redis.quit()
await Redis.connection('name').quit()
```

---

### disconnect
The `disconnect` method doesn't wait for existing commands to finish and will disrupt the connection immediately.

```ts
await Redis.disconnect()
await Redis.connection('name').disconnect()
```

---

### quitAll
Similar to `quit`, but quits all the connections

```ts
await Redis.quitAll()
```

---

### disconnectAll
Similar to `disconnect`, but disconnects all the connections.

```ts
await Redis.disconnectAll()
```
