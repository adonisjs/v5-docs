The route helper let you [generate URLs](../../../guides/http/routing.md#url-generation) for pre-registered routes by either using their `name` or the `controller.method` reference.

```edge
<form
  action="{{ route('PostsController.store') }}"
  method="POST"
>
</form>
```

## Route params

You can pass route params as the second argument. It can be an positional array of values or an object of key-value pair. The `key` is the route param name.

```ts
import Route from '@ioc:Adonis/Core/Route'

Route.put('posts/:id', 'PostsController.update')
```

```edge
<form
  action="{{ route('PostsController.update', [1]) }}"
  method="POST"
>
</form>
```

Example of route params as an object.

```edge
<form
  action="{{ route('PostsController.update', { id: 1 }) }}"
  method="POST"
>
</form>
```

## Options
The `route` helper also accepts additional options to append the query string, prefix a URL or lookup a route inside a specific domain.

### Query string
You can define the query string as an object using the `qs` property.

```edge
<form
  action="{{
    route('PostsController.update', { id: 1 }, {
      qs: {
        _method: 'PUT' {{-- 👈 --}}
      }
    })
  }}"
  method="POST"
>
</form>
```

### Lookup within a domain
You can also perform the route lookup within a specific domain. For example:

```ts
import Route from '@ioc:Adonis/Core/Route'

Route
  .group(() => {
    Route.get('/posts/:id', 'PostsController.show')
  })
  .domain(':tenant.adonisjs.com')
```

```edge
<a href="{{
  route('PostsController.show', [1], {
    domain: ':tenant.adonisjs.com'
  })
}}"> View post </a>
```

### Prefix URL
The URLs created by the `route` helper are always relative from the root of the domain. If required, you can manually prefix a URL.

```edge
<a href="{{
  route('PostsController.show', [1], {
    domain: ':tenant.adonisjs.com',
    prefixUrl: 'https://news.adonisjs.com'
  })
}}"> View post </a>
```

## Signed routes
The `signedRoute` helper is similar to the route helper, instead it creates a [signed URL](../../../guides/security/signed-urls.md).

The helpers accept the following additional options.

```edge
{{
  signedRoute('OnboardingController.verifyEmail', [user.email], {
    expiresIn: '30mins',
    purpose: 'verifyEmail'
  })
}}
```
