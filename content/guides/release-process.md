AdonisJS is a collection of several first-party packages built around the [core of the framework](https://github.com/adonisjs/core). Whenever you hear us mentioning the AdonisJS version, assume that we are talking about the version of the framework core.

Every other package like `@adonisjs/lucid`, or `@adonisjs/mail` have their independent versions and are free to have their release cycle.

## Following semver
We strictly follow [semantic versioning](https://semver.org/) and bump the major version after every breaking change. This means, what is AdonisJS 5 today can quickly become AdonisJS 8 in few months.

- We will bump the patch version when releasing **critical bug fixes** (ex: 5.2.0 to 5.2.1).
- The minor version includes **new features** or **non-critical bug fixes**. Also, we will deprecate APIs during a minor release. (ex: 5.2.0 to 5.3.0)
- When releasing breaking changes, we bump the major version (ex: 5.2.0 to 6.0.0).

## Introducing breaking changes
As AdonisJS is getting mature, we take more responsibility for not introducing breaking changes every then and now, and all breaking changes **should go through a deprecation and RFC phase**.

Before introducing any breaking change, we will publish an [RFC](https://github.com/adonisjs/rfcs) discussing the motivations behind the change. If there is not a significant pushback, we will go ahead with the change.

The initial phase of the change will deprecate the existing APIs during a minor release. Running your application after this change will get many warnings, but nothing will break and continue to work as it is.

After a cool-down phase of a minimum of 4 weeks, we will remove the deprecated APIs during the next major release. Removing the old/dead code is essential to ensure the framework codebase is well maintained and not bloated with past variations.

The following changes are not subject to breaking changes.

- **Undocumented APIs and internal data structures** can get changed during any release. So, if you are relying on undocumented APIs or private class members, you are on your own when we change or restructure them.
- **Alpha and next versions of AdonisJS** may receive breaking changes without a major version bump. This is because we want the creative freedom to iterate quickly based upon our learnings in the alpha period.

## Release cycle
AdonisJS roughly follows an 8-week release cycle for shipping new features or publishing breaking changes. However, critical bug fixes and security patches are usually released right away.

You can check out our [roadmap on Trello](https://trello.com/b/3klaHbfP/adonisjs-roadmap) and [what's in the next release card](https://trello.com/c/y8PCAodY/47-september-planning-2021) to know about the upcoming changes.
