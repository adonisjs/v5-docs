The core of the framework ships with an inbuilt logger built on top of [pino](https://getpino.io/#/)(one of the fastest logging libraries for Node.js). You can import and use the Logger as follows:

```ts
import Logger from '@ioc:Adonis/Core/Logger'

Logger.info('A info message')
Logger.warn('A warning')
```

During an HTTP request, you must use the `ctx.logger` object. It is an isolated child instance of the logger that adds the unique request id to all the log messages.

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
The configuration for the logger is stored inside the `config/app.ts` file under the `logger` export. The options are same as documented by [pino logger](https://getpino.io/#/docs/api?id=options).

Following the bare minimum options required to configure the logger.

```ts
{
  name: Env.get('APP_NAME'),
  enabled: true,
  level: Env.get('LOG_LEVEL', 'info'),
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

#### prettyPrint
Whether or not to pretty print the logs. We recommend to turn off pretty printing in production, as it has some performance overhead.

## How AdonisJS Logger works?
Since, Node.js is a single threaded event-loop, it is very important to keep the main thread free from any extra work required to process or reformat logs. 

For this very reason, we opted for [pino logger](http://getpino.io/#/), which does not perform any in-process log formatting and instead encourages you to make use a seperate process for that. In nutshell, this is how the logging works.

1. You can log at different levels using the Logger API, for example: `Logger.info('some message')`.
2. The logs will always be send out to `stdout`.
3. You can redirect the `stdout` stream to a file or use a seperate process to read and format them.

## Logging in Development
Since logs are always written to `stdout`, there is nothing special required in the development environment. Also, AdonisJS will automatically [pretty print](https://github.com/pinojs/pino-pretty) the logs when `NODE_ENV=development`.

## Logging in Production
In production, you would want to stream your logs to an external service like Datadog or Papertrail. Following are some of the ways to send logs to an external service.

:::note

There is an additional operational overhead of piping the stdout stream to a service. But, the trade off is worth the performance boost you receive. Make sure to check [pino benchmarks](https://getpino.io/#/docs/benchmarks) as well.

:::

### Using Pino Transports
The simplest way to process the `stdout` stream is to make use of [pino transports](https://getpino.io/#/docs/transports?id=known-transports). All you need to do is pipe the output to the transport of your choice. 

For demonstration, let's install `pino-datadog` npm package to send logs to Datadog.

```sh
npm i pino-datadog
```

Next, start the production server and pipe the `stdout` output to `pino-datadog`.

```sh
node build/server.js | ./node_modules/.bin/pino-datadog --key DD_API_KEY
```

### Streaming to a File
Another approach is to forward the output of `stdout` to a physical file on the disk and then configure your logging service to read and rotate the log files.

```sh
node build/server.js >> app.log
```

Now, configure your logging service to read logs from the `app.log` file.
