Environment variables serve the purpose of storing secrets like the database password, the app secret, or an API key outside of your application codebase.

Also, environment variables can be used to have different configuration for different environments. For example, you can use memory mailer during tests, SMTP mailer during development, and a third-party service in production.

Since, environment variables are supported by all operating systems, deployment platforms, and CI/CD pipelines. They have become a de-facto standard for storing secrets and environment specific config.

In this guide, we will learn how you can leverage environment environment variables inside a AdonisJS application.

## Reading environment variables

Node.js natively exposes all the environment variables as an object through the [`process.env` global property](https://nodejs.org/dist/latest-v8.x/docs/api/process.html#process_process_env) and you can access them as follows. 

```ts
process.env.NODE_ENV
process.env.HOST
process.env.PORT
```

### Using the AdonisJS env module

Every AdonisJS application uses a custom env module for reading and managing environment variables. We highly **recommend using the env module** over `process.env` global object for following reasons.

- Ability to store environment variables inside one or more `.env` files.
- Validate environment variables as soon as the application starts.
- Have static-type safety for validated environment variables.

The env module is instantiated inside the `start/env.ts` file and you can access it elsewhere inside your application as follows.

```ts
import env from '#start/env'

env.get('NODE_ENV')
env.get('HOST')
env.get('PORT')
```

## Validating envrionment variables
The validation rules are defined inside the `start/env.ts` file at the time of instantiating the env module. The validation schema is an object of key-value pair.

- The key is the name of the environment variable.
- The value is the function that performs the validation. It can be a custom inline function or a reference to pre-defined schema methods like `schema.string` or `schema.number`.

```ts
import Env from '@adonisjs/core/env'

/**
 * App root is used to locate .env files inside
 * the project root.
 */
const APP_ROOT = new URL('../', import.meta.url)

export default await Env.create(APP_ROOT, {
  HOST: Env.schema.string({ format: 'host' }),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  APP_NAME: Env.schema.string(),
  CACHE_VIEWS: Env.schema.boolean(),
  SESSION_DRIVER: Env.schema.string(),
  NODE_ENV: Env.schema.enum([
    'development',
    'production',
    'test'
  ] as const),
})
```

### Static types information
The same validation rules are also used to infer the static-type information. The type information is only available when using the env module.

```ts
import env from '#start/env'

env.get('')
```

![](./env-intellisense.png)

## Validator schema API

### schema.string

The `schema.string` method ensures the value is a valid string. Empty strings fail the validation, and you must use the optional variant to allow empty strings.

```ts
{
  APP_KEY: Env.schema.string()
}

// Mark APP_KEY to be optional
{
  APP_KEY: Env.schema.string.optional()
}
```

The string value can be further validated for its formatting. Following is the list of available formats.

**`host`**\
Validate the value to be a valid URL or an IP address.

```ts
{
  HOST: Env.schema.string({ format: 'host' })
}
```

**`url`**\
Validate the value to be a valid URL. Optionally, you can make the validation less strict by allowing URLs to not have `protocol` or `tld`.

```ts
{
  S3_ENDPOINT: Env.schema.string({ format: 'url' })

  // Allow URLs without protocol
  S3_ENDPOINT: Env.schema.string({ format: 'url', protocol: false })

  // Allow URLs without tld
  S3_ENDPOINT: Env.schema.string({ format: 'url', tld: false })
}
```
  
**`email`**\
Validate the value to be a valid email address.

```ts
{
  SENDER_EMAIL: Env.schema.string({ format: 'email' })
}
```

### schema.boolean

The `schema.boolean` method ensures the value to be a valid boolean. Empty values fail the validation, and you must use the optional variant to allow empty values.

The string representation of `'true'`, `'1'`, `'false'`, and `'0'` are casted to the boolean data type.

```ts
{
  CACHE_VIEWS: schema.boolean()
}

// Mark it as optional
{
  CACHE_VIEWS: schema.boolean.optional()
}
```

### schema.number

The `schema.number` method ensures the value to be a valid number. The string representation of a number value is casted to the number data type.

```ts
{
  PORT: schema.number()
}

// Mark it as optional
{
  PORT: schema.number.optional()
}
```

### schema.enum

The `schema.enum` method validates the environment variable against one of the pre-defined values. The enum options can be specified as an array of values or it can be TypeScript native enum type.

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

// Using native enums
enum NODE_ENV = {
  development = 'development',
  production = 'production'
}

{
  NODE_ENV: Env.schema.enum(NODE_ENV)
}
```

### Custom functions
Custom functions can be used to perform validations that are not covered by the schema API. 

The function receives the environment variable name as the first argument and value as the second argument. It must return the final value post validation.

```ts
{
  PORT: (name, value) => {
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

## Defining environment variables

### In development
During development, the environment variables are defined inside the `.env` file. The env module looks for this file within the project's root and automatically parses it (if the file exists).

```dot-env
// title: .env
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=sH2k88gojcp3PdAJiGDxof54kjtTXa3g
SESSION_DRIVER=cookie
CACHE_VIEWS=false
```

### In production
In production, it is usually recommended to use your deployment platform for defining the environment variables. Most modern day deployment platforms have first-class support for defining environment variables directly from the UI.

If your deployment platform provides no means for defining environment variables, then you can manually create a `.env` file somewhere on your production server and tell AdonisJS to load that file by setting the `ENV_PATH` environment variable.

```sh
# Assuming the .env file exists at path /etc/secrets/.env
ENV_PATH=/etc/secrets node server.js
```

### During tests
The environment variables specific to the test environment must be defined within the `.env.test` file. The values from this file overrides the values from the `.env` file.

```sh
// title: .env
NODE_ENV=development
SESSION_DRIVER=cookie
ASSETS_DRIVER=vite
```

```sh
// title: .env.test
NODE_ENV=test
SESSION_DRIVER=memory
ASSETS_DRIVER=fake
```

```ts
// During tests
import env from '#start/env'

env.get('SESSION_DRIVER') // memory
```

## All other dot-env files

Alongside the `.env` file, AdonisJS also process the environment variables from the following dot-env files. You can optionally create these files (if needed).

The file with the highest rank overrides the values from the lower rank files.

<table>
    <thead>
        <tr>
            <th>Priority</th>
            <th>Filename</th>
            <th>Notes</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>1st</td>
            <td><code>.env.[NODE_ENV].local</code></td>
            <!-- <td>Current</td> -->
            <!-- <td>Yes</td> -->
            <td>Loaded when <code>NODE_ENV</code> environment variable is set</td>
        </tr>
        <tr>
            <td>2nd</td>
            <td><code>.env.local</code></td>
            <!-- <td>All</td> -->
            <!-- <td>Yes</td> -->
            <td>Loaded in all the environments except the <code>test</code> and <code>testing</code> environments</td>
        </tr>
        <tr>
            <td>3rd</td>
            <td><code>.env.[NODE_ENV]</code></td>
            <!-- <td>Current</td> -->
            <!-- <td>No</td> -->
            <td>Loaded when <code>NODE_ENV</code> environment variable is set</td>
        </tr>
        <tr>
            <td>4th</td>
            <td><code>.env</code></td>
            <!-- <td>All</td> -->
            <!-- <td>Depends</td> -->
            <td>Loaded in all the environments. You should add this file to <code>.gitignore</code> when storing secrets inside it</td>
        </tr>
    </tbody>
</table>

## Using variables inside the dot-env files

The dot-env files can also reference other environment variables using the variable substitution syntax. In the following example, we compute the `APP_URL` from the `HOST` and the `PORT` properties.

```dotenv
HOST=localhost
PORT=3333
// highlight-start
URL=$HOST:$PORT
// highlight-end
```

All **letter**, **numbers**, and the **underscore (_)** after the `$` sign are used to form a variable name. If a variable name contains any other character, then you must wrap it inside the curly braces `{}`.

```dotenv
REDIS-USER=admin
REDIS-URL=localhost@${REDIS-USER}
```

### Escaping the `$` sign

If the value of a variable contains a `$` sign, you must escape it to prevent variable substitution.

```dotenv
PASSWORD=pa\$\$word
```
