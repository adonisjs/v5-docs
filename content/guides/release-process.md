AdonisJS is a collection of several first party packages built around the [core of the framework](https://github.com/adonisjs/core). Whenever, you hear us mentioning the AdonisJS version, just assume that we are talking about the version of the framework core.

Every other package like `@adonisjs/lucid`, or `@adonisjs/mail` have their own independent versions and they are free to have their own release cycle.

## Following semver
Moving forward, we will strictly follow [semantic versioning](https://semver.org/). This also means, what is Adonis 5 today, can quickly become Adonis 8 in a few months, if we introduce and publish new breaking changes.

- We will bump the patch version, when releasing **critical bug fixes** (ex: 5.2.0 to 5.2.1).
- The minor version includes **new features** or **non-critical bug fixes**. Also, we will deprecate APIs during a minor release. (ex: 5.2.0 to 5.3.0)
- When releasing breaking changes, we bump the major version (ex: 5.2.0 to 6.0.0).

## Introducing breaking changes
As AdonisJS is getting mature, we take more responsibility of not introducing breaking changes every then and now and all breaking changes **should go through a deprecation and RFC phase**.

Before introducing any breaking change, we will publish an [RFC](https://github.com/adonisjs/rfcs) discussing the motivations behind the change. If there is not a major push back, we will go ahead with the change.

The initial phase of the change will deprecate the existing APIs during a minor release. Running your application after this change will get a lot of warnings, but nothing will break and continue to work as it is.

After a cool down phase of minimum 4 weeks, during the next major release, we will remove the deprecated APIs. Removing the old/dead code is important to ensure the framework codebase is well maintained and not bloated with all the past variations.

The following changes are not subject to breaking changes.

- **Undocumented APIs and internal data structures** can get changed during any release. So, if you are relying on any undocumented APIs or private class members, then you are on own, when we change or restructure them.
- **Alpha and next versions of AdonisJS** may receive breaking changes without a major version bump. We want the creative freedom to iterate quickly based upon our learnings in the alpha period.

## Release cycle
AdonisJS follows a 8 week release cycle for shipping new features or publishing breaking changes. The critical bug fixes and security patches are usually released right away.

You can checkout our [roadmap on Trello](https://trello.com/b/3klaHbfP/adonisjs-roadmap) and [what's in the next release card](https://trello.com/c/1qTLaVPl/44-may-2021) to know about the upcoming changes.
