---
summary: Introduction to the AdonisJS template engine - "Edge".
---

The Views layer of AdonisJS is powered by a homegrown template engine called [Edge](https://github.com/edge-js/edge). Edge is a logical and batteries included template engine for Node.js. It can render any text-based format, whether is **HTML**, **Markdown** or **plain text** files.

We created Edge as an alternative to other existing template engines and address the pain points with them.

:::tip
Do you prefer to use a frontend framework like React, Vue or Svelte? You can use them with [InertiaJS](https://inertiajs.com/).

Checkout the Adocasts series on [AdonisJS + InertiaJS](https://adocasts.com/series/adonisjs-inertiajs).
:::

## Edge vs. Pug

Unlike Pug, we don't re-invent the way you write the HTML. Edge is not even tied to HTML in the first place, and it can render any text-based files.

<div class="fancy-codeblock">

```pug
h1= title
p Written with love by #{author}
p This will be safe: #{theGreat}
```

<span class="title"> Pug </span>

</div>

<div class="fancy-codeblock">

```edge
<h1> {{ title }} </h1>
<p> Written with love by {{ author }} </p>
<p> This will be safe: {{ theGreat }} </p>
```

<span class="title"> Edge </span>

</div>

## Edge vs. Nunjucks

Unlike Nunjucks, Edge feels like writing JavaScript and not Python. As a result, the Edge has a small learning curve, is quicker to type, and supports all JavaScript expressions.

<div class="fancy-codeblock">

```nunjucks
{% if happy and hungry %}
  I am happy *and* hungry; both are true.
{% endif %}

{{ "true" if foo else "false" }}
```

<span class="title"> Nunjucks </span>

</div>

<div class="fancy-codeblock">

```edge
@if(happy && hungry)
  I am happy *and* hungry; both are true.
@endif

{{ foo ? "true" : "false" }}
```

<span class="title"> Edge </span>

</div>

## Edge vs. Handlebars

Unlike Handlebars, Edge is not restrictive. For example, you can use any JavaScript expression inside your templates, and we parse them using a spec-compliant JavaScript parser.

Whereas in Handlebars, you have to define custom helpers for every little thing. The story gets even worse when using multiple helpers together.

```js
Handlebars.registerHelper('upperCase', function (aString) {
  return aString.toUpperCase()
})
```

<div class="fancy-codeblock">

```hbs
{{upperCase lastname}}
```

<span class="title"> Handlebars </span>

</div>

In comparison to Handlebars, Edge doubles down on native JavaScript capabilities.

<div class="fancy-codeblock">

```edge
{{ lastname.toUpperCase() }}
```

<span class="title"> Edge </span>

</div>

## Setup

Edge comes pre-configured with the `web` starter template. However, installing and configuring it is also relatively straightforward.

Open the `.adonisrc.json` file and check if `@adonisjs/view` is mentioned inside the `providers` array list. **IF NOT, then continue with the following steps:**

```sh
npm i @adonisjs/view
```

Run the following `ace` command to configure the package.

```sh
node ace configure @adonisjs/view

# UPDATE: .env { "CACHE_VIEWS = false" }
# UPDATE: .adonisrc.json { providers += "@adonisjs/view" }
# UPDATE: .adonisrc.json { metaFiles += "resources/views/**/*.edge" }
```

## Basic example

Let's begin by creating a route that renders a given template file.

```ts
// title: start/routes.ts
Route.get('/', async ({ view }) => {
  return view.render('home')
})
```

The next step is to create the `home.edge` template. You can manually create a file inside the views folder or use the following Ace command to create one.

```sh
node ace make:view home

# CREATE: resources/views/home.edge
```

Let's open the newly created file and paste the following code snippet inside it.

```edge
// title: resources/views/home.edge
<p> Hello world. You are viewing the {{ request.url() }} page </p>
```

Make sure to start the development server by running `node ace serve --watch` and visit http://localhost:3333 to view the contents of the template file.

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1617093908/v5/view-usage.png)

## Views directory

AdonisJS registers the `resources/views` as the default directory for finding the Edge templates. However, you can register a custom path by modifying the `.adonisrc.json` file.

After the following change, Edge will find templates inside the `./app/views` directory.

:::note

Read the [rendering](./rendering.md#disks) guide to learn more about registering multiple directories.

:::

```json
{
  "directories": {
    "views": "./app/views"
  }
}
```

Also, make sure to update the `metaFiles` array in the same file to tell `@adonisjs/assembler` to copy the templates when creating the production build.

```json
{
  "metaFiles": [
    {
      // delete-start
      "pattern": "resources/views/**/*.edge",
      // delete-end
      // insert-start
      "pattern": "app/views/**/*.edge",
      // insert-end
      "reloadServer": false
    }
  ],  
}
```

## Editor extensions

The syntax highlighting extensions are available for the following editors.

- [VsCode](https://marketplace.visualstudio.com/items?itemName=luongnd.edge)
- [Sublime Text](https://github.com/edge-js/edge-sublime)
- [Atom](https://github.com/edge-js/edge-atom-syntax)
- [Vim](https://github.com/watzon/vim-edge-template)
