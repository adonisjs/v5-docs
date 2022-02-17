This release introduces [AdonisJS drive](#drive) (a new official package), along with some bug fixes, minor improvements and a breaking change.

## Upgrading to the latest versions
The following packages have been updated during the current release.

- Updated `@adonisjs/core` from version ` 5.1.8 -> 5.3.2`
- Updated `@adonisjs/ally` from version `4.0.2 -> 4.1.1`
- Updated `@adonisjs/view` from version `6.0.3 -> 6.1.0`
- Updated `@adonisjs/repl` from version `3.1.2 -> 3.1.6`
- :span[[Breaking change](#breaking-change)]{class="badge badge-danger"} &nbsp; Updated `@adonisjs/lucid` from version `15.0.1 -> 16.0.0`
- Updated `@adonisjs/auth` from version `8.0.5 -> 8.0.9`

You can upgrade to the latest packages using the `npm update` command or manually install packages with the `@latest` tag.

:::note

Even though the following packages have received new features/bug fixes. We still recommend updating all of your AdonisJS packages.

:::

```sh
npm i @adonisjs/core@latest
npm i @adonisjs/ally@latest
npm i @adonisjs/view@latest
npm i @adonisjs/repl@latest
npm i @adonisjs/lucid@latest
npm i @adonisjs/auth@latest
```

## Drive
[AdonisJS Drive](../guides/digging-deeper/drive.md) makes it super simple to manage user uploaded files and save them to cloud storage services like **S3**, **Digital ocean spaces** or **Google cloud storage**.

The best part is, you can still save files on your local file system during development and switch the driver in production to use a cloud storage service (without changing any code).

### Using Drive in existing applications
New AdonisJS applications are pre-configured with drive. However, you can also add drive to your existing applications.

:::note

Double-check you are using `@adonisjs/core >= 5.3.0`

:::

- Create a `contracts/drive.ts` file and copy-paste the [contracts stub](https://raw.githubusercontent.com/adonisjs/core/master/templates/contracts/drive.txt) inside it. Feel free to uncomment the `s3` and `gcs` blocks (if using them).
- Create a `config/drive.ts` file and copy-paste the [config stub](https://raw.githubusercontent.com/adonisjs/core/master/templates/config/drive.txt) inside it.
- Define the `DRIVE_DISK` environment variable inside the `.env` file.
  
  ```dotenv
  DRIVE_DISK=local
  ```

---

### Validating environment variables

Optionally, you can also validate the environment variables inside the `env.ts` file. Just inspect your drive config file and define the validation rules for the environment variables you are using.

---

### Installing gcs and s3 drivers
Make sure to install the `gcs` and `s3` drivers when planning to use these services.

The `configure` command for both the packages will guide you to make necessary changes to the config and the contracts file.

```sh
# For s3 and digital ocean spaces
npm i @adonisjs/drive-s3
node ace configure @adonisjs/drive-s3

# For google cloud storage
npm i @adonisjs/drive-gcs
node ace configure @adonisjs/drive-gcs
```

That's all you need to do.

## Ally Spotify driver
Ally now ships with the Spotify driver as well. It was [contributed](https://github.com/adonisjs/ally/pull/123) by [romch007](https://github.com/romch007).

To start using the Spotify driver, you must update the `contracts/ally.ts` file to include Spotify mapping.

```ts
// title: contracts/ally.ts
declare module '@ioc:Adonis/Addons/Ally' {
  // ...other mappings
  spotify: {
    config: SpotifyDriverConfig
    implementation: SpotifyDriverContract
  }
}
```

Next, define the configuration inside the `config/ally.ts` file.

```ts
const allyConfig: AllyConfig = {
  spotify: {
    driver: 'spotify',
    clientId: Env.get('SPOTIFY_CLIENT_ID'),
    clientSecret: Env.get('SPOTIFY_CLIENT_SECRET'),
    callbackUrl: 'http://localhost:3333/spotify/callback',
  },
}
```

## Lazy loading relationship aggregates
Lucid now allows you to lazy load relationship aggregates using the `loadCount` and `loadAggregate` methods.

```ts
const post = await Post.firstOrFail()
await post.loadCount('comments')

console.log(post.$extras.comments_count)
```

The `loadAggregate` method allows you to define a custom aggregate method. For example:

```ts
const user = await User.firstOrFail()
  
user.loadAggregate('exams', (query) => {
  query.sum('marks').as('totalMarks')
})

console.log(user.$extras.totalMarks)
```

[Here's](../guides/models/relationships.md#relationship-aggregates) the complete documentation for relationship aggregates.

## Template `env` and `config` globals
The edge templates can now access the `env` and the `config` globals to access environment variables and application config.

- The `env` global is a reference to the [Env.get](../guides/fundamentals/environment-variables.md#access-environment-variables) method.
- The `config` global is a reference to the [Config.get](../guides/fundamentals/config.md#using-the-config-provider) method.

```edge
{{ env('APP_KEY') }}
{{ config('app.key') }}
```

## Breaking change
This is a subtle change in how Lucid models consume the database response of a query. Before this change, we moved all unknown properties (not defined as columns on the model) to the `$extras` object. For example:

```ts
class User extends BaseModel {
  @column()
  public id: number

  @column()
  public name: string
}

// Make a join query with the user_logins 
const users = await User
  .query()
  .select('*')
  .select('user_logins.ip_address')
  .innerJoin('user_logins', 'users.id', 'user_logins.user_id')
```

Before this change, we will move the `ip_address` value to the `$extras` object on the User model instance, and you can access it as follows.

```ts
users[0].$extras.ip_address
```

Now, if you define `ip_address` as a regular property on the User model, Lucid will set its value and not move `ip_address` to the `$extras` object.

```ts
class User extends BaseModel {
  @column()
  public id: number

  @column()
  public name: string

  // highlight-start
  public ip_address: string
  // highlight-end
}
```

And you can access the `ip_address` as a regular property from the User model instance.

```ts
users[0].ip_address
```

You also must enable [useDefineForClassFields](https://www.typescriptlang.org/tsconfig/useDefineForClassFields.html) inside the `tsconfig.json` file for this feature to work as expected.

```json
{
  "compilerOptions": {
    "useDefineForClassFields": true
  }
}
```

## Upgrade luxon

AdonisJS packages that rely on [luxon](https://moment.github.io/luxon/#/) have been updated to use `luxon@2`. We recommend you to upgrade the luxon version in your applications as well.
 
## Other improvements

- improvement: use isDateTime method of luxon over instanceof [5b5e69ef](https://github.com/adonisjs/validator/commit/5b5e69ef398af5a31a841fdd338d166a1874795c).
- refactor: allow select method to accept numeric values [478fd7df](https://github.com/adonisjs/lucid/commit/478fd7df48fc28aaa50dba18685050a7828d5e44)
- refactor: do not select all columns for unique and exists validator rules [7beaa798](https://github.com/adonisjs/lucid/commit/7beaa79834de72cd80c3cd9e0d12a0d278130c02)
- fix: lucid-slugify generate alpha-numeric only slugs [46884629](https://github.com/adonisjs/lucid-slugify/commit/468846296693962b0ecce85ad46f186e20b554c5)
- feat: add dashcase to GeneratorFileOptions [ac785818](https://github.com/adonisjs/ace/commit/ac785818615953aa83f97087e84f2e06d6918d23)

## Bug fixes

- fix: escape single sequence [2f0592b2](https://github.com/adonisjs/env/commit/2f0592b27e32575ec3714c664cfff068b068cd2b).
- fix: set response status code to 304 when cache is fresh [a901f12d](https://github.com/adonisjs/http-server/commit/a901f12d4b4433b7cdad1dcdacbcb3f73700c8f3)
- fix: make url for route with a wildcard param [e02b3b26](https://github.com/adonisjs/http-server/commit/e02b3b266cfffab5354f08eb42cfd87e469ec4a7)
- fix: allow updating primary key localy when using `selfAssignPrimaryKey` [f1c2e5fa](https://github.com/adonisjs/lucid/commit/f1c2e5fad26337086dc188061f97d64463e00764)
- fix: normalize seeder custom path for windows [1856ba78](https://github.com/adonisjs/lucid/commit/1856ba783fff5f89f6a74d34327068ece4293aa5)
- fix: Model query builder update method should resolve real column names [dacfc5f4](https://github.com/adonisjs/lucid/commit/dacfc5f4f3dabf8117361a405aff4acafba10fb7)
- fix: convert `schema.date` instances to a string when querying for exists rule [89a495e1](https://github.com/adonisjs/lucid/commit/89a495e1a6bacfaf7f5e239575d04c599cfe3c1b)
- fix: increment & decrement methods resolve key names from model columns [027f15e3](https://github.com/adonisjs/lucid/commit/027f15e3039842ed344aefefa3e69f4dab517a1b)
- fix: mark repl file as virtual when compiling ts source [193f4297](https://github.com/adonisjs/repl/commit/193f4297986e431cfea979afa5370c124b23ed86)
