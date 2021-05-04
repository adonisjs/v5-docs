---
summary: Reference guide to mutations in Edge using the `@set` tag
---

Edge allows you to define local variables or mutate the value of an existing property using the `@set` tag.

Ideally, it is best to avoid too many inline local variables and pre process your data before passing it to the template.

## Declare the value

The first time you use `@set` tag, we will declare a `let` variable.

```edge
@set('username', 'virk')
```

#### Compiled output

```js
let username = 'virk'
```

Redeclaring the same variable again will just update the existing value.

```edge
@set('username', 'virk')
@set('username', 'romain')
```

#### Compiled output

```js
let username = 'virk'
username = 'romain'
```

## Mutate properties

The `@set` tag can also be used to mutate the properties of an existing object. For example.

```edge
@set(post, 'title', 'This is the new title')
```

In the above scenario, the value of `post.title` will be updated. You can also update nested values.

```edge
@set(
  post,
  'author.avatar',
  await getAvatar(post.author.email)
)

<img src="{{ post.author.avatar }}" />
```
