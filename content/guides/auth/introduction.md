---
summary: Introduction to the AdonisJS authentication package. It has support for authenticating users using sessions, API tokens, or basic auth
---

AdonisJS comes with a fully fledged authentication system to authenticate the users of your application using **sessions**, **basic auth** or **API tokens**.

The support for authentication is added by the `@adonisjs/auth` package and it must be installed separately.

:::note

The auth package relies on the `@adonisjs/lucid` package. Make sure to [configure lucid](../database/introduction.md) first.

:::

:::div{class="setup"}

:::codegroup

```sh
// title: 1. Install
npm i @adonisjs/auth@8.2.3
```

```sh
// title: 2. Configure
node ace configure @adonisjs/auth

# CREATE: app/Models/User.ts
# CREATE: database/migrations/1619578304190_users.ts
# CREATE: contracts/auth.ts
# CREATE: config/auth.ts
# CREATE: app/Middleware/Auth.ts file already exists
# CREATE: app/Middleware/SilentAuth.ts file already exists
# UPDATE: .adonisrc.json { providers += "@adonisjs/auth" }
# CREATE: ace-manifest.json file
```

:::


:::div{class="features"}

- Multiple guards for authentication. **Sessions**, **API tokens**, and **Basic auth**
- Extensible API to add custom guards and user providers

&nbsp;

