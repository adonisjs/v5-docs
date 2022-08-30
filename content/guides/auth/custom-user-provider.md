User providers are used for looking up a user for authentication. The auth module ships with a [Database provider](https://github.com/adonisjs/auth/blob/develop/src/UserProviders/Database/index.ts) and a [Lucid provider](https://github.com/adonisjs/auth/blob/develop/src/UserProviders/Lucid/index.ts) to look up users from a SQL database using the Lucid ORM.

You can also extend the Auth module and add custom User providers if you want to look up users from a different data source. In this guide, we will go through the process of adding a custom user provider.

:::note
Here is an [example project](https://github.com/adonisjs-community/auth-mongoose-provider) using mongoose to lookup users from a MongoDB database. You can use it as an inspiration to create your own provider.
:::

## Extending from outside in
Anytime you are extending the core of the framework. It is better to assume that you do not have access to the application code and its dependencies. In other words, write your extensions as if you are writing a third-party package and use dependency injection to rely on other dependencies.

Let's begin by creating a user provider that relies on a MongoDB client to look up the users from the database. **The following examples use dummy code for the MongoDB queries, and you must replace them with your own implementation**.

```sh
mkdir providers/MongoDbAuthProvider
touch providers/MongoDbAuthProvider/index.ts
```

The directory structure will look as follows.

```
providers
└── MongoDbAuthProvider
    └── index.ts
```

Open the newly created `MongoDbAuthProvider/index.ts` file and paste the following code inside it.

```ts
// title: providers/MongoDbAuthProvider/index.ts
import type { HashContract } from '@ioc:Adonis/Core/Hash'
import type {
    UserProviderContract,
    ProviderUserContract
} from '@ioc:Adonis/Addons/Auth'

/**
 * Shape of the user object returned by the "MongoDbAuthProvider"
 * class. Feel free to change the properties as you want
 */
export type User = {
  id: string
  email: string
  password: string
  rememberMeToken: string | null
}

/**
 * The shape of configuration accepted by the MongoDbAuthProvider.
 * At a bare minimum, it needs a driver property
 */
export type MongoDbAuthProviderConfig = {
  driver: 'mongo'
}

/**
 * Provider user works as a bridge between your User provider and
 * the AdonisJS auth module.
 */
class ProviderUser implements ProviderUserContract<User> {
  constructor(public user: User | null, private hash: HashContract) {}

  public getId() {
    return this.user ? this.user.id : null
  }

  public getRememberMeToken() {
    return this.user ? this.user.rememberMeToken : null
  }

  public setRememberMeToken(token: string) {
    if (!this.user) {
      return
    }
    this.user.rememberMeToken = token
  }

  public async verifyPassword(plainPassword: string) {
    if (!this.user) {
      throw new Error('Cannot verify password for non-existing user')
    }

    return this.hash.verify(this.user.password, plainPassword)
  }
}

/**
 * The User provider implementation to lookup a user for different
 * operations
 */
export class MongoDbAuthProvider implements UserProviderContract<User> {
  constructor(
    public config: MongoDbAuthProviderConfig,
    private hash: HashContract
  ) {}

  public async getUserFor(user: User | null) {
    return new ProviderUser(user, this.hash)
  }

  public async updateRememberMeToken(user: ProviderUser) {
    await mongoDbClient.updateOne(
      { _id: user.getId() },
      { rememberMeToken: user.getRememberMeToken() }
    )
  }

  public async findById(id: string | number) {
    const user = await mongoDbClient.findById(id)
    return this.getUserFor(user || null)
  }

  public async findByUid(uidValue: string) {
    const user = await mongoDbClient.findOne().where('email').equals(uidValue)
    return this.getUserFor(user || null)
  }

  public async findByRememberMeToken(userId: string | number, token: string) {
    const user = await mongoDbClient
      .findOne()
      .where('_id').equals(userId)
      .where('rememberMeToken').equals(token)

    return this.getUserFor(user || null)
  }
}
```

That's a lot of code, so let's break it down and understand the purpose of each class and its methods.

### User type
The `export type User` block defines the shape of the user your provider will return. If you are using an ORM, you can infer the User type from some model, but the main goal is to have a pre-defined representation of a user.

```ts
export type User = {
  id: string
  email: string
  password: string
  rememberMeToken: string | null
}
```

### MongoDb Provider config
The `MongoDbAuthProviderConfig` type defines the shape of the config accepted by your provider. It must have at least the `driver` property reflecting the driver's name you want to register with the auth module.

```ts
export type MongoDbAuthProviderConfig = {
  driver: 'mongo'
}
```

### ProviderUser class
The `ProviderUser` class is a bridge between your **UserProvider** and the AdonisJS auth module. The auth module does not know the properties that exist on the user object you fetched from a data source, and hence it needs some way to **lookup the id** or **verify the user password**. 

This is where the `ProviderUser` class comes into the picture. It must implement the [ProviderUserContract](https://github.com/adonisjs/auth/blob/develop/adonis-typings/auth.ts#L52) interface.

We also accept the `hash` module as a constructor argument to verify the user passwords using the [AdonisJS hash module](../security/hashing.md).

```ts
class ProviderUser implements ProviderUserContract<User> {
  constructor(public user: User | null, private hash: HashContract) {}

  public getId() {
    return this.user ? this.user.id : null
  }

  public getRememberMeToken() {
    return this.user ? this.user.rememberMeToken : null
  }

  public setRememberMeToken(token: string) {
    if (!this.user) {
      return
    }
    this.user.rememberMeToken = token
  }

  public async verifyPassword(plainPassword: string) {
    if (!this.user) {
      throw new Error('Cannot verify password for non-existing user')
    }

    return this.hash.verify(this.user.password, plainPassword)
  }
}
```

#### getId
Return the value for a property that uniquely identifies the user.

---

#### getRememberMeToken
Return the value of the remember me token. It must be a string or `null` when no remember me token was generated.

---

#### setRememberMeToken
Get the remember me token property on the user object. Do note; you do not persist the remember me token inside this method. You just update the property.

The token is persisted by the `updateRememberMeToken` on the `UserProvider` class.

---

#### verifyPassword
Verify the user password. This method receives the plain text password from the auth module and must return `true` if the password matches or `false` if the password is incorrect.

---

### UserProvider class
The `UserProvider` class is used to look up a user or persist the remember me token for a given user. This is the class that you will later register with the AdonisJS auth module.

The `UserProvider` must implement the [UserProviderContract](https://github.com/adonisjs/auth/blob/develop/adonis-typings/auth.ts#L63) interface.

```ts
export class MongoDbAuthProvider implements UserProviderContract<User> {
  constructor(
    public config: MongoDbAuthProviderConfig,
    private hash: HashContract
  ) {}

  public async getUserFor(user: User | null) {
    return new ProviderUser(user, this.hash)
  }

  public async updateRememberMeToken(user: ProviderUser) {
    await mongoDbClient.updateOne(
      { _id: user.getId() },
      { rememberMeToken: user.getRememberMeToken() }
    )
  }

  public async findById(id: string | number) {
    const user = await mongoDbClient.findById(id)
    return this.getUserFor(user || null)
  }

  public async findByUid(uidValue: string) {
    const user = await mongoDbClient.findOne().where('email').equals(uidValue)
    return this.getUserFor(user || null)
  }

  public async findByRememberMeToken(userId: string | number, token: string) {
    const user = await mongoDbClient
      .findOne()
      .where('_id').equals(userId)
      .where('rememberMeToken').equals(token)

    return this.getUserFor(user || null)
  }
}
```

#### getUserFor
Returns a [ProviderUser](#provideruser-class) instance for the user object you lookup from a data source.

---

#### updateRememberMeToken
Update the data source with the new remember me token. This method receives an instance of the `ProviderUser` class with the update `rememberMeToken` property.

---

#### findById
Find a user by their unique id. This method must return an instance of the [ProviderUser](#provideruser-class) class.

---

#### findByUid
Find a user for login by using either their email address or username or any other property applicable to your data source.

For example, The Lucid provider [relies on the config](https://github.com/adonisjs/auth/blob/develop/src/UserProviders/Lucid/index.ts#L160-L162) to look up a user by uid.

This method must return an instance of the [ProviderUser](#provideruser-class) class.

---

#### findByRememberMeToken
Find a user by their remember me token. The method receives the user id, and the remember me token both.

This method must return an instance of the [ProviderUser](#provideruser-class) class.

## Registering the User provider
The next step is to register the User provider with the auth module. You must do it inside the provider's` boot` method. For this example, we will make use of the `providers/AppProvider.ts` file.

```ts
// title providers/AppProvider.ts
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public async boot() {
    const Auth = this.app.container.resolveBinding('Adonis/Addons/Auth')
    const Hash = this.app.container.resolveBinding('Adonis/Core/Hash')

    const { MongoDbAuthProvider } = await import('./MongoDbAuthProvider')

    Auth.extend('provider', 'mongo', (_, __, config) => {
      return new MongoDbAuthProvider(config, Hash)
    })
  }
}
```

The `Auth.extend` method accepts a total of three arguments.

- The type of extension. It should always be set to `provider` when adding a user provider.
- The name of the provider
- And finally, a callback that returns an instance of the User provider. The callback method receives the `config` as the 3rd argument.

## Update types and config
Before you can start using the `mongo` provider, you will have to define it inside the contract file and define its config.

Open the `contracts/auth.ts` file and append the following code snippet inside it.

```ts
// title: contracts/auth.ts
import type {
  MongoDbAuthProvider,
  MongoDbAuthProviderConfig,
} from '../providers/MongoDbAuthProvider'

declare module '@ioc:Adonis/Addons/Auth' {
  interface ProvidersList {
    // highlight-start
    user: {
      implementation: MongoDbAuthProvider
      config: MongoDbAuthProviderConfig
    }
    // highlight-end
  }

  interface GuardsList {
    web: {
      implementation: SessionGuardContract<'user', 'web'>
      config: SessionGuardConfig<'user'>
    }
  }
}
```

Finally, let's update the `config/auth.ts` file and define the config for the user provider.

```ts
// title: config/auth.ts
const authConfig: AuthConfig = {
  guard: 'web',
  guards: {
    web: {
      driver: 'session',

      // highlight-start
      provider: {
        driver: 'mongo'
      }
      // highlight-end
    }
  }
}
```
