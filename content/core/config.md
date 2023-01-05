The configuration files of your AdonisJS application are stored inside the `config` directory. A brand new AdonisJS application comes with a handful of existing configuration files used by the framework core and other installed packages.

We also recommend storing all the custom configs required by your application inside this directory.


:::note


We recommend you to use [environment variables](./env.md) for storing secrets and environment specific configuration.

Also, make sure to read the [AdonisRCFile](./adonisrc-file.md) guide to configure the workspace settings of your AdonisJS application.

:::

## Importing config files

You can import the configuration files within your application codebase using the standard JavaScript `import` statement. For example:

```ts
import { appKey } from '#config/app'
```

```ts
import databaseConfig from '#config/database'
```

## Using the config service

The config service offers an alternate API for reading the configuration values. In the following example, we use the config service to read the `appKey` value stored within the `config/app.ts` file.

```ts
import config from '@adonisjs/core/services/config'

config.get('app.appKey')
```

There are no direct benefits of using the config service over manually importing the config files. However, the config service is the only choice in the following scenarios.

- **External packages**: External packages should never rely on the file path to read/import the config. Instead, it should make use of the `config` service. Using the config service creates a loose coupling between the application and the package.
- **Edge templates**: The template files relies on the [config](../../reference/views/globals/all-helpers.md#config) global to reference configuration values. The `config` global under the hood uses the config service.

## Changing the config location

You can update the location for the config directory by modifying the `.adonisrc.json` file. After the change, the scaffolding commands will create files in the newly configured directory.

```json
"directories": {
  "config": "./configurations"
}
```

Also make sure to update the import alias within the `package.json` file.

```json
{
  "imports": {
    "#config/*": "./configurations/*.js"
  }
}
```

## Caveats

The config files stored within the `config` directory are automatically imported during the boot phase of the application. As a result, the config files cannot rely on the application code because the app still needs to be ready.

In the following example, a configuration file attempts to use the `router` service even before the app is ready, and therefore it will result in an error.

```ts
import router from '@adonisjs/core/services/router'

const someConfig = {
  assetsUrl: router.makeUrl('/assets')
}
```

Fundamentally, this limitation positively impacts your codebase because the application code should rely on the config and not the other way around.

You can rewrite the same config file by moving the `router.makeUrl` call behind a function.

```ts
import router from '@adonisjs/core/services/router'

const someConfig = {
  getAssetsUrl: () => router.makeUrl('/assets')
}
```

## Updating config at runtime

You can mutate the config values at runtime using the config service. The `config.set` updates the value within the memory, and no changes are made to the actual files on the disk.

```ts
import env from '@adonisjs/core/services/env'
import config from '@adonisjs/core/services/config'

const HOST = env.get('HOST')
const PORT = env.get('PORT')

config.set('app.appUrl', `https://${HOST}:${PORT}`)
```

## Config reference

As you install and configure AdonisJS packages, they may create new config files. Following is a list of config files (with their default templates) used by the framework's core and the official packages.

| Config file | Stub | Used by |
|------------|------|----------|
| `app.ts` | https://git.io/JfefZ | Used by the framework's core, including the HTTP server, logger, validator, and assets manager. |
| `bodyparser.ts` | https://git.io/Jfefn | Used by the bodyparser middleware |
| `cors.ts` | https://git.io/JfefC | Used by the CORS server hook |
| `hash.ts` | https://git.io/JfefW | Used by the hash package |
| `session.ts` | https://git.io/JeYHp | Used by the session package |
| `shield.ts` | https://git.io/Jvwvt | Used by the shield package
| `static.ts` | https://git.io/Jfefl | Used by the static file server |
| `auth.ts` | https://git.io/JY0mp | Used by the auth package |
| `database.ts` | https://git.io/JesV9 | Used by Lucid ORM |
| `mail.ts` | https://git.io/JvgAf | Used by the AdonisJS mail package |
| `redis.ts` | https://git.io/JemcF | Used by the Redis package |
| `drive.ts` | https://git.io/JBt3o | Used by the Drive provider |
| `ally.ts` | https://git.io/JOdi5 | Used by the Social authentication package (Ally) |

### The `appKey`

The `appKey` stored inside the `config/app.ts` file is used to encrypt data by the [encryption module](). Apart of the direct usage of the encryption module, it is also used by cookies and signed URLs.

To summarise, changing the `appKey` will result in invalidating all the cookies (including session) and existing signed URLs.

By default, the `appKey` is populated by the `APP_SECRET` environment variable and we recommend keeping this secret secure.
