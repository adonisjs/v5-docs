The `@set` tag allows you to define local variables within the template scope or mutate the value of an existing variable.

- It is an inline tag.
- It accepts the variable name as the first argument and its value as the second argument.

```edge
@set('title', 'AdonisJS - A fully featured framework')
```

Following is the compiled output

```js
let title = 'AdonisJS - A fully featured framework';
```

Re-defining the same variable will update the existing value.

```edge
@set('title', 'AdonisJS - A fully featured framework')
@set('title', 'AdonisJS - About page')
```

```js
let title = 'AdonisJS - A fully featured framework';
title = 'AdonisJS - About page';
```

The `@set` tag can also update the properties on an existing variable. The behavior is similar to the `lodash.set` method.

```edge
@set(post, 'title', 'New title')
@set(post, 'author.name', 'Virk')
```
