The `@component` tag allows you to use an Edge template as a component. 

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

## slot
The `@slot` tag allows you define the markup for the named slots. It accepts the slot name as the first argument and can also receive additional arguments from the component template.

```edge
@slot('main')
  This is the content for the main slot
@end
```

If the component passes any additional arguments to the slot, then you can access them as follows:

```edge
@slot('main', scope)
  {{ scope.title }}
@end
```

Since slots are regular functions, the component calls the function and passes it the arguments.

```edge
{{{ await $slots.main({ title: 'Hello world' }) }}}
```

## inject
The `@inject` tag allows the component template to [inject data](../../../guides/views/components.md#injecting-data-to-the-component-tree) into the component tree. The tag accepts an object as the only argument.

```edge
@inject({ tabs: [] })
```
