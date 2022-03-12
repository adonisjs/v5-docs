This release ships with long-awaited Lucid commands, improvements to the Ace CLI to allow running commands programmatically, and bug fixes.

You must update all the packages under `@adonisjs` scope to their latest version. For this, either you can run the `npm update` command or use the following command to upgrade packages manually.

```sh
npx npm-check-updates -i
```

## New Lucid commands
[Julien Ripouteau](https://twitter.com/julien_rpt) has [contributed](https://github.com/adonisjs/lucid/commit/441d9b50a0b4ca8b17daf2005cf45fd3f427dce5) the long-awaited migration commands. Following are the new commands.

- `migration:reset`: Rollback migrations all the way. This command is similar to `migration:rollback --batch=0`.
- `migration:refresh`: Same as calling `migration:reset` and `migration:run` together. Optionally, you can also seed the database.
- `db:wipe`: This command deletes all the tables in the database. Optionally, you can also drop views and custom PostgreSQL types. Do note this command does not roll back any migrations. Instead, it just wipes the entire database.
- `migration:fresh`: Same as calling `db:wipe` and `migration:run` together. Optionally, you can also seed the database.

## Ace CLI improvements
When working on the new Lucid commands, we realized that we wanted to execute many commands programmatically, leading to the following improvements in the Ace CLI.

- Within the Ace command, you can access two new properties, `isMain` and `isInteractive`. You can use these properties to change the output behavior of the command. 
  - For example: In the `migration:run` command we [close the database connection](https://github.com/adonisjs/lucid/blob/develop/commands/Migration/Run.ts#L122-L124) only when `isMain` is set to true.
  - Similarly, the `isInteractive` can be used to [show prompts](https://github.com/adonisjs/lucid/blob/develop/commands/Migration/Base.ts#L37-L39) only when the command line is interactive. The value is false when commands are running in a CI/CD pipeline.
- Now, we [load the ace providers all the time](https://github.com/adonisjs/application/commit/f22cb420b6ff1fc98dc953eba57616da1d041322). Earlier, we only loaded the ace providers in the `console` environment. The change is required to make ace commands available during testing as well.
- Add [mockConsoleOutput](https://github.com/adonisjs/ace/commit/51fc37a957a01437a639d7861d2048a2f590fa15) method to the Ace kernel. It is added to test the ace commands easily by collecting all the log messages within memory.

## Breaking changes
Lucid has been updated to use the latest version of [knex](https://knexjs.org/#changelog) (i.e. `1.x.x`). The major release of knex contains the following breaking changes.

- Replaced unsupported `sqlite3` driver with `@vscode/sqlite3`.
- Changed data structure from `RETURNING` operation to be consistent with `SELECT`. The `returning` method now returns an array of objects vs. an array of literal values when only one column is selected.

## Other improvements and bug fixes

-  Add support for `tests` object in the `.adonisrc.json` file. [7e1f22aa1](https://github.com/adonisjs/application/commit/7e1f22aa1e0d5732507de9f82dbdca844eb68996)
- Fix drive local drivers to handle special chars [108579cad](https://github.com/adonisjs/drive/commit/108579cad5ccf26c26ad962f2d315494c11c0c62).
- Allow `forceContentNegotiation` to be a function [73f4c6fb3](https://github.com/adonisjs/http-server/commit/73f4c6fb3bf5d55b97d8b1d4ec14387f6330eaec).
- Fix route uuid method validation to follow RFC spec [310f926d5](https://github.com/adonisjs/http-server/commit/310f926d5765bccd6613d440c9ca73da8cbbf462).
- Add support for defining lua commands [2ddc05456](https://github.com/adonisjs/redis/commit/2ddc054562a4abf3295ad522d6536b499d806285).
- Add bitfield to redis [cdb287439](https://github.com/adonisjs/redis/commit/cdb287439ad6767c700e3c944e284bb4b4215655).
- Gracefully close application when ace exits [c5eea6f0d](https://github.com/adonisjs/core/commit/c5eea6f0dab3c978c424c6f093d11d25cbe447bc).
- Add missing `Cache-Control` property to drive-s3 payload. [1974f933f](https://github.com/adonisjs/drive-s3/commit/1974f933fa8aa5477b61b86848dd5b0e00fe3ee2).
- Add support for multipart file uploads [44db02fee](https://github.com/adonisjs/drive-s3/commit/44db02feee6514eeb8d94699640d24c425dbb718).
- Add missing `expiresIn` property to drive-s3 payload. [8be08ae12](https://github.com/adonisjs/drive-s3/commit/8be08ae12d6420e71fa364370f44b5a80df1d1b1).
- Add `sumDistinct` in QueryBuilder [3026bb163](https://github.com/adonisjs/lucid/commit/3026bb163bccd0f327b54ca526f3832778282bcf).
- Allow where and having column names to be a raw query [781add754](https://github.com/adonisjs/lucid/commit/781add75429244688214bf0fcc5df1276daa3187).
- Repl helper to load factories [7e88ad6a8](https://github.com/adonisjs/lucid/commit/7e88ad6a83a925fd4fe0bb39287026dd33c4f9f7).
- Add `getAllViews`, `getAllTypes`, `dropAllTypes`, `dropAllTypes`, [f7aa5b97b](https://github.com/adonisjs/lucid/commit/f7aa5b97b707ec63bdc47182169d0f06686e5cd9).
- Use `@faker-js/faker` as a drop-in replacement for `faker` [759f2e460](https://github.com/adonisjs/lucid/commit/759f2e460cfeb15db0b7b53c41ee9abdcd8bee35).
