---
summary: Learn how to manage exceptions that occurred during an HTTP request effectively.
---

AdonisJS uses exceptions for flow control. Meaning, instead of writing too many conditionals, we prefer raising exceptions and then handle them to return an appropriate response. For example:

#### Instead of writing the following code

```ts
Route.get('dashboard', async ({ auth, response }) => {
  if (!auth.isLoggedIn) {
    return response.status(401).send('Unauthenticated')
  }

  // business logic
})
```

#### We prefer writing

In the following example, the `auth.authenticate` method will raise an exception if the user is not logged in. The exception can handle itself and return an appropriate response.

```ts
Route.get('dashboard', async ({ auth, response }) => {
  await auth.authenticate()

  // business logic
})
```

:::tip

Converting every conditional to an exception is also not the right approach. Instead, you can start by converting conditionals that always result in aborting the request.

:::

## Handling exceptions globally

The exceptions raised during an HTTP request are forwarded to the global exception handler stored inside the `app/Exceptions/Handler.ts` file.

```ts
// title: app/Exceptions/Handler.ts
import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'

export default class ExceptionHandler extends HttpExceptionHandler {
  protected statusPages = {
    '404': 'errors/not-found',
    '500..599': 'errors/server-error',
  }

  constructor() {
    super(Logger)
  }
}
```

The `handle` method is responsible for handling the exceptions and converting them to a response. So either you can let the parent class ([HttpExceptionHandler](https://github.com/adonisjs/core/blob/develop/src/HttpExceptionHandler/index.ts)) handle the errors for you, or you can define the `handle` method to self handle them.

```ts
import Logger from '@ioc:Adonis/Core/Logger'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'

export default class ExceptionHandler extends HttpExceptionHandler {
  protected statusPages = {
    '404': 'errors/not-found',
    '500..599': 'errors/server-error',
  }

  constructor() {
    super(Logger)
  }

  // highlight-start
  public async handle(error: any, ctx: HttpContextContract) {
    /**
     * Self handle the validation exception
     */
    if (error.code === 'E_VALIDATION_FAILURE') {
      return ctx.response.status(422).send(error.messages)
    }

    /**
     * Forward rest of the exceptions to the parent class
     */
    return super.handle(error, ctx)
  }
  // highlight-end
}
```

## Error reporting

Alongside the handle method, you can also implement the `report` method to report the exception to logging or an error monitoring service.

The default implementation of the `report` method uses the [logger](../digging-deeper/logger.md) to report exceptions.

- Exceptions with error code `>= 500` are logged using `logger.error` method.
- Exceptions with error code `>= 400` are logged using `logger.warn` method.
- All other exceptions are logged using the `logger.info` method.

:::note
The HTTP response does not wait for the report method to finish. In other words, the report method is executed in the background.
:::

If required, you can overwrite the `report` method, as shown in the following example.

```ts
import Logger from '@ioc:Adonis/Core/Logger'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'

export default class ExceptionHandler extends HttpExceptionHandler {
  protected statusPages = {
    '404': 'errors/not-found',
    '500..599': 'errors/server-error',
  }

  constructor() {
    super(Logger)
  }

  // highlight-start
  public async report(error: any, ctx: HttpContextContract) {
    if (!this.shouldReport(error)) {
      return
    }

   if (typeof error.report === 'function') {
      error.report(error, ctx)
      return
    }

    someReportingService.report(error.message)
  }
  // highlight-end
}
```

### Reporting context
You can implement the `context` method to provide additional data when reporting errors. By default, the context includes the current request-id.

```ts
import Logger from '@ioc:Adonis/Core/Logger'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'

export default class ExceptionHandler extends HttpExceptionHandler {
  protected context(ctx: HttpContextContract) {
    return {
      userId: ctx.auth.user?.id
    }
  }
}
```

## HTTP exception handler

The following features are only available when the global exception handler extends the [HttpExceptionHandler](https://github.com/adonisjs/core/blob/develop/src/HttpExceptionHandler/index.ts) class. If you decide not to extend from this class, then the following features will not work.

### Status pages

The `statusPages` page property on the exception handler allows you to associate Edge templates to a range of error status codes.

In the following example, all 404 errors will render the `errors/not-found.edge` template and the errors between the range of _500 - 599_ will render the `errors/server-error.edge` template.

```ts
import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'

export default class ExceptionHandler extends HttpExceptionHandler {
  // highlight-start
  protected statusPages = {
    '404': 'errors/not-found',
    '500..599': 'errors/server-error',
  }
  // highlight-end

  constructor() {
    super(Logger)
  }
}
```

- The status pages are only rendered when the HTTP request `Accept` header is not set to `application/json`.

- The status pages are disabled during development. However, you can enable them using the `disableStatusPagesInDevelopment` flag.
  ```ts
  export default class ExceptionHandler extends HttpExceptionHandler {
    protected disableStatusPagesInDevelopment = false
  }
  ```

---

### Disable reporting for certain exceptions
You can ignore certain exceptions from being reported by adding them inside the `ignoreCodes` or `ignoreStatuses` properties.

```ts
import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'

export default class ExceptionHandler extends HttpExceptionHandler {
  // highlight-start
  protected ignoreCodes = ['E_ROUTE_NOT_FOUND']
  protected ignoreStatuses = [404, 422, 403, 401]
  // highlight-end

  constructor() {
    super(Logger)
  }
}
```

## Custom exceptions

You can create custom exceptions by executing the following Ace command.

```sh
node ace make:exception UnAuthorized
# CREATE: app/Exceptions/UnAuthorizedException.ts
```

Next, import and raise the exception as follows.

```ts
import UnAuthorized from 'App/Exceptions/UnAuthorizedException'

const message = 'You are not authorized'
const status = 403
const errorCode = 'E_UNAUTHORIZED'

throw new UnAuthorized(message, status, errorCode)
```

You can self-handle this exception by implementing the `handle` method on the exception class.

```ts
// title: app/Exceptions/UnAuthorizedException.ts
import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UnAuthorizedException extends Exception {
  // highlight-start
  public async handle(error: this, ctx: HttpContextContract) {
    ctx.response.status(error.status).send(error.message)
  }
  // highlight-end
}
```

Optionally, implement the `report` method to report the exception to a logging or error reporting service.

```ts
// title: app/Exceptions/UnAuthorizedException.ts
import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UnAuthorizedException extends Exception {
  // highlight-start
  public report(error: this, ctx: HttpContextContract) {
    reportingService.report(error.message)
  }
  // highlight-end
}
```
