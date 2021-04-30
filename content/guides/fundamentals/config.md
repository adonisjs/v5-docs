The runtime configuration of your AdonisJS application is stored inside the `config` directory. The framework core and many of the installed packages rely on these configuration files. Make sure to go through the configuration files and tweak any settings (if necessary).

We also recommend storing all the custom config required by your app inside this directory versus storing them in multiple places.

## Access config inside application
You can import the configuration files within your application codebase using the `import` statement. For example:

```ts
import { appKey } from 'Config/app'
```

Since, we have registered the `config` directory as an [alias](./adonisrc-file.md#aliases) inside the `.adonisrc.json` and the `tsconfig.json` files, you can import files without the relative paths as well.

## Access config inside a package

A package should never rely on the path of the config file directly and instead make use of the `Config` provider.

Relying on the Config provider inside a package creates a loose coupling with the application codebase, and, your package will not break if the end-user decides to store the config files in a separate directory altogether.

### Using the config provider

Assuming your package relies on the `config/dummy.ts` file. You can access its value using the Config provider as follows.

```ts
export default class DummyPackageProvider {
  constructor(protected app: ApplicationContract) {}

  public register () {
    this.app.container.bind('Dummy/Package', () => {
      // highlight-start
      const Config = this.app
        .container
        .resolveBinding('Adonis/Core/Config')

      console.log(Config.get('dummy'))
      // highlight-end
    })
  }
}
```

The `Config.get` method returns the exported values from the given filename. You can read nested values using the dot notation.

```ts
Config.get('app.appKey')
Config.get('database.connection')
```

Within your application codebase, you can access the Config provider as follows.

```ts
import Config from '@ioc:Adonis/Core/Config'
Config.get('app.appKey')
```

## Changing config location

You can update the location for the config directory by modifying the `.adonisrc.json` file.

```json
"directories": {
  "config": "./configurations"
}
```

The config provider will automatically read the file from the newly configured directory, and all the underlying packages relying on the config files will work fine.

## Caveats

The config provider reads all the configuration files inside the `config` directory during the application boot, and hence you cannot have IoC container-specific imports inside your config files.

If any part of your config relies on the IoC container imports, then you must lazy load them just like the [Auth package does](https://github.com/adonisjs/auth/blob/develop/templates/config/partials/user-provider-lucid.txt#L45).

However, there is an exception to this rule for the `Application` and the `Env` providers. They are configured before reading the config files in the [boot lifecycle](./application.md#boot-lifecycle) of the application.

## Config Reference

As you install and configure AdonisJS packages, they may create new config files. Following is a list of config files (with their default templates) used by the different parts of the framework.

| Config file | Stub | Used by |
|------------|------|----------|
| `app.ts` | https://git.io/JfefZ | Used by the core of the framework, including the HTTP server, logger, validator, and the assets manager. |
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
