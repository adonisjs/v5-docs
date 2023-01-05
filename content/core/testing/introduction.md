---
summary: Introduction to testing
---

AdonisJS has out of the box support for testing, and there is no need to install any third-party packages for the same. Just run the `node ace test` and the magic will happen.

:::note
If you are running an older version that dos not have testing support, ensure to follow our [activation guide](https://docs.adonisjs.com/releases/april-2022-release#first-class-support-for-testing).
:::

Every fresh installation of AdonisJS ships with an example functional test written within the `tests/functional/hello-world.spec.ts` file. Let's open this file and learn how tests are written in AdonisJS.

:::tip
AdonisJS uses [Japa](https://japa.dev) (A homegrown testing framework) for writing and executing tests. **Therefore, we highly recommend you to read the Japa docs once**.
:::

```ts
import { test } from '@japa/runner'

test('display welcome page', async ({ client }) => {
  const response = await client.get('/')

  response.assertStatus(200)
  response.assertTextIncludes('<h1 class="title"> It Works! </h1>')
})
```

- A test is registered using the `test` function exported by the `@japa/runner` package.
- The `test` function accepts the title as the first argument and the implementation callback as the second argument.
- The implementation callback receives the [Test context](https://japa.dev/test-context). Test context contains additional properties you can use to have a better testing experience.

Let's run the test by executing the following command.

```sh
node ace test

# [ info ]  running tests...

# tests/functional/hello-world.spec.ts
#   ✔ display welcome page (24ms)

#  PASSED 

# total        : 1
# passed       : 1
# duration     : 28ms
```

Now let's re-run the test command, but this time with the `--watch` flag. The watcher will watch for file system changes and executes the tests after every file change.

```sh
node ace test --watch
```

::video{url="https://res.cloudinary.com/adonis-js/video/upload/q_auto/v1648365429/v5/node-ace-test-watch-edited_wmfkeo.mp4" controls}

## Test suites
AdonisJS organizes tests into multiple suites. Tests for every suite live within its sub-directory. For example:

- Functional tests are stored inside `tests/functional/` directory.
- Unit tests are stored inside the `tests/unit/` directory.

Suites are registered inside the `.adonisrc.json` file, and you can remove/add suites as per requirements. A suite combines a unique name and a glob pattern for the files.

:::note
You can also use the `make:suite` command to create a new test suite and register it inside the `.adonisrc.json` file.
:::

```json
// title: .adonisrc.json
{
  "tests": {
    "suites": [
      {
        "name": "functional",
        "files": "tests/functional/**/*.spec(.ts|.js)"
      }
    ]
  }
}
```

You can also register lifecycle hooks for every test suite. The hooks are registered within the `tests/bootstrap.ts` file using the `configureSuite` method.

In the following example, AdonisJS registers a setup hook to start the HTTP server for the `functional` test suite.

```ts
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (suite.name === 'functional') {
    suite.setup(() => TestUtils.httpServer().start())
  }
}
```

## Configuring the tests runner
AdonisJS configures the test runner within the `test.ts` file inside the root of your project. This file first boots the AdonisJS application and then runs tests using Japa.

You will never touch the `test.ts` file for the most part. Instead, we recommend you to use the `tests/bootstrap.ts` file to configure the tests runner further or run custom logic before/after the tests.

The bootstrap file exports the following properties, which are then given to Japa.

```ts
// title: tests/bootstrap.ts
export const plugins: Config['plugins'] = []
export const reporters: Config['reporters'] = []
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [],
  teardown: [],
}
export const configureSuite: Config['configureSuite'] = (suite) => {
}
```

#### plugins
The `plugins` property accepts an array of Japa plugins. By default, we register the following plugins.

- [`assert`](https://japa.dev/plugins/assert) - Assert module to make assertions.
- [`runFailedTests`](https://japa.dev/plugins/run-failed-tests) - A plugin to run only failed tests (if any).
- [`apiClient`](https://japa.dev/plugins/api-client) - An API client for testing HTTP endpoints.

---

#### reporters
The `reporters` property accepts an array of Japa reporters. We register the [`spec-reporter`](https://japa.dev/plugins/spec-reporter) to display the progress of tests on the terminal.

---

#### runnerHooks
You can use the `runnerHooks` property to run actions before or after the tests (across all the suites).

- The `setup` hooks are executed before all the tests.
- The `teardown` hooks are executed after all the tests.

---

#### configureSuite
The `configureSuite` method is executed with an instance of the [Japa suite](https://japa.dev/core/suite) class. You can use the suite instance to configure it.

## Environment variables
During tests, AdonisJS automatically sets the value of `NODE_ENV` to `test`.

We also load the `.env.test` file and merge the values defined inside this file with existing environment variables. The following overrides are defined by default.

```dotenv
NODE_ENV=test
ASSETS_DRIVER=fake
SESSION_DRIVER=memory
```

- `ASSETS_DRIVER` property switches the driver for serving [bundled assets](../http/assets-manager.md) to a fake implementation. Doing so allows you to run tests without compiling the frontend assets using Webpack.
- `SESSION_DRIVER` is switched to persist session data within memory and access it during tests. Using any other driver will break the tests.

## Creating tests
You can create tests using the `node ace make:test` command. The command accepts the suite name as the first argument, followed by the test file name.

```sh
node ace make:test functional list_users

# CREATE: tests/functional/list_users.spec.ts
```

You can also create a nested file structure as follows.

```sh
node ace make:test functional users/list

# CREATE: tests/functional/users/list.spec.ts
```

## Running tests
You can run tests by executing the `node ace test` command. Also, you can run tests for a specific suite by passing the suite name.

```sh
# Runs all tests
node ace test

# Only functional tests are executed
node ace test functional

# unit and functional tests are executed sequentially
node ace test unit functional

# Only tests with an "orders" or "upload" tag in the "unit" and "functional" suites
node ace test --tags="orders,upload" unit functional
```

The `test` command accepts the following flags.

- `--watch`: Run tests in the watch mode. The watcher will run only tests from the modified file if a test file is changed. Otherwise, all tests are executed.
- `--tags`: Run tests that have one or more of the mentioned tags.
- `--ignore-tags`: The inverse of the `--tags` flag. Only run tests that do not have all of the mentioned tags.
- `--files`: Cherry pick and run tests from mentioned files.
- `--timeout`: Define the global timeout for all the tests.
- `--force-exit`: Force exit the test process if it does not ends gracefully.
- `--tests`: Run specific tests by title.

## Database management
This section covers database migrations, running seeders, and using global transactions to have a clean database state between tests.

:::note
Make sure you have `@adonisjs/lucid` installed for the following examples to work.
:::

### Migrating database

#### Reset database after each run cycle

You can migrate the database before running all the tests and roll it back after the tests. This can be done by registering the `TestUtils.db().migrate()` hook within the `tests/bootstrap.ts` file.

```ts
// title: tests/bootstrap.ts
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [
    () => TestUtils.ace().loadCommands(),
    // highlight-start
    () => TestUtils.db().migrate()
    // highlight-end
  ],
  teardown: [],
}
```

#### Truncate database after each run cycle

An alternative to the above approach is to truncate all tables in the database after each run cycle instead of rolling it back. This can be done by registering the `TestUtils.db().truncate()` hook within the `tests/bootstrap.ts` file.

```ts
// title: tests/bootstrap.ts
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [
    () => TestUtils.ace().loadCommands(),
    // highlight-start
    () => TestUtils.db().truncate()
    // highlight-end
  ],
  teardown: [],
}
```

Before running your tests, the hook will migrate the database if necessary. After the tests are run, all the tables in your database will be kept but truncated. 

So next time you run your tests, your database will be empty but will not need to be migrated again. This may be a better approach and will save you some time if you have a lot of migrations.

:::tip
Note that the hook internally calls the `node ace db:truncate` command that you can also run manually. Also, note that this command will truncate all tables **except** `adonis_schema` and `adonis_schema_versions` tables.
:::


### Seeding database
You can also run database seeders by calling the `TestUtils.db().seed()` method.

```ts
setup: [
  () => TestUtils.ace().loadCommands(),
  () => TestUtils.db().migrate()
  // highlight-start
  () => TestUtils.db().seed()
  // highlight-end
],
```

### Global transactions

We recommend you to use the [Database global transactions](../../reference/database/database.md#beginglobaltransaction) to have a clean database state in-between tests.

In the following example, we start a global transaction before all the tests and roll back it after the tests.

:::tip
The `group.each.setup` method runs before every test inside the group.
:::

```ts
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Group name', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })
})
```

If you are using multiple database connections, then you can define a hook for each connection. For example:

```ts
group.each.setup(async () => {
  await Database.beginGlobalTransaction('pg')
  return () => Database.rollbackGlobalTransaction('pg')
})

group.each.setup(async () => {
  await Database.beginGlobalTransaction('mysql')
  return () => Database.rollbackGlobalTransaction('mysql')
})
```
