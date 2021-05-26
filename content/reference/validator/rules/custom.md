The validator is extensible and allows adding custom rules. In this guide, we will go through the validator API and add a couple of custom rules to understand the different moving parts.

In this example, we are going to validate the contents of an object.

Lets begin by creating a new **preload file** using the following ace command. Make sure to select `During HTTP server`, since we do not want to load the rules while running an ace command.

```sh
node ace make:prldfile validationRules

# CREATE: start/validationRules.ts
```

Open the newly created file and paste the following code snippet inside it.

```ts {}{start/validationRules.ts}
import { validator } from '@ioc:Adonis/Core/Validator'

validator.rule('objectContent', (value, _, { pointer, arrayExpressionPointer, errorReporter }) => {
  /**
   * Skip validation when value is not a object. The object
   * schema rule will handle it
   */
  if (typeof (value) !== 'object') {
    return
  }

  /**
   * Report error when content is not set name
   */
  if (!value.name) {
    errorReporter.report(pointer, 'objectContent', 'Undefined name', arrayExpressionPointer)
  }
})
```

- We skip the validation when field value is not a object.
- If the value is null, then we will report the validation error using the `errorReporter.report` method.

#### Updating interface for static analysis to work
Next, you also need to update the `Rules` interface for typescript to recognize the rule at compile time. 

Create a new file `contracts/validator.ts` file and paste the following code snippet inside it.

```ts {}{contracts/validator.ts}
declare module '@ioc:Adonis/Core/Validator' {
  import { Rule } from '@ioc:Adonis/Core/Validator'

  export interface Rules {
    objectContent (): Rule // 👈 
  }
}
```

#### Usage
Alright, now you can use the `objectContent` validation rule inside your validators. For example:

```ts
schema.create({
  person: schema.object([
    rules.objectContent()
  ]),
})
```

### Async calls
If you need call to async functions you have to tell the validator in advance, that you are going to create an async validation by defining a third argument.

```ts
validator.rule('userType', async (value, _, { pointer, arrayExpressionPointer, errorReporter }) => {
  const user = await User.query().where('id', value).firstOrFail()

  if (user.type !== 'admin') {
    errorReporter.report(pointer, 'userType', 'Invalid user type', arrayExpressionPointer)
  }
},
() => {
  return {
    async: true
  }
})
```
The validator.rule function receive an instance of a compile function.

```ts
() => {
  return {
    async: true
  }
}
```
Where returns the async option as true.
