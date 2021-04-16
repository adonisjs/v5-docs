The `flashMessages` helper gives you the access to the session flash messages available for the given HTTP requests.

:::note

The helper is only available when rendering views using `ctx.view.render` and `ctx.view.renderAsync` methods.

:::

You can make use of the `inspect` helper to view all the available flash messages.

```edge
{{ inspect(flashMessages.all()) }}
```

---

### has
Find if the flash message exists for a given key or not. You can make use of the dot notation to lookup nested values.

```edge
@if(flashMessages.has('errors.username'))

@endif
```

---

### get
Returns the value for a given key. You can make use of the dot notation to lookup nested values.

```edge
{{ flashMessages.get('errors.username') }}
```

Optionally, you can pass a default value as the second parameter.

```edge
{{ flashMessages.get('username', 'Enter username') }}
```

---

### all
Returns all the available flash messages as an object.

```edge
{{ flashMessages.all().username }}
```
