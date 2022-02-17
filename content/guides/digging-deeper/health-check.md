---
summary: Use the health check module to report your application health and status to external monitoring services.
---

The health check module of AdonisJS allows you and the installed packages to report the health of your application. 

Health checks are usually helpful when performing rolling deployments, as you can check the health of the newly deployed code before sending any traffic to it. All major platforms, including: [DigitalOcean Apps](https://docs.digitalocean.com/products/app-platform/concepts/health-check/), [Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) and [Amazon ECS](https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_HealthCheck.html) has support for performing health checks.

## How do health checks work?
The health checks' main goals are to perform operations and ensure that your application will work fine in production. It covers operations like:

- Checking database connectivity
- Making sure all the environment variables are in place to run the app
- The database does not have any pending migrations and so on.

The health checks system **CANNOT** check if your application will cause an error during some specific flow, as that is more of a logical or runtime exception and not something that we can detect beforehand.

## Exposing health checks endpoint
A common practice is to expose an HTTP endpoint that the deployment systems can ping to check the health of your application. You can expose this endpoint by registering a route.

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

The `getReport` method returns a JSON object with the report of all the registered health checkers. The object is formatted as follows:

```ts
{
  healthy: true,
  report: {
    env: {
      displayName: 'Node env check',
      health: {
        healthy: true,
      }
    }
  }
}
```

#### healthy
The top-level `healthy` property tells if all the checks have passed or not. 

---

#### report
The `report` property includes a key-value pair of all the registered health checks and their respective state.

---

#### displayName
The `displayName` sub-property is usually helpful when you visualize the report on a dashboard and want a readable name.

---

#### health
The `health` sub-property includes the health status and an error message (if the report is unhealthy).

```ts
{
  health: {
    healthy: true
  }
}
```

```ts
{
  health: {
    healthy: false,
    message: 'One or more connections are not healthy.'
  }
}
```

---

#### meta
The health checkers can also attach custom metadata to their respective nodes, and the shape of metadata may vary depending upon the checker.

## Existing health checkers
Following is the list of existing health checkers.

### App key checker
The checker is configured implicitly and cannot be disabled. It checks for the existence of the `APP_KEY` environment variable and ensures a minimum length of **32 characters**.

You can generate the app key using the `node ace generate:key` command and then use the output as the value for the `APP_KEY` environment variable.

---

### Node env checker
Checks the existence of the `NODE_ENV` environment variable and fails if it has not been defined explicitly. You should never run your application in *unknown environment*.

---

### Lucid checker
The `@adonisjs/lucid` package allows to optionally enable health checks for a given or all the registered connections. It will then try to [establish a connection](https://github.com/adonisjs/lucid/blob/develop/src/Connection/index.ts#L272) with the database and reports its status.

Make sure to enable health checks for a given connection by modifying the `config/database.ts` file.

```ts
{
  pg: {
    client: 'pg',
    connection: {
      // ... connection details
    },
    healthCheck: true, // 👈 enabled
  }
}
```

The top-level `lucid` node contains an aggregated status of all the registered connections, and the `meta` array includes the individual status of all the connections.

```ts
{
  lucid: {
    displayName: 'Database',
    health: {
      healthy: true,
      message: 'All connections are healthy'
    },
    // highlight-start
    meta: [
      {
        connection: 'pg',
        message: 'Connection is healthy',
        error: null
      }
    ]
    // highlight-end
  }
}
```

In case of an error, the `meta[index].error` property will contain the error stack.

---

### Redis checker
You can also optionally enabled health checks for the `@adonisjs/redis` module by modifying the `config/redis.ts` file.

```ts
{
  local: {
    host: '127.0.0.1',
    port: 6379,
    password: '',
    healthCheck: true // 👈 enabled
  }
}
```

The top-level `redis` node contains an aggregated status of all the registered connections, and the `meta` array includes the individual status of all the connections.

```ts
{
  displayName: 'Redis',
  health: {
    healthy: true,
    message: 'All connections are healthy',
  },
  // highlight-start
  meta: [
    {
      connection: 'local',
      status: 'ready',
      used_memory: '1.00M',
      error: null
    }
  ]
  // highlight-end
}
```

In case of an error, the `meta[index].error` property will contain the error stack, and the `used_memory` property will be set to `null`.

## Adding a custom health checker
You can also register your custom health checkers within your application codebase or provide them as a package. You can register it inside the `boot` method of a service provider. 

The `addChecker` method takes a unique name for the checker and a callback function that performs the health check and returns the report.

```ts

import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public async boot() {
    // highlight-start
    const HealthCheck = this.app.container.use('Adonis/Core/HealthCheck')

    HealthCheck.addChecker('my-checker', async () => {
      return {
        displayName: 'Checker Name',
        health: {
          healthy: true,
          message: 'Everything works fine'
        },
        meta: {},
      }
    })
    // highlight-end
  }
}
```
