This is the first release after the major release of v5. So, this is special as it contains a handful of bug fixes and some improvements that didn't make it to the main release last month.

As always, let's start with the highlights of the release.

:::note

[Here's the summary](https://trello.com/c/1qTLaVPl/44-may-2021) of all the completed tasks and their related commits/PRs.

:::

## Upgrading to the latest versions
The following packages have been updated during the current release.

- Updated `@adonisjs/assembler` from version `5.1.1 -> 5.3.1`
- Updated `@adonisjs/ally` from version `3.2.1 -> 4.0.2`
- Updated `@adonisjs/lucid` from version `14.0.0 -> 15.0.1`
- Updated `@adonisjs/mail` from version ` 7.1.1 -> 7.2.1`
- Updated `@adonisjs/core` from version ` 5.1.6 -> 5.1.8`

You can upgrade to the latest versions of all the packages using the `npm update` command or manually installing packages with the `@latest` tag.

```sh
npm i @adonisjs/assembler@latest
npm i @adonisjs/ally@latest
npm i @adonisjs/lucid@latest
npm i @adonisjs/mail@latest
npm i @adonisjs/core@latest
```

## Async local storage and HTTP Context
This is a big one, contributed by [@targos](https://twitter.com/targos89). We are using ALS (async local storage) within the HTTP requests to make the [HTTP context](../guides/http/context.md) available anywhere inside your codebase. 

For example, with ALS enabled, you can write the following code.

```ts
import HttpContext from '@ioc:Adonis/Core/HttpContext'

class User extends BaseModel {
  public static query() {
    const ctx = HttpContext.get()!
    return super.query(ctx.tenant.connection)
  }
}
```

ALS is a complicated topic, as you first have to understand how the Node.js [event loop works](https://www.youtube.com/watch?v=8aGhZQkoFbQ) and its impact on how we write and structure our code.

We recommend first reading about [async hooks](https://nodejs.org/dist/latest-v16.x/docs/api/async_hooks.html) and [async local storage](https://nodejs.org/dist/latest-v16.x/docs/api/async_hooks.html#async_hooks_class_asynclocalstorage) in general and then head over to [AdonisJS ALS guide](../guides/fundamentals/async-local-storage.md) to learn about the usage within the framework.

- Original implementation [PR#18](https://github.com/adonisjs/http-server/pull/18)
- Further changes to the API [PR#42](https://github.com/adonisjs/http-server/pull/42)

## Facebook, Linkedin, and Discord social auth drivers
Along with the existing set of Ally drivers. We now also have the following drivers available.

- LinkedIn
- Discord driver is contributed by `Mesteery` [PR#120](https://github.com/adonisjs/ally/pull/120)
- Facebook driver is contributed by `irwing-reza` [PR#121](https://github.com/adonisjs/ally/pull/121)

Check out this [boilerplate repo](https://github.com/adonisjs-community/ally-driver-boilerplate) to create your custom ally drivers. We will appreciate it if you can publish it as a package on npm and [share it](https://github.com/adonisjs-community/awesome-adonisjs) with the rest of the community.

## Support for calendar events in the mailer
The [mailer](../guides/digging-deeper/mailer.md) now allows sending calendar invites by either attaching an existing invite (.ics file) or creating one on the fly using the calendar's fluent API. For example:

```ts
Mail.sendLater((message) => {
  message.icalEvent((calendar) => {
    calendar
      .createEvent({
        summary: 'Adding support for ALS',
        start: DateTime.local().plus({ minutes: 30 }),
        end: DateTime.local().plus({ minutes: 60 }),
      })
  })
})
```

The docs [have been updated](../guides/digging-deeper/mailer.md#calendar-events) to cover the calendar invites API.

## Events error handler
The error handling with events so far was not that good. To capture errors that occurred during the emit lifecycle of an event, you will have to wrap your `Event.emit` calls inside a `try/catch` statement.

After this release, you can [register a custom `onError` handler](../guides/digging-deeper/events.md#error-handling) to listen for errors occurred during the emit life cycle an event.

```ts
import Event from '@ioc:Adonis/Core/Event'

Event.onError((event, error, eventData) => {
  // handle the error
})
```

## Run migrations programmatically
The latest release of `@adonisjs/lucid` allows running migrations programmatically using the `Migrator` module. For example:

```ts
import Route from '@ioc:Adonis/Core/Route'
import Migrator from '@ioc:Adonis/Lucid/Migrator'
import Database from '@ioc:Adonis/Lucid/Database'
import Application from '@ioc:Adonis/Core/Application'

Route.get('/', async () => {
  const migrator = new Migrator(Database, Application, {
    direction: 'up',
    dryRun: true,
  })

  await migrator.run()
  return migrator.migratedFiles
})
```

Read the [migration docs](../guides/database/migrations.md#running-migrations-programmatically) to learn more about the API.

## Breaking changes
We have two very minor breaking changes in this release inside the `@adonisjs/lucid` and `@adonisjs/ally` packages.

### Lucid
We have [renamed](https://github.com/adonisjs/lucid/commit/1bd457f8cfb5d88540908f04d1ea2238d9f48555) the following TypeScript ambient modules. This change will ideally not impact your applications, as these modules only contains the static types and were not commonly used.

- Changed `@ioc:Adonis/Lucid/Model` to `@ioc:Adonis/Lucid/Orm`
- Changed `@ioc:Adonis/Lucid/Relations` to `@ioc:Adonis/Lucid/Orm`
- Changed `@ioc:Adonis/Lucid/DatabaseQueryBuilder` to `@ioc:Adonis/Lucid/Database`

### Ally
As we are adding new drivers to the codebase, the possibility of not able to get a user's email address is increasing. Hence, we have to update the email property in the `AllyUserContract` type to be `null | string`.

After this change, you will have to guard against missing emails as follows.

```ts
const facebookUser = await ally.use('facebook').user()

if (!facebookUser.email) {
  // handle the use case for missing email
}
```

## Features & small improvements

- feat: add nl2br helper [42ba955af](https://github.com/edge-js/edge/commit/42ba955af6a2ac697aa6369957b40c010dd36278)
- feat: add stringify global helper [fd0cd1ae5](https://github.com/edge-js/edge/commit/fd0cd1ae5100d72b544977c89ab20ec1205b445c)
- improvement: do not report SQL errors to validator [5480de78d](https://github.com/adonisjs/lucid/commit/5480de78dae9dbe96409414b7a4d34023088205c)
- feat: add support to serializing props by giving preference to user input [ef4668fe4](https://github.com/edge-js/edge/commit/ef4668fe431cdbad701c81963ae6861899dc500e)
- feat: add withScopes method [039defb13](https://github.com/adonisjs/lucid/commit/039defb137054b861b1dc010ab9a71ec153a3dba), [65ab31ec8](https://github.com/adonisjs/lucid/commit/65ab31ec8fa290eb1cc67e7bf7aaa948d1580e1c)
- feat: add support for query isolation [b808f03b7](https://github.com/adonisjs/lucid/commit/b808f03b72b976a5621fc72343a18eaca69af91b)
- improvement: detect port for the encore dev server when default one [cb877cf6e](https://github.com/adonisjs/assembler/commit/cb877cf6ea975912b471ee4f39385aeb9493ccae).
- improvement: cleanup build directory when there is an error during the build process [e88001fac](https://github.com/adonisjs/assembler/commit/e88001fac888636e186d4f6f6d56a6d0ac0c7429)
- improvement: pass debug flag and custom reporter data to cloned queries [091dea1bb](https://github.com/adonisjs/lucid/commit/091dea1bbf8a6f4a03e20bbbf12c57d0b42161f2)
- feat: expose default naming strategy from Orm binding [b69305497](https://github.com/adonisjs/lucid/commit/b69305497492dd8a658fbfe9eec29f18e6992441)
- improvement: improve database config options [398b24a87](https://github.com/adonisjs/lucid/commit/398b24a87dd00c09406deca2012131ccc218d2a9)
- feat: add helpers shortcut to repl context [e43695bcf](https://github.com/adonisjs/core/commit/e43695bcfefe6388d02c5c2b5fbb2e3127369e60)
- feat: add support for serializing models directly from paginator [6b67cad88]( https://github.com/adonisjs/lucid/commit/6b67cad88e4e4a3fedc06b7515de0d5457e7da07)

## Bug fixes

- fix: `request.completeUrl` should include the port alongwith the hostname [068c63aa3](https://github.com/adonisjs/http-server/commit/068c63aa31b336053e4819346f0fcbddac301d04)
- fix: allow runtime variables in aliases dynamic imports [4355e448d](https://github.com/adonisjs/ioc-transformer/commit/4355e448d5562463258437ae4f3bfdf50020e94e)
- fix: do not attempt to serialize relationship values set as `null` [85e440783](https://github.com/adonisjs/lucid/commit/85e4407835e74f06cdbd00b80478ea6895cd5cb9)
- fix: apply relationship constraints during `paginate` and `first` methods [7fd7ea417](https://github.com/adonisjs/lucid/commit/7fd7ea417eb35c739a835eff67100a468b494c1f)
- fix: use correct query for health checks for oracledb [48dc522ab](https://github.com/adonisjs/lucid/commit/48dc522abc6dcb081f116b3a698dc6cc81a90266)
- fix(httpexceptionhandler): add missing await to view.render method call [34e613323](https://github.com/adonisjs/core/commit/34e613323429184f45c41346ff4004c2c4b4505e)
- fix: broken extend logic for ally manager [1a722f8e4](https://github.com/adonisjs/ally/commit/1a722f8e47180011d13ba4d0136f1fdd24fa4cf5)
- fix webpack dev server not being killed by `CTRL + C` on windows [232f1ad51](https://github.com/adonisjs/assembler/commit/232f1ad5125d65a3ad8e7a9ff5079000c5ce804f)
