---
summary: Reference guide for the Hash module.
---

AdonisJS Hash module allows you to hash the values using `bcrypt`, `argon2` or `scrypt` along with the option to add a custom hashing driver.

You can configure the driver of your choice inside the `config/hash.ts` file.

```ts
import { hashConfig } from '@adonisjs/core/build/config'

export default hashConfig({
  default: Env.get('HASH_DRIVER', 'scrypt'),

  list: {
    scrypt: {
      driver: 'scrypt',
      cost: 16384,
      blockSize: 8,
      parallelization: 1,
      saltSize: 16,
      keyLength: 64,
      maxMemory: 32 * 1024 * 1024,
    },
    
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
})
```

#### Default hasher

The `default` property configures the hasher to use by default for hashing values. It must be one of the available hashers from the list object.

---

#### Available hashers
The `list` object contains one or more hashers available to be used for hashing values. A hasher must use one of the available drivers.

- The `scrypt` hasher uses the [Node.js `cryto.scrypt` method](https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback) for generating and verifying hashes.
- The `argon` hasher uses the `argon2` driver. You will have to install the following package in order to use argon. **If you do not have any strong preference, we recommend you to use argon in production**
   ```sh
   npm i phc-argon2
   ```
- The `bcrypt` hasher uses the `bcrypt` driver. You will have to install the following package in order to use bcrypt.
   ```sh
   npm i phc-bcrypt
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

Our drivers return the hash output per the [PHC string format](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md). It allows us to verify the hashes against the current configuration of a hasher and decide if the hash needs to be rehashed or not.

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

export class PlainTextDriver implements HashDriverContract {
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
    const { PlainTextDriver } = await import('./HashDriver')
    const Hash = this.app.container.use('Adonis/Core/Hash')

    Hash.extend('plainText', () => {
      return new PlainTextDriver()
    })
  }
}
```

Voila! Your `PlainTextDriver` driver is ready to be used.

### Informing TypeScript about the new driver
Before someone can reference this driver within the `config/hash.ts` file. You will have to inform TypeScript static compiler about its existence. 

If you are creating a package, then you can write the following code inside your package main file, otherwise you can write it inside the `contracts/hash.ts` file.

```ts
import { PlainTextDriver } from '../providers/HashDriver'

declare module '@ioc:Adonis/Core/Hash' {
  interface HashDrivers {
    plainText: {
      config: {
        driver: 'plainText',
        // ...rest of the config
      }
      implementation: PlainTextDriver
    }
  }
}
```

### Updating the config
In order to use the driver, you will have to define a mapping within the config file setting the `driver=plainText`.

```ts
// title: config/hash.ts

list: {
  myHashDriver: {
    driver: 'plainText',
  },
  // other hashers
}
```

Now, you can use the newly defined mapping as follows.

```ts
await Hash.use('myHashDriver').make('foo')
```
