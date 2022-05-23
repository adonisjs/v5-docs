This release improves Lucid model factories and the ability to switch Drive S3 and GCS buckets at runtime. In addition, the `make:suite` command to create new test suites and many bug fixes and minor improvements.

You must update all the packages under `@adonisjs` scope to their latest version. You can run the npm update command or use the following command to upgrade packages manually.

```sh
npx npm-check-updates -i
```

Once done, make sure to update the ace commands index by running following ace command.

```sh
node ace generate:manifest
```

## Infer TypeScript types from config
If you open `contracts/drive.ts`, `contracts/mail.ts`, or `contracts/hash.ts`, you will notice we have manually defined the mappings of the drivers we want to use within our application.

### Back story

Before moving forward, let's understand why we have to define these mappings on an interface, and we will use Drive as an example for the same.

In the following import statement, the `Drive` object is a singleton created using the config defined inside the `config/drive.ts` file and you switch between the disks using the `Drive.use` method.

```ts
import Drive from '@ioc:Adonis/Core/Drive'

Drive.use('<use-any-mapping-from-config-file>')
```

All this works as expected at runtime. However, TypeScript has no way to make a relation between the **Drive import** and **its config file**. Therefore the TypeScript static compiler cannot provide any IntelliSense or type safety.

To combat that, we use an interface called `DisksList` and explicitly inform the TypeScript compiler about the mappings/disks we want to use inside our application.

```ts
declare module '@ioc:Adonis/Core/Drive' {
  interface DisksList {
    local: {
      config: LocalDriverConfig
      implementation: LocalDriverContract
    }
    s3: {
      config: S3DriverConfig
      implementation: S3DriverContract
    }
  }
}
```

In a nutshell, we have disk mappings in two places.

- First is the contracts file for the TypeScript compiler.
- Another is the config file for runtime JavaScript.

We can do better here and reduce the mental fatigue of defining mappings at multiple places. Technically it is possible by inferring the TypeScript types directly from the config.

In this and the upcoming releases, we will incrementally remove the manually defined mappings from the interface and use config inference. This release focuses on **Drive**, **Mailer**, and the **Hash** module.

### Updating Drive config and contract
Open the `config/drive.ts` file and wrap the config object within the `driveConfig` method below.

```ts
// title: config/drive.ts
// delete-start
import { DriveConfig } from '@ioc:Adonis/Core/Drive'
// delete-end
// insert-start
import { driveConfig } from '@adonisjs/core/build/config'
// insert-end

// delete-start
const driveConfig: DriveConfig = {
// delete-end
  // ...configObject
// insert-start
export default driveConfig({
})
// insert-end

// delete-start
export default driveConfig
// delete-end
```

The next step is to replace the entire contents of the `contracts/drive.ts` file with the following code block.

```ts
// title: contracts/drive.ts
import { InferDisksFromConfig } from '@adonisjs/core/build/config'
import driveConfig from '../config/drive'

declare module '@ioc:Adonis/Core/Drive' {
  interface DisksList extends InferDisksFromConfig<typeof driveConfig> {}
}
```

---

### Updating Mail config and contract
Open the `config/mail.ts` file and wrap the config object within the `mailConfig` method below.

```ts
// title: config/mail.ts
// delete-start
import { MailConfig } from '@ioc:Adonis/Addons/Mail'
// delete-end
// insert-start
import { mailConfig } from '@adonisjs/mail/build/config'
// insert-end

// delete-start
const mailConfig: MailConfig = {
// delete-end
  // ...configObject
// insert-start
export default mailConfig({
})
// insert-end

// delete-start
export default mailConfig
// delete-end
```

The next step is to replace the entire contents of the `contracts/mail.ts` file with the following code block.

```ts
// title: contracts/mail.ts
import { InferMailersFromConfig } from '@adonisjs/mail/build/config'
import mailConfig from '../config/mail'

declare module '@ioc:Adonis/Addons/Mail' {
  interface MailersList extends InferMailersFromConfig<typeof mailConfig> {}
}
```

---

### Updating Hash config and contract
Open the `config/hash.ts` file and wrap the config object within the `hashConfig` method below.

