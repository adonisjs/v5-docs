---
summary: Reference to partials in edge
---

You can render views by calling the `View.render` method. The method accepts the template path relative to the `views` directory and the data object to pass to the template and always returns a string value.

```ts
import View from '@ioc:Adonis/Core/View'

const html = await View.render('welcome', {
  greeting: 'Hello'
})
```

During the HTTP requests, it is recommended to use the `ctx.view` object instead of the top-level import.

The `ctx.view` is an isolated instance of the View module created for that specific request and shares the request-specific data with the templates.

```ts
Route.get('/', async ({ view }) => {
  const html = await view.render('welcome', {
    greeting: 'Hello'
  })
  
  return html
})
```

## Rendering modes

Edge exposes both the sync and the async API for rendering views. We **recommend using the async API**. In async mode, the I/O operations performed by Edge do not block the Node.js event loop.

In the following example:

- The `user.edge` file is read synchronously from the disk.
- Any internal references to load partials or components will be synchronous too.
- The template cannot use the `await` keyword. For example: `{{ await getUser() }}` will NOT work.

```ts
view.renderSync('user', {
  getUser: async () => {},
})
```

Whereas the `view.render` method is free from all the caveats of synchronous rendering.

```ts
await view.render('user', {
  getUser: async () => {},
})
```

## Disks

Edge allows you to specify **multiple root directories** for finding the templates. We call this concept a mounting disk.

We mount the `./resources/views` directory as the default disk for you implicitly. However, if required, you can also mount additional directories, each with a unique name.

You can write the following code inside a [preload file](link-to-preloading-files).

```ts
// title: start/views.ts

import View from '@ioc:Adonis/Core/View'
import Application from '@ioc:Adonis/Core/Application'

View.mount('material', Application.resourcesPath('themes/material'))
View.mount('elegant', Application.resourcesPath('themes/elegant'))
```

You can render the views from the named disks by prefixing the disk name.

```ts
// renders themes/material/user.edge
view.render('material::user')

// renders themes/elegant/user.edge
view.render('elegant::user')
```

Similarly, you can prefix the disk name when including partials or components.

```edge
@include('material::header')

@component('material::button')
@end
```

## In-memory templates

Edge allows you to register in-memory templates without creating any file on the disk. You may find it helpful when you want to provide some templates as part of an npm package.

```ts
import View from '@ioc:Adonis/Core/View'

View.registerTemplate('uikit/button', {
  template: `
    <button {{ $props.serializeExcept(['title']) }}>
      {{ title }}
    </button>
  `,
})
```

You can render the template directly or use it as a component with the exact name given to the `View.registerTemplate` method.

```edge
@!component('uikit/button', {
  title: 'Signup',
  class: ['btn', 'btn-primary'],
  id: 'signup'
})
```

:::note

The in-memory templates are given preference over the on-disk templates in case of a path conflict.

:::

## Rendering raw string

Edge also exposes the API to render raw string values directly as a template. However do note, that raw strings do not enjoy the benefits of template caching as there are not associated with a unique path.

```ts
await View.renderRaw(
  `
  <p> Hello {{ username }} </p>
`,
  {
    username: 'virk',
  }
)
```

Use the `renderRawSync` method to render the raw string synchronously.

```ts
View.renderRawSync(
  `
  <p> Hello {{ username }} </p>
`,
  {
    username: 'virk',
  }
)
```

## View renderer instances

Views in Edge are rendered using the [ViewRenderer](https://github.com/edge-js/edge/blob/develop/src/Renderer/index.ts) class. So every time you run the `View.render` method, we create a new instance of the `ViewRenderer` and then call the `render` method on it.

You can also get the renderer instance by calling the `View.getRenderer()` method and use the `share` method to share data with the view.

```ts
import View from '@ioc:Adonis/Core/View'
const view = View.getRenderer()

view.share({ url: '/', user: auth.user })
await view.render('home')
```

The `ctx.view` object is an instance of the `ViewRenderer` class.

## Caching

Compiling a template to a JavaScript function is a time-consuming process, and hence it is recommended to cache the compiled templates in production.

You can control the template caching using the `CACHE_VIEWS` environment variable. Just make sure to set the value to `true` in the production environment.

```sh
CACHE_VIEWS=true
```

All of the templates are cached within the memory. Currently, we do not have any plans to support on-disk caching since the value provided for the efforts is too low.

The raw text does not take up too much space, and even keeping thousands of pre-compiled templates in memory should not be a problem.
