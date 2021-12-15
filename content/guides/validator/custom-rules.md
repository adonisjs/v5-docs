---
summary: Learn how you can create custom rules for the AdonisJS validator
---

You can add custom rules to the validator using the `validator.rule` method. Rules should be registered only once. Hence we recommend you register them inside a service provider or a [preload file](../fundamentals/adonisrc-file.md#preloads).

Throughout this guide, we will keep them inside the `start/validator.ts` file. You can create this file by running the following Ace command and select the environment as **"During HTTP server"**.

```sh
node ace make:prldfile validator
```

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1632118234/v5/validator-prldfile_wipxtd.png)

Open the newly created file and paste the following code inside it.

```ts
// title: start/validator.ts
import { string } from '@ioc:Adonis/Core/Helpers'
import { validator } from '@ioc:Adonis/Core/Validator'

validator.rule('camelCase', (value, _, options) => {
  if (typeof value !== 'string') {
    return
  }

  if (value !== string.camelCase(value)) {
    options.errorReporter.report(
      options.pointer,
      'camelCase',
      'camelCase validation failed',
      options.arrayExpressionPointer
    )
  }
})
```

- The `validator.rule` method accepts the rule name as the first argument.
- The second argument is the rule implementation. The function receives the field's value under validation, the rule options, and an object representing the schema tree.

In the above example, we create a `camelCase` rule that checks if the field value is the same as its camelCase version or not. If not, we will report an error using the [errorReporter](https://github.com/adonisjs/validator/blob/develop/src/ErrorReporter/Vanilla.ts#L39) class instance.

## Using the rule
Before using your custom rules, you will have to inform the TypeScript compiler about the same. Otherwise, it will complain that the rule does not exist.

To inform TypeScript, we will use [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces) and add the property to the `Rules` interface.

Create a new file at path `contracts/validator.ts` (the filename is not important) and paste the following contents inside it.

```ts
// title: contracts/validator.ts
declare module '@ioc:Adonis/Core/Validator' {
  interface Rules {
    camelCase(): Rule
  }
}
```

Once done, you can access the `camelCase` rule from the `rules` object.

```ts
// highlight-start
import { rules, schema, validator } from '@ioc:Adonis/Core/Validator'
// highlight-end

await validator.validate({
  schema: schema.create({
    fileName: schema.string({}, [
      // highlight-start
      rules.camelCase()
      // highlight-end
    ]),
  }),
  data: {},
})
```

## Passing options to the rule
Rules can also accept options, and they will be available to the validation callback as the second argument.

This time let's start from the TypeScript interface and define the options we expect from the rule consumer.

```ts
// title: contracts/validator.ts
declare module '@ioc:Adonis/Core/Validator' {
  interface Rules {
    camelCase(maxLength?: number): Rule
  }
}
```

All the arguments passed to the rule function are available as an array to the rule implementation. So, for example, You can access the `maxLength` option as follows.

```ts
validator.rule('camelCase', (
  value,
  // highlight-start
  [maxLength],
  // highlight-end
  options
) => {
  // Rest of the validation
  if (maxLength && value.length > maxLength) {
    options.errorReporter.report(
      options.pointer,
       // highlight-start
      'camelCase.maxLength', // 👈 Keep an eye on this
       // highlight-end
      'camelCase.maxLength validation failed',
      options.arrayExpressionPointer,
      { maxLength }
    )
  }
})
```

Finally, if you notice, we are passing the rule name as `camelCase.maxLength` to the error reporter. This will allow the users to define a custom validation message just for the `maxLength`.

```ts
messages: {
  'camelCase.maxLength': 'Only {{ options.maxLength }} characters are allowed'
}
```

### Normalizing options
Many times you would want to normalize the options passed to a validation rule. For example: Using a default `maxLength` when not provided by the user. 

Instead of normalizing the options inside the validation callback, we recommend you normalize them only once during the compile phase.

The `validator.rule` method accepts a callback function as the third argument and runs it during the compile phase.

```ts
validator.rule(
  'camelCase', // rule name
  () => {}, // validation callback
  // highlight-start
  ([maxLength]) => {
    return {
      compiledOptions: {
        maxLength: maxLength || 10,
      },
    }
  }
  // highlight-end
)
```

The `compiledOptions` value is then passed to the validation callback as the second argument. As per the above example, the validation callback will receive the `maxLength` as an object.

```ts
validator.rule(
  'camelCase', // rule name
  // highlight-start
  (value, { maxLength }) => {}, // validation callback
  // highlight-end
  ([maxLength]) => {
    return {
      compiledOptions: {
        maxLength: maxLength || 10,
      },
    }
  }
)
```

## Async rules
To optimize the validation process, you will have to explicitly inform the validator that your validation rule is async in nature. Just return `async: true` from the compile callback, and then you will be able to use `async/await` inside the validation callback.

```ts
validator.rule(
  'camelCase', // rule name
  // highlight-start
  async () => {}, // validation callback
  // highlight-end
  () => {
    return {
      // highlight-start
      async: true,
      // highlight-end
      compiledOptions: {},
    }
  }
)
```

## Restrict rules to work on a specific data type
Within the compile callback, you can access the **schema type/subtype** of the field on which the validation rule is applied and then conditionally allow it to be used on specific types only.

Following is an example of restricting the `camelCase` rule to a string schema type only.

```ts
validator.rule(
  'camelCase', // rule name
  async () => {}, // validation callback
  (options, type, subtype) => {
    if (subtype !== 'string') {
      throw new Error('"camelCase" rule can only be used with a string schema type')
    }

    return {
      compiledOptions: {},
    }
  }
)
```

An exception will be raised if someone attempts to use the `camelCase` rule on a non-string field.

```ts
schema: schema.create({
  fileName: schema.number([
    rules.camelCase() // will result in an error at runtime
  ]),
}),
```