```ts
// title: config/hash.ts
// delete-start
import { HashConfig } from '@ioc:Adonis/Core/Hash'
// delete-end
// insert-start
import { hashConfig } from '@adonisjs/core/build/config'
// insert-end

// delete-start
const hashConfig: HashConfig = {
// delete-end
  // ...configObject
// insert-start
export default hashConfig({
})
// insert-end

// delete-start
export default hashConfig
// delete-end
```

The next step is to replace the entire contents of the `contracts/hash.ts` file with the following code block.

```ts
// title: contracts/hash.ts
import { InferListFromConfig } from '@adonisjs/core/build/config'
import hashConfig from '../config/hash'

declare module '@ioc:Adonis/Core/Hash' {
  interface HashersList extends InferListFromConfig<typeof hashConfig> {}
}
```

That is all. We will also introduce config type inference for other packages in future releases.

## Lucid model factory improvements and new commands
The following new methods/properties have been added to Lucid model factories.

### tap
The `tap` method allows you to access the underlying model instance before it is persisted using the factory. You can use this method to define additional attributes on the model.

```ts
UserFactory
  .tap((user) => user.isAdmin => true)
  .create()
```

---

### parent
You can access the `parent` of a relationship inside the `with` callback. This is usually helpful when you want to infer some attributes from the parent model.

We infer the `tenantId` property from the User model instance in the following example.

```ts
await TenantFactory
  .with('users', 1, (user) => {
    user
      .with('posts', 2, (post) => {
        post.merge({ tenantId: post.parent.tenantId })
      })
  })
  .create()
```

---

### pivotAttributes
You can define pivot attributes for a many-to-many relationship using the `pivotAttributes` method.

```ts
await Team.with('users', 2, (user) => {
  user.pivotAttributes({ role: 'admin' })
})
```

---

### mergeRecursive
You often want to merge attributes with all the children's relationships. 

Let's take the previous example of defining the tenant id on the Post model. Instead of accessing the Post factory builder and then calling the `merge` method, we can recursively pass the `tenantId` to all the children relationships from the User factory.

```ts
await TenantFactory
  .with('users', 1, (user) => {
    user
      // insert-start
      .mergeRecursive({ tenantId: user.parent.id })
      .with('posts', 2)
      // insert-end
      // delete-start
      .with('posts', 2, (post) => {
        post.merge({ tenantId: post.parent.tenantId })
      })
      // delete-end
  })
  .create()
```

---

### `make:factory` command
You can now make a new factory by running the `node ace make:factory ModelName` command. Also, you can pass the `-f` flag to the `make:model` command to create a factory alongside a model.

```sh
node ace make:factory User

# create a factory with model
node ace make:model User -f

# create factory + migration with model
node ace make:model User -cf
```

## Upgrading to Knex 2.0
We have upgraded the Knex version to 2.0, resulting in a **small breaking change for SQLite users**. Earlier, knex used the `@vscode/sqlite3` package for the SQLite connection. However, now it relies on the `sqlite3` package. 

If you are using SQLite, uninstall the old dependency and favor the new one.

```sh
npm uninstall @vscode/sqlite3

npm install sqlite3
```

Lucid now also ships with the following query builder methods. They were introduced in Knex 1.0.

- `whereLike` and `whereILike`
- `whereJson`, `whereJsonSuperset`, `whereJsonSubset`, and `whereJsonPath`.

## Drive improvements
You can now switch buckets at runtime before performing a Drive operation. The `drive-s3` and the `drive-gcs` ship with a new `bucket` method.

```ts
await Drive
  .use('s3')
  // highlight-start
  .bucket('bucket-name')
  // highlight-end
  .put(path, contents)
```

### Prevention for path traversal
In earlier versions of Drive using local driver, the absolute paths were working with drive methods without prefixing them with disk root. To prevent [Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal) it has been changed to always resolve paths relative to the root of the defined disk and not from the entire filesystem. If you are using absolute paths with Drive like in the example below, please change it to relative locations. This applies to all Drive methods not only `put`.

