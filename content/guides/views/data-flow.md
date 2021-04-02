Edge exposes different APIs for sharing the data with the templates. Each API changes the scope at which the data is available inside the templates.

## Template state

Template state is represented as an object that you can pass while rendering the view. For example:

```ts
const state = {
  user: { id: 1, username: 'virk' },
}

await view.renderAsync('user', state)
```

The template state is available to the rendered template, its partials and the layout it use. In other words, the template state is not shared with the components.

## Globals

Globals are available to all the templates, including the components. You will usually use them to share helpers or the application wide metadata.

You can register a global using the `view.global` method

```ts
import View from '@ioc:Adonis/Core/View'

View.global('nl2br', function (text) {
  return text.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2')
})

View.global('menu', [
  {
    url: '/',
    text: 'Home',
  },
  {
    url: '/about',
    text: 'About',
  },
  {
    url: '/contact',
    text: 'Contact',
  },
])
```

#### Usage

```edge
<p> {{{ nl2br(post.description) }}} </p>

@each(item in menu)
  <a href="{{ item.url }}"> {{ item.text }} </a>
@end
```

## Locals

Locals are just like globals for a given instance of the [View renderer](./rendering-views#view-renderer). You can share locals by using the `view.share` method.

You will mostly find yourself using the `view.share` method within middleware to share the data with the template.

```ts
Route
  .get('/', ({ view }) => {
    await view.renderAsync('home')
  })
  .middleware(({ view }, next) => {
    view.share({
      foo: 'bar'
    })
    
    return next()
  })
```

## Inline variables

Finally, you can also define inline variables within the template files using the `@set` tag.

```edge
@set('title', 'Edge - A template engine for Node.js')

<title> {{ title }} </title>
```

The inline variables have the same scope as you define a variable in Javascript. For example: If the variable is defined inside the each block, you cannot access it outside the each block.

```edge
@each(item in cart)
  @set('price', item.quantity * item.unitPrice)
  {{ price }}
@end

{{ price }} {{-- undefined --}}
```
