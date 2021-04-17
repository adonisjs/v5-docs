The `@component` tag allows you to use an edge template as a component. 

- It is a block level tag
- It accepts the template path relative from the `views` directory, along with the component state as the second argument.

```edge
@!component('components/button', {
  title: 'Hello world'
})
```

You can also derive the component name from a runtime value.

```edge
@!component(currentTheme.button, {
  title: 'Hello world'
})
```