```ts
const filename = 'somefile.txt'
const contents = '...'
// delete-start
await Drive.put(
  // DO NOT resolve absolute path for filename
  Application.tmpPath('uploads', filename),
  contents
)
// delete-end
// insert-start
// instead just let Drive to prefix it with
// defined root for given disk inside config
await Drive.put(filename, contents)
// insert-end
```

### Experimental `list` method
The `local` driver of Drive now ships with an [expiremental list method](https://github.com/adonisjs/drive/pull/39) to list all files inside a given directory. We will implement the same for the S3 and the GCS drivers in the coming days.

Since implementing the `list` method is experimental, we might change the final APIs.

## Testing improvements

- A new `make:suite` command has been [added](https://github.com/adonisjs/assembler/pull/48) to create a new test suite and register it inside the `.adonisrc.json` file.
- Add support to filter tests by the test title. For example, you can now pass the `--tests="the title of the test"`to run tests matching the mentioned title.
- The [migrations](https://github.com/adonisjs/lucid/pull/836) and [database seeders](https://github.com/adonisjs/lucid/pull/838) now runs in compact mode during tests.


## Commits

- feat: filter tests by title - [09d2b81](https://github.com/adonisjs/assembler/commit/09d2b81b3f5467260efb47d52b6ce34a471a43f2)
- fix: array filters passed to TestProcess were not processed properly - [f7a3069](https://github.com/adonisjs/assembler/commit/f7a3069d2fb8045b323c168c275c430281b937c1)
- feat: add `make:suite` command [018da9d](https://github.com/adonisjs/assembler/commit/018da9d1094155babda8c8e12b3a84a1876fa58a)
- feat: add support to find routes by identifier [7920caf](https://github.com/adonisjs/http-server/commit/7920caf0c757630ee45e1ee73955ae4caa17668e)
- feat: add route lookup methods on the router class [9211cfd](https://github.com/adonisjs/http-server/commit/9211cfd20a82f8121608b4935852178be4a28fe2)
- fix: do not use a magic method to compute file name when the file type is not supported [0740a35](https://github.com/adonisjs/bodyparser/commit/0740a35f46ea48204db3c391f82affe7699b3ce2)
- fix: retain default value assigned to arguments on the class instance [cf51363](https://github.com/adonisjs/ace/commit/cf513638642f881cbb3420da5bc5d2b4a7297333)
- fix: use the mutated value for validating minLength and maxLength [80081bb](https://github.com/adonisjs/validator/commit/80081bb6bc3fee270cbf319cebdb8e7f432bb5fe)
- fix: define serialize property for the attachment column [b847dae](https://github.com/adonisjs/attachment-lite/commit/b847dae32707fb332eb48b2e5421d53160b9706f)
- fix: do not persist pre-computed URL to be database [ecc6397](https://github.com/adonisjs/attachment-lite/commit/ecc6397c282c3daecf1675b938418e8866c90d8a)
- feat: add config helper and type from infer disklist from config [92d1448](https://github.com/adonisjs/drive/commit/92d1448f2934247beae497003bc0ccfd164269f5)
- feat: add support for listing files inside a directory [e98cb43](https://github.com/adonisjs/drive/commit/e98cb43f182b9e9822a9267f4fe8f8b7ef448bd7)
- feat: add hashConfig method to define the hash config [87f8e4f](https://github.com/adonisjs/hash/commit/87f8e4fe07cdb851d57dbb513cb321667d37340e)
- fix: add stayAlive to ListRoutes command (#3703) [36406f5](https://github.com/adonisjs/core/commit/36406f593cad2978b9ebbd3daa0bdd569727c664)
- fix: check for the main command name inside command aliases as well [1f8da36](https://github.com/adonisjs/core/commit/1f8da36395c349698430a0a393687ee39cf69154)
- feat: add support to switch bucket at runtime [8d75ec4](https://github.com/adonisjs/drive-gcs/commit/8d75ec42c7325c0bad45f9450a6c5ccaacaa69af)
- feat: add support to switch bucket at runtime [208e5bb](https://github.com/adonisjs/drive-s3/commit/208e5bbc9e316317424957eb5122ef1cbddb19f0)
- feat: add mailConfig method to infer types from user-defined config [7cd6313](https://github.com/adonisjs/mail/commit/7cd63132bf0f733fe4040370938e8a1b3751e46e)
- feat: add redisConfig method to infer types from config [abc1ce3](https://github.com/adonisjs/redis/commit/abc1ce323f8beb4458e8218e3560b55a88d08b73)
- fix: use response cookies to read the session id [38ccee9](https://github.com/adonisjs/session/commit/38ccee9e14cea5ea6d39b2cc5356550e25099d62)
- refactor: regenerate session id as soon as regenerate method is called [cb21abf](https://github.com/adonisjs/session/commit/cb21abf41487dc034fce6660cbce4e96c381e261)
- feat: add sessionConfig helper method [70cbca0](https://github.com/adonisjs/session/commit/70cbca0261877ae7558a1f653e988b9385c631bd)
- feat: add dumpSession method [7289496](https://github.com/adonisjs/session/commit/72894969514200903b7f21b5d3574f0741307408)
- refactor: use anonymous classes for migrations (#829) [3d12a45](https://github.com/adonisjs/lucid/commit/3d12a45c5d29b2239c27e5eb548924ca149b3c71)
- chore: remove `@vscode/sqlite3` in favor of `sqlite3` [2332fbf](https://github.com/adonisjs/lucid/commit/2332fbf9b56520acebf30fa73672ea075f81ed48)
- refactor: pass factory builder instance to all factory operations [72f233c](https://github.com/adonisjs/lucid/commit/72f233c94955f030abe741863513d2544c558358)
- refactor: remove inline callbacks in favor of tap method [13588af](https://github.com/adonisjs/lucid/commit/13588afba08d36b1151a9be2cb93fff4408b811e)
- feat: add support to define pivot attributes via factory builder [49a1d04](https://github.com/adonisjs/lucid/commit/49a1d047be3bdd36f7a6ce57a4326241adc4f321)
- feat: allow passing model assignment options via relationship persistence methods [5b2f846](https://github.com/adonisjs/lucid/commit/5b2f846f766b1204c4fb9a51344d290ee39efd72)
- feat: allow model properties to report if they are dirty or not [e40297c](https://github.com/adonisjs/lucid/commit/e40297c51653c8561a941c004d0647e4665ebbc9)
- feat: add `--compact-output` flag to run/rollback commands (#836) [f8e0c8c](https://github.com/adonisjs/lucid/commit/f8e0c8c2e776d2811fe44d1290ea5ecc3ea6e3ab)
- feat: `make:factory` command + `--factory` flag to make:model (#837) [bd22c96](https://github.com/adonisjs/lucid/commit/bd22c9680a5b34dc6d7b5a4caf0ab2fc94f5860d)
- feat: add `withMaterialized` and `withNotMaterialized` to query builder [04c5c25](https://github.com/adonisjs/lucid/commit/04c5c25c0c74e53a4e3465833dcd4faa9b516194)
- feat: add `whereLike` and `whereILike` methods [1b6001d](https://github.com/adonisjs/lucid/commit/1b6001d57380a42d588b10869ae477f1bf0cf720)
- feat: expose knex query builder instance in schema classes [dff3f84](https://github.com/adonisjs/lucid/commit/dff3f84e7686089e1119d28620c9af5e8060d944)
- feat: add `--compact-output` on DbSeed command [3880c8d](https://github.com/adonisjs/lucid/commit/3880c8dc9c4761d653b0c084eb2127aaf361891c)
- feat: add where"JSON" methods introduced by Knex 1.0 [f875828](https://github.com/adonisjs/lucid/commit/f8758286e2cb90859df3b4da1eb58c6400df7b4c)
- fix: prefix table name when making relationship join queries [9385a9b](https://github.com/adonisjs/lucid/commit/9385a9b6fdfef41c866640c87ceaa4bd1d4ec437)
- feat: add support for recursively merging attributes from factories [8f708b3](https://github.com/adonisjs/lucid/commit/8f708b36f88d0025f23babba5f817b8b9a1f9bb3)
