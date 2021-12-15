---
summary: Reference to the Edge error reporters for customizing the shape of the error
---

Error formatters are helpful when you are writing an API server following a pre-defined spec like [JSON\:API](https://jsonapi.org/)

Without error formatters, you have to manually loop over the error messages and re-shape them as per the spec followed by your API team. At the same time, error formatters expose an API to collect and structure error messages within the validation lifecycle (without any extra performance overhead).

## Using error reporters
The validations performed using the `request.validate` method uses content negotiation to [find the best possible error reporter](./introduction.md#server-rendered-app) for a given HTTP request.

However, you can also define the error reporter explicitly, which will turn off the content negotiation checks.

Both the `validator.validate` and `request.validate` method accepts a reporter to use. Either you can use one of the [pre-existing reporters](https://github.com/adonisjs/validator/blob/develop/src/Validator/index.ts#L219-L222) or create/use a custom reporter.

```ts
// highlight-start
import { schema, validator } from '@ioc:Adonis/Core/Validator'
// highlight-end

validator.validate({
  schema: schema.create({}),
  // highlight-start
  reporter: validator.reporters.api,
  // highlight-end
})
```

Inside validator classes, you can define the reporter as an instance property.

```ts
// highlight-start
import { schema, validator } from '@ioc:Adonis/Core/Validator'
// highlight-end
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateUserValidator {
  constructor (protected ctx: HttpContextContract) {}

  // highlight-start
  public reporter = validator.reporters.api
  // highlight-end

  public schema = schema.create({
    // ... schema properties
  })
}
```

## Creating your error reporter
Every reporter report must adhere to the [ErrorReporterContract](https://github.com/adonisjs/validator/blob/develop/adonis-typings/validator.ts#L168) interface and define the following properties/methods on it.

```ts
export interface ErrorReporterContract<Messages extends any = any> {
  hasErrors: boolean

  report(
    pointer: string,
    rule: string,
    message: string,
    arrayExpressionPointer?: string,
    args?: any
  ): void

  toError(): any

  toJSON(): Messages
}
```

#### report
The `report` method is called by the validator when validation fails. It receives the following arguments.

| Argument | Description |
|-----------|-------------|
| pointer | The path to the field name. Nested properties are represented with a dot notation. `user.profile.username` |
| rule | The name of the validation rule |
| message | The failure message |
| arrayExpressionPointer | This property exists when the current field under validation is nested inside an array. For example: `users.*.username` is the array expression pointer, and `users.0.pointer` is the pointer. |
| args | Arguments passed by the failed validation rule. |

#### toError
The `toError` method must return an instance of the error class, and the validator will throw this exception.

---

#### toJSON
The `toJSON` method must return the collection of errors reported by the validator so far.

---

#### hasErrors
A boolean to know if the error reporter has received any errors so far.

Create a new file `app/Validators/Reporters/MyReporter.ts` and paste the following contents inside it.

---

### Dummy implementation
Following is a dummy implementation of a custom error reporter. Feel free to tweak it further to match your needs.

```ts
// title: app/Validators/Reporters/MyReporter.ts
import {
  ValidationException,
  MessagesBagContract,
  ErrorReporterContract,
} from '@ioc:Adonis/Core/Validator'

/**
 * The shape of an individual error
 */
type ErrorNode = {
  message: string,
  field: string,
}

export class MyReporter implements ErrorReporterContract<{ errors: ErrorNode[] }> {
  public hasErrors = false

  /**
   * Tracking reported errors
   */
  private errors: ErrorNode[] = []

  constructor (
    private messages: MessagesBagContract,
    private bail: boolean,
  ) {
  }

  /**
   * Invoked by the validation rules to
   * report the error
   */
  public report (
    pointer: string,
    rule: string,
    message: string,
    arrayExpressionPointer?: string,
    args?: any
  ) {
    /**
     * Turn on the flag
     */
    this.hasErrors = true

    /**
     * Use messages bag to get the error message. The messages
     * bag also checks for the user-defined error messages and
     * hence must always be used
     */
    const errorMessage = this.messages.get(
      pointer,
      rule,
      message,
      arrayExpressionPointer,
      args,
    )

    /**
     * Track error message
     */
    this.errors.push({ message: errorMessage, field: pointer })

    /**
     * Bail mode means stop validation on the first
     * error itself
     */
    if (this.bail) {
      throw this.toError()
    }
  }

  /**
   * Converts validation failures to an exception
   */
  public toError () {
    throw new ValidationException(false, this.toJSON())
  }

  /**
   * Get error messages as JSON
   */
  public toJSON () {
    return {
      errors: this.errors,
    }
  }
}
```

#### Points to note

- You must always use the [MessagesBag](https://github.com/adonisjs/validator/blob/develop/src/MessagesBag/index.ts) to retrieve the error. It checks the user-defined custom error messages and returns the best match for a given field and validation rule.
- You should always raise an exception within the `report` method when `this.bail` is set to true.
- When in confusion, do check the implementation of [existing error reporters](https://github.com/adonisjs/validator/tree/develop/src/ErrorReporter).
