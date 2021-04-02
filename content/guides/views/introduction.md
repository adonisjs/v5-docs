The Views layer of AdonisJS is powered by a home grown template engine called [Edge](https://github.com/edge-js/edge). Edge is a logical and batteries included template engine for Node.js. It can render any text based format, whether is **HTML**, **Markdown** or **plain text** files.

We created Edge as an alternative to other existing template engines and address the pain points we had with them.

## Edge vs Pug

Unlike Pug, we don't re-invent the way you write the HTML. In fact, Edge is not even tied to HTML at first place, as it can render any text based files.

```pug
h1= title
p Written with love by #{author}
p This will be safe: #{theGreat}
```


```edge
<h1> {{ title }} </h1>
<p> Written with love by {{ author }} </p>
<p> This will be safe: {{ theGreat }} </p>
```

## Edge vs Nunjucks

Unlike Nunjucks, Edge feels like writing Javascript. It is quicker to type and has a small learning curve.

```nunjucks
{% if happy and hungry %}
  I am happy *and* hungry; both are true.
{% endif %}

{{ "true" if foo else "false" }}
```

```edge
@if(happy && hungry)
  I am happy *and* hungry; both are true.
@endif

{{ foo ? "true" : "false" }}
```

## Edge vs Handlebars

Unlike Handlebars, Edge is not restrictive in nature. You can use any Javascript expression inside your templates and we parse them using a spec compliant JavaScript parser.

Handlebars expects you to register a helper for every small functionality. The story gets even worse if you have to apply multiple helpers at the same time.

```js
Handlebars.registerHelper('upperCase', function (aString) {
  return aString.toUpperCase()
})
```

```hbs
{{upperCase lastname}}
```

Whereas, Edge leverages the existing Javascript expressions.

```edge
{{ lastname.toUpperCase() }}
```

## Setup

Edge comes pre-configured with the `web` starter template. However, installing and configuring it is also relatively straightforward.

Open the `.adonisrc.json` file and check if `@adonisjs/view` is mentioned inside the list of `providers` array. **IF NOT, then continue with the following steps:**

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

## Views directory

AdonisJS registers the `resources/views` as the default directory for finding the Edge templates. However, you can register a custom path by modifying the `.adonisrc.json` file.

After the following change, Edge will find templates inside the `./app/views` directory.

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

## Basic example

Let's begin by creating a route that renders a given template file.

```ts
// title: start/routes.ts
Route.get('/', async ({ view }) => {
  return view.renderAsync('home')
})
```

Next step is to create the `home.edge` template. You can manually create a file inside the views folder, or use the following ace command to create one.

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

## Editor extensions

The syntax highlighting extensions are available for the following editors.

- [VsCode](https://marketplace.visualstudio.com/items?itemName=luongnd.edge)
- [Sublime Text](https://github.com/edge-js/edge-sublime)
- [Atom](https://github.com/edge-js/edge-atom-syntax)
- [Vim](https://github.com/watzon/vim-edge-template)
