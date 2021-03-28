Edge is a logical and batteries included template engine for Node.js. It can render any text based format, whether is **HTML**, **Markdown** or **plain text** files.

We created edge as an alternative to other existing template engines and address the pain points we had with them.

Unlike Pug, we don't re-invent the way you write the HTML. Infact, Edge is not even tied to HTML at first place, as it can render any text based files.

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

Unlike Handlebars, Edge is not restrictive in nature. You can use any Javascript expression inside your templates and we parse them using a spec compliant JavaScript parser.

#### Create a helper for everything

```js
Handlebars.registerHelper('upperCase', function (aString) {
  return aString.toUpperCase()
})
```

```hbs
{{upperCase lastname}}
```

#### Just write regular Javascript

```edge
{{ lastname.toUpperCase() }}
```

Along with this

- Edge respects the whitespace inside your templates
- Ships with a components system
- Raises exceptions with accurate stack traces

## About guides

The guides are written both for the standalone usage of Edge and its usage with the [AdonisJS framework](https://preview.adonisjs.com). Select `AdonisJS` from the top right dropdown to read the AdonisJS version of docs.

## Usage

Begin by installing the package from the npm registry as follows:

```sh
npm i edge.js

# Or
yarn add edge.js
```

Next, create the following directory structure.

```sh
├── views
│   └── user.edge
├── index.js
```

And finally, import the module and render the template as shown in the following example.

```edge{}{views/user.edge}
<p> Hello {{ username }} </p>
```

```js{index.js}
const edge = require('edge.js').default
const { join } = require('path')

// Register a directory to look for views
edge.mount(join(__dirname, 'views'))

// Render view
const output = await edge.renderAsync('user', {
  username: 'virk'
})

console.log(output)
```

## Editor extensions

The syntax highlighting extensions are available for the following editors.

- [VsCode]()
- [Sublime Text]()
- [Atom]()

## Participate

We are actively looking for contributors to help push the ecosystem of Edge forward. Feel free to reach us on [Github]() if any of the following interests you.

- Create a syntax highlighting extension for the editor of your choice. Here's the reference doc to help you build it.
- Help us create [Edge UI](), a UI library for vanilla HTML and Edge templates.

## Community

Edge is extracted from the AdonisJS framework for standalone usage and community channels of AdonisJS are used to help, educate and grow Edge.

Follow us on Twitter\
Star us on Github\
Join the discord channel `#edge`
