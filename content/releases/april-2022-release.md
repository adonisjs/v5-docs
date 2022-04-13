This release ships with integrated support for testing, improvements to the fakes API, pretty output for the `list:routes` command, and [breaking changes](#breaking-changes).

You must update all the packages under `@adonisjs` scope to their latest version. You can run the npm update command or use the following command to upgrade packages manually.

```sh
npx npm-check-updates -i
```

## First-class support for testing
AdonisJS now has first-class support for testing. Every new application comes pre-configured with [Japa tests runner](http://japa.dev). 

For existing projects, you will have to follow the following steps to configure the tests runner.

:::note
Before we get started, make sure to uninstall any Japa related packages you have self-installed in the past and start from scratch.
:::

1. Update all `@adonisjs` packages to their latest version.
2. Run `node ace generate:manifest` to create a fresh index of the ace commands.
3. Run `node ace configure tests` to configure Japa. This command will create all the required files and install Japa related packages.

If everything goes fine until step 3, you will have to make the following changes inside some existing files.

1. Open the `env.ts` file and update the enum values for `NODE_ENV`.

    ```ts
    export default Env.rules({
      NODE_ENV: Env.schema.enum([
        'development',
        'production',
        // delete-start
        'testing'
        // delete-end
        // insert-start
        'test'
        // insert-end
      ] as const)
    })
    ```
2. Open the `config/shield.ts` file (if it exists) and update the following line of code.
    ```ts
    export const csrf: ShieldConfig['csrf'] = {
      // delete-start
      enabled: Env.get('NODE_ENV') !== 'testing'
      // delete-end
      // insert-start
      enabled: Env.get('NODE_ENV') !== 'test'
      // insert-end
    }
    ```

That's all! You can run the `node ace test` command to execute the tests. Make sure to also [reference the testing documentation](../guides/testing/introduction.md).

## Validator improvements
Some of the existing validator rules and the `string` schema type had some technical limitations when applying the sanitization rules.

In the following example, the `maxLength` rule is applied after the `escape` option. Since escaping the value can change the length of the string, it results in undesired behavior.

```ts
title: schema.string({ escape: true }, [
  rules.maxLength(20)
])
```

It may seem like a straightforward fix, since the validator can apply the `escape` option after all other validation rules. However, this choice can conflict with other options like `trim`.

In the case of trimming whitespaces, you would want to be forgiving and trim all the whitespaces before applying the `maxLength` rule. In a nutshell, you would want

- First apply the trim rule.
- Then run all the validations.
- Then apply the escape rule.

```ts
title: schema.string({
  escape: true, // 3. and finally this
  trim: true, // 1. apply this first
}, [
  rules.maxLength(20) // 2. then this
])
```

As you can notice, the flow of executing rules and applying options is
 not predictable and neither configurable. Therefore, we have deprecated all the inline sanitization options in favor of equivalent rules.

Since rules are executed in the order they are defined, you have the flexibility to order them as per your application requirements.

### trim

:::caption{for="error"}
The `trim` option has been deprecated
:::

```ts
title: schema.string({
  trim: true
})
```

:::caption{for="success"}
Instead use `rules.trim` rule
:::

```ts
title: schema.string([
  rules.trim()
])
```

### escape
:::caption{for="error"}
The `escape` option has been deprecated
:::

```ts
title: schema.string({
  escape: true
})
```

:::caption{for="success"}
Instead use `rules.escape` rule
:::

```ts
title: schema.string([
  rules.escape()
])
```

### email (sanitize)
:::caption{for="error"}
The `sanitize` option has been deprecated
:::

```ts
title: schema.string([
  rules.email({
    sanitize: {
      lowerCase: true,
      removeSubaddress: true
    }
  })
])
```

:::caption{for="success"}
Instead use `rules.normalizeEmail` rule
:::

```ts
title: schema.string([
  rules.email(),
  rules.normalizeEmail({
    allLowercase: true,
    gmailRemoveSubaddress: true,
  })
])
```

### url (ensureProtocol, stripWWW)
:::caption{for="error"}
The `ensureProtocol`, and `stripWWW` options have been deprecated
:::

```ts
title: schema.string([
  rules.url({
    stripWWW: true,
    ensureProtocol: true
  })
])
```

:::caption{for="success"}
Instead use `rules.normalizeUrl` rule
:::

```ts
title: schema.string([
  rules.url(),
  rules.normalizeUrl({
    normalizeProtocol: true,
    stripWWW: true,
    forceHttps: true,
  })
])
```

## Pretty routes list
[Julien Ripouteau](https://twitter.com/julien_rpt) earlier created a [pretty-list-routes](https://github.com/Julien-R44/pretty-list-routes) package, which has been merged to the core of the framework. The `node ace list:routes` output looks as follows.

![](https://res.cloudinary.com/adonis-js/image/upload/v1649841876/v5/pretty-list-routes_xmvaix.png)

You can still view the routes as a table by using `--table` flag.

```sh
node ace list:routes --table
```

## Deprecate Event emitter traps
The `Event.trap` and `Event.trapAll` methods have been deprecated. We recommend you use Event fakes instead. 

```ts
import Event from '@ioc:Adonis/Core/Event'

const fakeEmitter = Event.fake()
Event.emit('new:user')

fakeEmitter.exists('new:user')

Event.restore()
```

## Breaking changes
This release introduce following breaking changes.

### Remove Mail traps
We have removed the `Mail.trap` and `Mail.trapAll` methods. We recommend you use fakes instead.

```ts
import Mail from '@adonisjs/mail'

// Fake default mailer
const fakeMailer = Mail.fake()

// Fake "s3", "local" mailer
const fakeMailer = Mail.fake(['s3', 'local'])

// Send email
Mail.send()

fakeMailer.exists({ to: 'virk@adonisjs.com' })
fakeMailer.exists({ subject: 'Welcome to AdonisJS!' })

Mail.restore()
Mail.restore(['s3', 'local'])
```

### Rename `testing` environment to `test`
Earlier the testing environment was created when the value `NODE_ENV=testing`. However, the Node ecosystem commonly uses the value `test` to detect the testing environment. Therefore, we decided to use `test` as well.

This change will require you to.

- Update the NODE_ENV enum options inside `env.ts` file.
  
  ```ts
  export default Env.rules({
      NODE_ENV: Env.schema.enum([
        'development',
        'production',
        // delete-start
        'testing'
        // delete-end
        // insert-start
        'test'
        // insert-end
      ] as const)
    })
  ```

- Update `config/shield.ts` file to check against the literal value `test`.
  
  ```ts
  export const csrf: ShieldConfig['csrf'] = {
    // delete-start
    enabled: Env.get('NODE_ENV') !== 'testing'
    // delete-end
    // insert-start
    enabled: Env.get('NODE_ENV') !== 'test'
    // insert-end
  }
  ``` 

- Rename existing `.env.testing` file to `.env.test`.
