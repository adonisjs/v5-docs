AdonisJS heavily relies on the [IoC container](./ioc-container.md) for resolving and distributing dependencies. Instead of self constructing every single class within your project, you can rely on the container to return pre-configured objects.

In the following example, we ask the container to resolve and return an instance of the Drive and the Limiter classes. These classes are pre-configured using the config defined inside the `config` directory.

```ts
import app from '@adonisjs/core/services/app'

// Give me a pre-configured instance of Drive
const drive = await app.container.make('drive')

// Give me a pre-configured instance of Limiter
const limiter = await app.container.make('limiter')
```

Using container to resolve bindings is great, as it helps us remove all the boilerplate code required to construct a class.

However, the usage of `container.make` method comes with a downside in terms of visual clutter and developer experience.

- Editors are really good with auto imports. If you attempt to use a variable and the editor is able to guess the import path of the variable, then it will write the import statement for you. **However, this cannot work with `container.make` calls.**
- Using a mix of import statements and `container.make` calls feels unintuitive in comparison to having a unified syntax for importing/using modules.

To overcome these downsides, we wrap `container.make` calls inside regular JavaScript module, so that you can use fetch them using the `import` statement.

For example, the `@adonisjs/limiter` package has a file called `services/main.ts` and this file has roughly the following contents.

```ts
const limiter = await app.container.make('limiter')
export { limiter as default }
```

Now, within your application you can replace the `container.make` call with an import pointing to the `services/main.ts` file.

```ts
import limiter from '@adonisjs/limiter/services/main'
```

As you can see, we are still relying to the container to resolve an instance of `limiter` for us. However, with a layer of indirection, we are able to replace `container.make` call with a regular `import` statement.

**The module wrapping the `container.make` calls is known as a Container service.** Almost every package that interacts with the container ships with one or more container services.

## Container services vs Dependency injection



## Container bindings and services

The following table outlines a list of container bindings and their corresponding services.

