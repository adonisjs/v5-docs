---
summary: Reference guide for the Hash module.
---

AdonisJS Hash module allows you to hash the values using **bcrypt** or **Argon2**, along with the option to add a custom hashing driver.

You can configure the driver of your choice inside the `config/hash.ts` file.

```ts
const hashConfig: HashConfig = {
  default: Env.get('HASH_DRIVER', 'argon'),

  list: {
    /**
     * Make sure to install the driver from npm
     * ------------------------------------
     * npm i phc-argon2
     * ------------------------------------
     */
    argon: {
      driver: 'argon2',
      variant: 'id',
      iterations: 3,
      memory: 4096,
      parallelism: 1,
      saltSize: 16,
    },

    /**
     * Make sure to install the driver from npm
     * ------------------------------------
     * npm i phc-bcrypt
     * ------------------------------------
     */
    bcrypt: {
      driver: 'bcrypt',
      rounds: 10,
    },
  },
}

export default hashConfig
```

#### Default hasher

The `default` property configures the hasher to use by default for hashing values. It must be one of the available hashers from the list object.

---

#### Available hashers

The `list` object contains one or more hashers available to be used for hashing values. Each hasher must use one of the available drivers. For example:

- The argon hasher uses the `argon2` driver.
- The bcrypt hasher uses the `bcrypt` driver.

```sh
# If using bcrypt
npm i phc-bcrypt

# If using argon2
npm i phc-argon2
```

## Hashing values

### make

The `Hash.make` method accepts a string value to a hash.

```ts
import Hash from '@ioc:Adonis/Core/Hash'
const hashedPassword = await Hash.make(user.password)
```

Most of the time, you will be hashing the user's password, so it is better to use a model hook to perform the hashing.

```ts
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: null })
  public password: string

  // highlight-start
  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
  // highlight-end
}
```

---

### verify

You cannot convert hashed values back to a plain string, and you can only verify that a given plain-text string corresponds to a given hash.

```ts
if (await Hash.verify(hashedValue, plainTextValue)) {
  // verified
}
```

---

### needsReHash

Find if a previously hashed value needs a rehash. This method returns true if the work factor used by the hasher has changed since the password was hashed.

The best time to check for `needsReHash` is usually during the user login.

```ts
if (Hash.needsReHash(user.password)) {
  // You will have to tweak the model hook to not
  // rehash the already hashed password
  user.password = await Hash.make(plainPassword)
}
```

## PHC string format

The bcrypt and Argon2 drivers return the hash output per the [PHC string format](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md). It allows us to verify the hashes against the current configuration of a hasher and decide if the hash needs to be rehashed or not.

## Adding a custom driver

The Hash module is extensible and allows you to register your own custom drivers. Every driver must implement the following `HashDriverContract` interface:

```ts
interface HashDriverContract {
  ids?: string[]
  params?: any

  /**
   * Hash plain text value using the default mapping
   */
  make(value: string): Promise<string>

  /**
   * Check the hash against the current config to find it needs
   * to be re-hashed or not
   */
  needsReHash?(hashedValue: string): boolean

  /**
   * Verify plain value against the hashed value to find if it's
   * valid or not
   */
  verify(hashedValue: string, plainValue: string): Promise<boolean>
}
```

#### make

The `make` method is responsible for hashing the plain string value.

---

#### verify

The `verify` method is responsible for verifying the plain string against a pre-existing hash.

---

#### needsReHash

The `needsReHash` is optional. However, it must be implemented if your hashing algorithm has support for it.

---

#### params/ids

The `params` and the `ids` properties are something you need when using the PHC string format. Just check the existing driver's implementation and read about the PHC string format to learn more about it.

---

### Extending from outside in

Anytime you are extending the core of the framework. It is better to assume that you do not have access to the application code and its dependencies. In other words, write your extensions as if you are writing a third-party package and use dependency injection to rely on other dependencies.

For demonstration purposes, let's create a dummy hash driver:

```sh
mkdir providers/HashDriver
touch providers/HashDriver/index.ts
```

The directory structure will look as follows.

```
providers
└── HashDriver
 └── index.ts
```

Open the `HashDriver/index.ts` file and paste the following contents inside it.

```ts
// title: providers/HashDriver/index.ts
import { HashDriverContract } from '@ioc:Adonis/Core/Hash'

export class FakeDriver implements HashDriverContract {
  public async make(value: string) {
    return value
  }

  public async verify(hashedValue: string, plainValue: string) {
    return hashedValue === plainValue
  }
}
```

Finally, open the `providers/AppProvider.ts` file and add the custom driver inside the `boot` method.

```ts
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  public static needsApplication = true

  constructor(protected app: ApplicationContract) {}

  public async boot() {
    const { FakeDriver } = await import('./HashDriver')
    const Hash = this.app.container.use('Adonis/Core/Hash')

    Hash.extend('fake', () => {
      return new FakeDriver()
    })
  }
}
```

Voila! Your `fake` driver is ready to be used.

### Updating the contract

In the following example, we add a new hasher named `fakeHasher` and force its config to always have `fake` as the value for the driver.

```ts
// title: contracts/hash.ts

declare module '@ioc:Adonis/Core/Hash' {
  interface HashersList {
    // ...other hashers
    fakeHasher: {
      config: {
        driver: 'fake'
      }
      implementation: ArgonContract
    }
  }
}
```

### Updating the config

After updating the contract, TypeScript will complain about the missing `fakeHasher` inside the config file, and hence you must define it.

```ts
// title: config/hash.ts

list: {
  fakeHasher: {
    driver: 'fake',
  },
  // other hashers
}
```

### Giving it a test run

Open the AdonisJS REPL and give the fake hasher a try.

::video{url="https://res.cloudinary.com/adonis-js/video/upload/q_auto,f_auto/v1614925151/v5/fake-hash-driver-test-run.mp4" controls}
