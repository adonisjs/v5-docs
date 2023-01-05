AdonisJS comes with an inbuilt logger that supports writing logs to a **file**, **standard output**, and **external logging services**. Under the hood, we use [pino](https://getpino.io/#/). Pino is one of the fastest logging libraries in the Node.js ecosystem that generates logs in the [NDJSON format](http://ndjson.org/).

## Usage

To begin, you can import the Logger service anywhere in your application to interact with the Logger.

```ts
import logger from '@adonisjs/core/services/logger'

logger.info('this is an info message')
logger.error({ err: error }, 'Something went wrong')
```

It is recommended to use the `ctx.logger` property during HTTP requests. The HTTP context holds an instance of a request-aware logger that adds the current request id to every log statement.

```ts
import router from '@adonisjs/core/services/router'

router.get('/users/:id', ({ logger, params }) => {
  logger.info('Fetching user by id %s', params.id)
  const user = await User.find(params.id)
})
```

## Configuration

The config for the logger is stored within the `config/logger.ts` file. By default, only one logger is configured. However, you can define config for multiple loggers if you want to use more than one in your application.

```ts
// title: config/logger.ts
import env from '#start/env'
import { defineConfig } from '@adonisjs/core/logger'

export default defineConfig({
  default: 'app',
  
  loggers: {
    app: {
      enabled: true,
      name: Env.get('APP_NAME'),
      level: Env.get('LOG_LEVEL', 'info')
    },
  }
})
```


#### `default`

Specify the name of the `default` logger. The loggers are defined within the same file under the `loggers` object.


---

#### `loggers`

The `loggers` object property defines the config for named loggers. Once you have defined the configuration, you can access the logger instance by calling the `logger.use(NAME)` method.

The config for each named logger is the same as the [config accepted by pino](https://getpino.io/#/docs/api?id=options).

## Transport targets
Transports in pino play an essential role, as they are responsible for writing logs to a destination. You can configure [multiple targets](https://getpino.io/#/docs/api?id=transport-object) within your config file, and pino will deliver logs to all of them. Each target can also specify a level from which it wants to receive the logs.

```ts
{
  loggers: {
    app: {
      enabled: true,
      name: Env.get('APP_NAME'),
      level: Env.get('LOG_LEVEL', 'info'),
      
      // highlight-start
      transport: {
        targets: [
          {
            target: 'pino/file',
            level: 'info',
            options: {
              destination: 1
            }
          },
          {
            target: 'pino-pretty',
            level: 'info',
            options: {}
          },
        ]
      }
      // highlight-end
    }
  }
}
```

- The `pino/file` target writes logs to a file descriptor. The `destination = 1` means write logs to `stdout` (this is a standard [unix convention for file descriptors](https://en.wikipedia.org/wiki/File_descriptor)).
- The `pino-pretty` target uses the [pino-pretty npm module](http://npmjs.com/package/pino-pretty) to pretty-print logs to a file descriptor.

### Defining targets conditionally

It is common to register targets conditionally based on the environment in which the code is running. For example, using the `pino-pretty` target in development and the `pino/file` target in production.


:::danger

#### Not recommended

Conventionally, you can construct an array by defining the `targets` variable and then pushing objects inside it conditionally.

```ts
import app from '@adonisjs/core/services/app'

const list = []

if (app.inDev) {
  list.push({ target: 'pino-pretty', level: 'info' })
}

if (app.inProduction) {
  list.push({ target: 'pino/file', level: 'info' })
}

loggers: {
  app: {
    transport: {
      targets: list
    }
  } 
}
```


:::

:::success

#### Use the `targets` helper

To simplify things, we ship with a `targets` helper method that uses the fluent API for configuring targets conditionally.

```ts
import app from '@adonisjs/core/services/app'
import { targets, defineConfig } from '@adonisjs/core/logger'

const list = targets()
  .if(app.inDev, { target: 'pino-pretty', level: 'info' })
  .if(app.inProduction, { target: 'pino/file', level: 'info' })
  .toArray()

loggers: {
  app: {
    transport: {
      targets: list
    }
  } 
}
```

To further simplify things, you can define the config object for the `pino/file` and `pino-pretty` targets using the `targets.pretty` and `targets.file` methods.

```ts
const list = targets()
  .if(app.inDev, targets.pretty())
  .if(app.inProduction, targets.file())
  .toArray()
```


:::

## Dependency injection

When using Dependency injection, you can type-hint the `Logger` class as a dependency, and the IoC container will automatically resolve an instance of the default logger.

If the class is constructed during an HTTP request, then the container will inject the request-aware instance of the Logger.

```ts
import { inject } from '@adonisjs/core'
import { Logger } from '@adonisjs/core/logger'

@inject()
class UserService {
  constructor(protected logger: Logger) {}

  async find(userId: string | number) {
    this.logger.info('Fetching user by id %s', userId)
    const user = await User.find(userId)
  }
}
```

## Logger API

The Logger API is nearly identical to pino, except the AdonisJS logger is not an instance of an Event emitter (whereas pino is). Apart from that, the logging methods have the same API as pino.

```ts
import logger from '@adonisjs/core/services/logger'

logger.trace(config, 'using config')
logger.debug('user details: %o', { username: 'virk' })
logger.info('hello %s', 'world')
logger.warn('Unable to connect to database')
logger.error({ err: Error }, 'Something went wrong')
logger.fatal({ err: Error }, 'Something went wrong')
```

An additional merging object can be passed as the first argument. The object properties are added to the output JSON.

```ts
logger.info({ user: user }, 'Fetched user by id %s', user.id)
```

When merging errors, set the error key to `err`. The [recommendation](https://getpino.io/#/docs/api?id=serializers-object) comes directly from pino.

```ts
logger.error({ err: error }, 'Unable to lookup user')
```

### Logging conditionally
The logger internally makes sure only to write logs for the levels that are enabled. So, for example, if you have set the logging level to `warn` inside your config file, then the log messages for the `info`, `debug`, and the `trace` levels will be ignored.

However, if computing data for disabled log levels is expensive, you might first consider checking if the log level is enabled or not.

```ts
import logger from '@adonisjs/core/services/logger'

if (logger.isLevelEnabled('debug')) {
  logger.debug(computedData, 'Debug message')
}
```

You may express the same conditional using the `ifLevelEnabled` method. The method accepts a callback as the 2nd argument, which gets executed only when the specified logging level is enabled.

```ts
logger.ifLevelEnabled('debug', () => {
  logger.debug(computedData, 'Debug message')
})
```

### Child logger

A child logger is an isolated instance that inherits the config and bindings from the parent logger.

An instance of the child logger can be created using the `logger.child` method. The method accepts bindings as the first argument and an optional config object as the second argument.

```ts
import logger from '@adonisjs/core/services/logger'

const requestLogger = logger.child({ requestId: ctx.request.id() })
```

The child logger can also log under a different logging level.

```ts
logger.child({}, { level: 'warn' })
```

### Pino statics

[Pino static](https://getpino.io/#/docs/api?id=statics) methods and properties are exported by the `@adonisjs/core/logger` module.

```ts
import { 
  multistream,
  destination,
  transport,
  stdSerializers,
  stdTimeFunctions,
  symbols,
  pinoVersion
} from '@adonisjs/core/logger'
```

## Using multiple loggers

AdonisJS has first-class support for configuring multiple loggers. The logger's unique name and config are defined within the `config/logger.ts` file.

```ts
export default defineConfig({
  default: 'app',
  
  loggers: {
    // highlight-start
    app: {
      enabled: true,
      name: Env.get('APP_NAME'),
      level: Env.get('LOG_LEVEL', 'info')
    },
    payments: {
      enabled: true,
      name: 'payments',
      level: Env.get('LOG_LEVEL', 'info')
    },
    // highlight-start
  }
})
```

Once configured, you can access a named logger using the `Logger.use` method.

```ts
import logger from '@adonisjs/core/services/logger'

logger.use('payments')
logger.use('app')

// Get an instance of the default logger
logger.use()
```

## Writing logs to a file

Pino ships with a `pino/file` target, which you can use to write logs to a file. Within the target options, you can specify the log file destination path.

```ts
app: {
  enabled: true,
  name: Env.get('APP_NAME'),
  level: Env.get('LOG_LEVEL', 'info')

  transport: {
    targets: [
      // highlight-start
      {
        target: 'pino/file',
        level: 'info',
        options: {
          destination: '/var/log/adonisjs/app.log'
        }
      }
      // highlight-end
    ]
  }
}
```

### File rotation
Pino does not have inbuilt support for file rotation, and therefore you either have to use a system-level tool like [logrotate](https://getpino.io/#/docs/help?id=rotate) or make use of a third-party package like [pino-roll](https://github.com/feugy/pino-roll).

```sh
npm i pino-roll
```

```ts
app: {
  enabled: true,
  name: Env.get('APP_NAME'),
  level: Env.get('LOG_LEVEL', 'info')

  transport: {
    targets: [
      // highlight-start
      {
        target: 'pino-roll',
        level: 'info',
        options: {
          file: '/var/log/adonisjs/app.log',
          frequency: 'daily',
          mkdir: true
        }
      }
      // highlight-end
    ]
  }
}
```


## Hiding sensitive values

Logs can usually become the source for leaking sensitive data. Therefore, it is recommended to observe your logs and remove/hide sensitive values from the output.

In Pino, you can use the `redact` option to hide/remove sensitive key-value pairs from the logs. Under the hood, the [fast-redact](https://github.com/davidmarkclements/fast-redact) package is used; therefore, you can consult its documentation for all the available expressions.

```ts
// title: config/logger.ts
app: {
  enabled: true,
  name: Env.get('APP_NAME'),
  level: Env.get('LOG_LEVEL', 'info')

  // highlight-start
  redact: {
    paths: ['password', '*.password']
  }
  // highlight-end
}
```

```ts
import logger from '@adonisjs/core/services/logger'

logger.info({ username: 'virk', password: 'secret' }, 'user signup')
// output: {"username":"virk","password":"[Redacted]","msg":"user signup"}
```

By default, the value is replaced with the `[Redacted]` placeholder. However, you can also define a custom placeholder or remove the key-value pair altogether.

```ts
redact: {
  paths: ['password', '*.password'],
  censor: '[PRIVATE]'
}

// Remove property
redact: {
  paths: ['password', '*.password'],
  remove: true
}
```
