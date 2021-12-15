---
summary: Reference to the logger module of AdonisJS.
---

The core of the framework ships with an inbuilt logger built on top of [Pino](https://getpino.io/#/)(one of the fastest logging libraries for Node.js). You can import and use the Logger as follows:

```ts
import Logger from '@ioc:Adonis/Core/Logger'

Logger.info('A info message')
Logger.warn('A warning')
```

During an HTTP request, you must use the `ctx.logger` object. It is an isolated child instance of the logger that adds the unique request-id to all the log messages.

:::note

Make sure to enable request id generation by setting `generateRequestId = true` inside `config/app.ts` file.

:::

```ts
Route.get('/', async ({ logger }) => {
  logger.info('An info message')
  return 'handled'
})
```

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,w_700,f_auto,fl_lossy/v1592211987/adonisjs.com/http-logger.png)

## Config
The configuration for the logger is stored inside the `config/app.ts` file under the `logger` export. The options are the same [as documented by Pino](https://getpino.io/#/docs/api?id=options).

Following the bare minimum options required to configure the logger:

```ts
{
  name: Env.get('APP_NAME'),
  enabled: true,
  level: Env.get('LOG_LEVEL', 'info'),
  redact: {
    paths: ['password', '*.password'],
  },
  prettyPrint: Env.get('NODE_ENV') === 'development',
}
```

#### name
The name of the logger. The `APP_NAME` environment variable uses the `name` property inside the package.json file.

---

#### enabled
Toggle switch to enable/disable the logger

---

#### level
The current logging level. It is derived from the `LOG_LEVEL` environment variable.

---

#### redact
Remove/redact sensitive paths from the logging output. Read the [Redact section](#redact-values).

---

#### prettyPrint
Whether or not to pretty-print the logs. We recommend turning off pretty printing in production, as it has some performance overhead.

## How does AdonisJS Logger work?
Since Node.js is a single-threaded event-loop, it is very important to keep the main thread free from any extra work required to process or reformat logs. 

For this very reason, we opted for [Pino](https://getpino.io/), which does not perform any in-process log formatting and instead encourages you to use a separate process for that. In a nutshell, this is how logging works.

1. You can log at different levels using the Logger API, for example: `Logger.info('some message')`.
2. The logs are always sent out to `stdout`.
3. You can redirect the `stdout` stream to a file or use a separate process to read and format them.

## Logging in development
Since logs are always written to `stdout`, there is nothing special required in the development environment. Also, AdonisJS will automatically [pretty print](https://github.com/pinojs/pino-pretty) the logs when `NODE_ENV=development`.

## Logging in production
In production, you would want to stream your logs to an external service like Datadog or Papertrail. Following are some of the ways to send logs to an external service.

:::note

There is an additional operational overhead of piping the stdout stream to a service. But, the trade-off is worth the performance boost you receive. Make sure to check [Pino benchmarks](https://getpino.io/#/docs/benchmarks) as well.

:::

### Using Pino transports
The simplest way to process the `stdout` stream is to use [Pino transports](https://getpino.io/#/docs/transports?id=known-transports). All you need to do is pipe the output to the transport of your choice. 

For demonstration, let's install the `pino-datadog package to send logs to Datadog.

```sh
npm i pino-datadog
```

Next, start the production server and pipe the `stdout` output to `pino-datadog`.

```sh
node build/server.js | ./node_modules/.bin/pino-datadog --key DD_API_KEY
```

### Streaming to a file
Another approach is to forward the output of `stdout` to a physical file on the disk and then configure your logging service to read and rotate the log files.

```sh
node build/server.js >> app.log
```

Now, configure your logging service to read logs from the `app.log` file.

## Redact values
You can redact/remove sensitive values from the logging output by defining a path to the keys to remove. For example: Removing user password from the logging output.

```ts
// title: config/app.ts
{
  redact: {
    paths: ['password'],
  }
}
```

The above config will remove the password from the merging object.

```ts
Logger.info({ username: 'virk', password: 'secret' }, 'user signup')
// output: {"username":"virk","password":"[Redacted]","msg":"user signup"}
```

You can define a custom placeholder for the redacted values or remove them altogether from the output.

```ts
{
  redact: {
    paths: ['password'],
    censor: '[PRIVATE]'    
  }
}

// or remove the property
{
  redact: {
    paths: ['password'],
    remove: true
  }
}
```

Check out the [fast-redact](https://github.com/davidmarkclements/fast-redact) package to view the expressions available for the paths array.

## Logger API
Following is the list of available methods/properties on the Logger module. All of the logging methods accept the following arguments.

- The first argument can be a string message or an object of properties to merge with the final log message.
- If the first argument was a merging object, then the second argument is the string message.
- Rest of the parameters are the interpolation values for the message placeholders.

```ts
import Logger from '@ioc:Adonis/Core/Logger'

Logger.info('hello %s', 'world')
// output: {"msg": "hello world"}

Logger.info('user details: %o', { username: 'virk' })
// output: {"msg":"user details: {\"username\":\"virk\"}"
```

Define a merging object as follows:

```ts
import Logger from '@ioc:Adonis/Core/Logger'

Logger.info({ username: 'virk' }, 'user signup')
// output: {"username":"virk","msg":"user signup"}
```

You can pass error objects under the `err` key.

```ts
import Logger from '@ioc:Adonis/Core/Logger'

Logger.error({ err: new Error('signup failed') }, 'user signup')
// output: {"err":{"type":"Error","message":"foo","stack":"..."},"msg":"user signup"}
```

Following is the list of logging methods.

- `Logger.trace`
- `Logger.debug`
- `Logger.info`
- `Logger.warn`
- `Logger.error`
- `Logger.fatal`

---

### isLevelEnabled
Find if a given logging level is enabled inside the config file.

```ts
Logger.isLevelEnabled('info')
Logger.isLevelEnabled('trace')
```

---

### bindings
Returns an object containing all the current bindings, cloned from the ones passed in via `Logger.child()`.

```ts
Logger.bindings()
```

---

### child
Create a child logger instance. You can create the child logger with a different logging level as well.

```ts
const childLogger = Logger.child({ level: 'trace' })
childLogger.info('an info message')
```

You can also define custom bindings for a child logger. The bindings are added to the logging output.

```ts
const childLogger = Logger.child({ userId: user.id })
childLogger.info('an info message')
```

---

### level
The current logging level value, as a string.

```ts
console.log(Logger.level)
// info
```

---

### levelNumber
The current logging level value, as a number.

```ts
console.log(Logger.levelNumber)
// 30
```

---

### levels
An object of logging `labels` and `values`.

```ts
console.log(Logger.levels)

/**
  {
    labels: {
      '10': 'trace',
      '20': 'debug',
      '30': 'info',
      '40': 'warn',
      '50': 'error',
      '60': 'fatal'
    },
    values: {
      trace: 10,
      debug: 20,
      info: 30,
      warn: 40,
      error: 50,
      fatal: 60
    }
  }
 */
```

---

### pinoVersion
The version of Pino.

```ts
console.log(Logger.pinoVersion)

// '6.11.2'
```
