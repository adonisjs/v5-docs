---
summary: The config module to manage and provide application config to the installed packages.
---

The runtime configuration of your AdonisJS application is stored inside the `config` directory. The framework core and many of the installed packages rely on these configuration files. So make sure to go through the configuration files and tweak any settings (if necessary).

We also recommend storing all the custom configs required by your app inside this directory versus storing them in multiple places.

## Import config files
You can import the configuration files within your application codebase using the `import` statement. For example:

```ts
import { appKey } from 'Config/app'
```

## Using the config provider
Instead of directly importing the config files, you can also make use of the `Config` provider as follows:

```ts
import Config from '@ioc:Adonis/Core/Config'

Config.get('app.appKey')
```

The `Config.get` method accepts a dot-separated path to the configuration key. In the above example, we read the `appKey` property from the `config/app.ts` file.

Also, you can define a fallback value. The fallback value is returned when the actual configuration value is missing.

```ts
Config.get('database.connections.mysql.host', '127.0.0.1')
```

There are no direct benefits of using the Config provider over manually importing the config files. However, the Config provider is the only choice in the following scenarios.

- **External packages**: External packages should never rely on the file path to read/import the config. Instead, it should make use of the `Config` provider. Using the Config provider creates a loose coupling between the application and the package.
- **Edge templates**: The template files can use the [config](../../reference/views/globals/all-helpers.md#config) global method to reference the configuration values.

## Changing the config location

You can update the location for the config directory by modifying the `.adonisrc.json` file.

```json
"directories": {
  "config": "./configurations"
}
```

The config provider will automatically read the file from the newly configured directory, and all the underlying packages relying on the config files will work fine.

## Caveats

All the config files inside the `config` directory are imported automatically by the framework during the boot phase. As a result of this, your config files should not rely on the container bindings.

For example, the following code will break as it tries to import the `Route` provider even before it is registered to the container.

```ts
// ❌ Does not work
import Route from '@ioc:Adonis/Core/Route'

const someConfig = {
  assetsUrl: Route.makeUrl('/assets')
}
```

You might consider this limitation bad. However, it has a positive impact on the application design.

Fundamentally, your runtime code should rely on the config and NOT the other way around. For example:

:::caption{for="error"}
Do not derive config from the runtime code (Model in this case)
:::
```ts
import User from 'App/Models/User'

const someConfig = {
  databaseTable: User.table
}
```

:::caption{for="success"}
Instead, make your model read the table from the config file
:::

```ts
const someConfig = {
  databaseTable: 'users'
}
```

```ts
import someConfig from 'Config/file/path'

class User extends Model {
  public static table = someConfig.databaseTable
}
```

## Config reference

As you install and configure AdonisJS packages, they may create new config files. Following is a list of config files (with their default templates) used by the different parts of the framework.

| Config file | Stub | Used by |
|------------|------|----------|
| `app.ts` | https://git.io/JfefZ | Used by the framework's core, including the HTTP server, logger, validator, and the assets manager. |
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
