The output of interpolation (the code inside the `curly braces`) is HTML escaped to avoid XSS attacks. However, at times you do want to render HTML without escaping and for that you can make use of three curly braces instead of two.

```edge
{{ '<p> I will be escaped </p>' }}
{{{ '<p> I will render as it is </p>' }}}
```

Another way to render HTML without escaping, is to make use of the `safe` method.

```edge
{{ safe('<p> I will render as it is </p>') }}
```

Using the `safe` method has no advantage over three curly braces. However, it becomes helpful, when you are creating your own global methods and want to render HTML from them without instructing the end user to use three curly braces.

```ts
View.global('input', (type: string, value: string) => {
  return View.GLOBALS.safe(`<input type="${type}" value="${value || ''}" />`)
})
```

And now you can use the `input` global inside the standard double curly braces.

```edge
{{ input('text', 'foo') }}
```
