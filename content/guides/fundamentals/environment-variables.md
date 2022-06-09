---
summary: Learn how to define and validate environment variables in AdonisJS
---

Instead of maintaining multiple config files, one for each environment, AdonisJS uses [environment variables](https://en.wikipedia.org/wiki/Environment_variable) for values that often change between your local and the production environment. For example: the database credentials, a boolean flag to toggle templates caching, and so on.

## Access environment variables

Node.js natively allows you to access the environment variables using the `process.env` object. For example:

```ts
process.env.NODE_ENV
process.env.HOST
process.env.PORT
```

However, we recommend **using the AdonisJS Env provider**, as it further improves the API to work with environment variables by adding support for validations and provides static type information.

```ts
import Env from '@ioc:Adonis/Core/Env'

Env.get('NODE_ENV')

// With default values
Env.get('HOST', '0.0.0.0')
Env.get('PORT', 3333)
```

## Why validate environment variables?

Environment variables are injected from outside-in to your application, and you have little or no control over them within your codebase.

For example, a section of your codebase relies on the existence of the `SESSION_DRIVER` environment variable.

```ts
const driver = process.env.SESSION_DRIVER

// Dummy code
await Session.use(driver).read()
```

There is no guarantee that at the time of running the program, the `SESSION_DRIVER` env variable exists and has the correct value. Therefore you must validate it vs. getting an error later in the program lifecycle complaining about the **"undefined"** value.

```ts
const driver = process.env.SESSION_DRIVER

if (!driver) {
  throw new Error('Missing env variable "SESSION_DRIVER"')
}

if (!['memory', 'file', 'redis'].includes(driver)) {
  throw new Error('Invalid value for env variable "SESSION_DRIVER"')  
}
```

Now imagine writing these conditionals everywhere inside your codebase? **Well, not a great development experience**.

## Validating environment variables

AdonisJS allows you to **optionally validate** the environment variables very early in the lifecycle of booting your application and refuses to start if any validation fails.

You begin by defining the validation rules inside the `env.ts` file.

```ts
import Env from '@ioc:Adonis/Core/Env'

export default Env.rules({
  HOST: Env.schema.string({ format: 'host' }),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  APP_NAME: Env.schema.string(),
  CACHE_VIEWS: Env.schema.boolean(),
  SESSION_DRIVER: Env.schema.string(),
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
})
```

Also, AdonisJS extracts the static type information from the validation rules and provides IntelliSense for the validated properties.

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1617158425/v5/adonis-env-intellisense.jpg)

## Schema API

Following is the list of available methods to validate the environment variables. 

### Env.schema.string
Validates the value to check if it exists and if it is a valid string. Empty strings fail the validations, and you must use the optional variant to allow empty strings.

```ts
{
  APP_KEY: Env.schema.string()
}

// Mark it as optional
{
  APP_KEY: Env.schema.string.optional()
}
```

You can also force the value to have one of the pre-defined formats.

```ts
// Must be a valid host (url or ip)
Env.schema.string({ format: 'host' })

// Must be a valid URL
Env.schema.string({ format: 'url' })

// Must be a valid email address
Env.schema.string({ format: 'email' })
```

When validating the `url` format, you can also define additional options to force/ignore the `tld` and `protocol`.

```ts
Env.schema.string({ format: 'url', tld: false, protocol: false })
```

---

### Env.schema.boolean

Enforces the value to be a valid string representation of a boolean. Following values are considered as valid booleans and will be converted to `true` or `false`.

- `'1', 'true'` are casted to `Boolean(true)`
- `'0', 'false'` are casted to `Boolean(false)`

```ts
{
  CACHE_VIEWS: Env.schema.boolean()
}

// Mark it as optional
{
  CACHE_VIEWS: Env.schema.boolean.optional()
}
```

---

### Env.schema.number

Enforces the value to be a valid string representation of a number.

```ts
{
  PORT: Env.schema.number()
}

// Mark it as optional
{
  PORT: Env.schema.number.optional()
}
```

---

### Env.schema.enum

Forces the value to be one of the pre-defined values.

```ts
{
  NODE_ENV: Env
    .schema
    .enum(['development', 'production'] as const)
}

// Mark it as optional
{
  NODE_ENV: Env
    .schema
    .enum
    .optional(['development', 'production'] as const)
}
```

---

### Custom functions
For every other validation use case, you can define your custom functions.

```ts
{
  PORT: (key, value) => {
    if (!value) {
      throw new Error('Value for PORT is required')
    }
    
    if (isNaN(Number(value))) {
      throw new Error('Value for PORT must be a valid number')    
    }

    return Number(value)
  }
}
```

- Make sure to always return the value after validating it.
- The return value can be different from the initial input value.
- We infer the static type from the return value. In this case, `Env.get('PORT')` is a number.

## Defining variables in the development

During development, you can define environment variables inside the `.env` file stored in your project's root, and AdonisJS will automatically process it.

```dotenv
// title: .env
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=sH2k88gojcp3PdAJiGDxof54kjtTXa3g
SESSION_DRIVER=cookie
CACHE_VIEWS=false
```

### Variable substitution 

Along with the standard support for parsing the `.env` file, AdonisJS also allows variable substitution.

```sh
HOST=localhost
PORT=3333
// highlight-start
URL=$HOST:$PORT
// highlight-end
```

All `letter`, `numbers`, and the underscore (`_`) after the dollar (`$`) sign are parsed as variables. If your variable contains any other character, then you must wrap it inside the curly braces `{}`.

```sh
REDIS-USER=foo
// highlight-start
REDIS-URL=localhost@${REDIS-USER}
// highlight-end
```

### Escape the `$` sign

If the value of a variable contains a `$` sign, you must escape it to prevent variable substitution. 

```sh
PASSWORD=pa\$\$word
```

### Do not commit the `.env` file

The `.env` files are not portable. Meaning, the database credentials on your local and your production environment will always be different, and hence there is no point in pushing the `.env` to the version control.

You must consider the `.env` file personal to your local environment and create a separate `.env` file on the production or the staging server (and keep it secure).

The `.env` file can be at any location on your server. For example, You can store it inside `/etc/myapp/.env` and then inform AdonisJS about it as follows.

```sh
ENV_PATH=/etc/myapp/.env node server.js
```

## Defining variables during tests

AdonisJS will look for the `.env.test` file when the application is started with the `NODE_ENV=test` environment variable.

The variables defined inside the `.env.test` file are automatically merged with the `.env` file. This allows you to use a different database or a different session driver when writing tests.

## Defining variables in production

Most modern-day hosting providers have first-class support for defining environment variables within their web console. Make sure you read the documentation for your hosting provider and define the environment variables before deploying your AdonisJS app.