- [View on npm](https://npm.im/@adonisjs/auth)
- [View on GitHub](https://github.com/adonisjs/auth)

:::

## Config
The configuration for the auth package is stored inside the `config/auth.ts` file. Inside this file you can define one or more guards to authenticate users. A guard is a **combination of a user provider and one of the available authentication driver**.

```ts
import { AuthConfig } from '@ioc:Adonis/Addons/Auth'

const authConfig: AuthConfig = {
  guard: 'web',

  guards: {
    web: {
      driver: 'session',

      provider: {
        driver: 'lucid',
        identifierKey: 'id',
        uids: ['email'],
        model: () => import('App/Models/User'),
      },
    },
  },
}

export default authConfig
```

#### guard
The top level `guard` property defines the default guard to use for authentication. It must be defined inside the `guards` list.

----

#### guards
The `guards` object is a key-value pair of the guards you want to use in your application. You can create multiple guards using the same or a different driver.

----

#### guards.driver
The driver to use for login and authenticating users. You can use one of the pre-existing drivers or extend the Auth module to add your own.

- `session` driver makes use of sessions/cookies to login and authenticate requests.
- `oat` stands for **opaque access token** and uses stateless tokens for authenticating requests.
- `basic` uses basic auth for authenticating requests.

----

#### guards.provider
The `provider` property configures a user provider to lookup users. You can use one of the pre-existing providers or extend the Auth module to add your own.

Following is the list of available drivers for user lookup. Rest of the config values are dependent upon the selected driver.

- `lucid` uses data models to lookup users.
- `database` queries the database directly to lookup users.

---

### Configuring new guards/providers
You can also configure new guards and the providers after initial setup. The first step is to register them inside the `contracts/auth.ts` file to inform the TypeScript static compiler.

You can add a new provider inside the `ProvidersList` interface. The key is the name of provider, alongside the types for both the config and the implementation.

The `GuardsList` interface is the list of all the guards you want to use. The key is the name of the guard, alongside the types for both the guard config and its implementation.

```ts
// title: contracts/auth.ts
declare module '@ioc:Adonis/Addons/Auth' {
  interface ProvidersList {
    user: {
      implementation: LucidProviderContract<typeof User>,
      config: LucidProviderConfig<typeof User>,
    },
    // highlight-start
    apps: {
      implementation: LucidProviderContract<typeof App>,
      config: LucidProviderConfig<typeof App>,
    }
    // highlight-end
  }

  interface GuardsList {
    web: {
      implementation: SessionGuardContract<'user', 'web'>,
      config: SessionGuardConfig<'user'>,
    },
    // highlight-start
    api: {
      implementation: OATGuardContract<'apps', 'api'>,
      config: OATGuardConfig<'apps'>,
    }
    // highlight-end
  }
}
```

Once, you have added the new guard(s) or provider(s) inside the contracts file, the TypeScript compiler will automatically validate the config file, forcing you to define the configuration for it as well.

## Migrations

The setup process also creates the migration files for the `users` table and optionally for the `tokens` table (if using the API tokens guard with SQL storage).

 The filename of the migrations uses the current timestamp and is placed after all the existing migrations.

 There are chances that some of your tables needs to create a foreign key constraint with the `users` table, hence the `users` table migration must run before those migrations.

 In this scenario, you can manually rename the `users` table migration file and use a smaller timestamp to move it ahead of the other migration files.

## Usage
You can access the `auth` instance inside your route handlers using the `ctx.auth` property. The auth object allows you to both login users and authenticate subsequent requests.

```ts
// title: Login user
Route.post('login', async ({ auth, request }) => {
  const email = request.input('email')
  const password = request.input('password')

  await auth.use('web').attempt(email, password)
})
```

```ts
// title: Authenticate subsequent request
Route.get('dashboard', async ({ auth }) => {
  await auth.use('web').authenticate()

  // ✅ Request authenticated
  console.log(auth.user!)
})
```

Beyond the basic usage, we recommend you to read the guides for the individual guards, as their API and flow may vary.

- [Web guard usage](./web-guard.md)
- [API tokens guard usage](./api-tokens-guard.md)
- [Basic auth guard usage](./basic-auth-guard.md)

## Reference inside templates
The `ctx.auth` property is also shared with the templates. You can use it to display the specific portion of your markup conditionally.

```edge
@if(auth.isLoggedIn)
  <p> Hello {{ auth.user.username }} </p>
@endif
```

## Providers config reference
Following is the reference of user providers config and contracts.

### Lucid provider
The `lucid` provider uses the data models to lookup users from the databases. The provider must be configured inside the contracts file first.

```ts
import User from 'App/Models/User'

interface ProvidersList {
  providerName: {
    implementation: LucidProviderContract<typeof User>,
    config: LucidProviderConfig<typeof User>,
  }
}
```

Following is the list of all the available configuration options.

```ts
{
  provider: {
    driver: 'lucid',
    identifierKey: 'id',
    uids: ['email'],
    model: () => import('App/Models/user'),
    connection: 'pg',
    hashDriver: 'argon',
  }
}
```

#### driver
The driver name must always be set to `lucid`.

---

#### identifierKey
The `identifierKey` is usually the primary key on the configured model. The authentication package needs it to uniquely identify a user.

---

#### uids
An array of model columns to use for the user lookup. The `auth.login` method uses the `uids` to find a user by the provided value.

For example: If your application allows login with email and username both, then you must define them as `uids`. Also, you need to define the model column names and not the database column names.

---

#### model
The model to use for user lookup. It must be lazily imported using a closure.

```ts
{
  model: () => import('App/Models/user'),
}
```

---

#### connection
The database connection to use to make the SQL queries. If not defined, the model connection will be used.

---

#### hashDriver
The driver to use for verifying the user password hash. It is used by the `auth.login` method. If not defined, we will use the default hash driver from the `config/hash.ts` file.

---

### Database provider
The database provider queries the database directly using the [Database query builder](../database/query-builder.md). You must register the provider inside the contracts file first.

```ts
interface ProvidersList {
  providerName: {
    implementation: DatabaseProviderContract<DatabaseProviderRow>,
    config: DatabaseProviderConfig,
  }
}
```

Following is the list of available configuration options.

```ts
{
  provider: {
    driver: 'database'
    identifierKey: 'id',
    uids: ['email'],
    usersTable: 'users',
    connection: 'pg'
    hashDriver: 'argon'
  }
}
```

#### driver
The driver name must always be set to `database`.

---

#### identifierKey
The `identifierKey` is usually the primary key of the configured database table. The authentication package needs it to uniquely identify a user.

---

#### uids
An array of model columns to use for the user lookup. The `auth.login` method uses the `uids` to find a user by the provided value.

For example: If your application allows login with email and username both, then you must define them as `uids`. Also, you need to define the model column names and not the database column names.

---

#### usersTable
The name of the database table to use for users lookup.

```ts
{
  usersTable: 'users'
}
```

---

#### connection
The database connection to use to make the SQL queries. If not defined, the default connection from the `config/database.ts` file is used.

---

#### hashDriver

The driver to use for verifying the user password hash. It is used by the `auth.login` method. If not defined, we will use the default hash driver from the `config/hash.ts` file.

---
