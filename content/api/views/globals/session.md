The `session` helper gives you the access to a readonly instance of the session store for the current HTTP request.

:::note

The helper is only available when rendering views using `ctx.view.render` and `ctx.view.renderAsync` methods.

:::

You can make use of the `inspect` helper to view all the available session data.

```edge
{{ inspect(session.all()) }}
```

---

### has
Find if the value for a given key exists inside the session store. You can make use of the dot notation to lookup nested values.

```edge
@if(session.has('user.id'))

@endif
```

---

### get
Returns the value for a given key. You can make use of the dot notation to lookup nested values.

```edge
{{ session.get('user.id') }}
```

Optionally, you can pass a default value as the second parameter.

```edge
{{ session.get('cartTotal', 0) }}
```

---

### all
Returns all the available values from the session store.

```edge
{{ session.all() }}
```
