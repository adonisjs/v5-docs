---
summary: Learn how to loop over objects and arrays in Edge
---

You can loop over `objects` and `arrays` using the `@each` tag. It works similar to the `for of` loop in JavaScript.

```ts
view.render('users', {
  users: [
    {
      username: 'virk',
    },
    {
      username: 'romain',
    },
    {
      username: 'nikk',
    },
  ]
})
```

```edge
@each(user in users)
  <li> {{ user.username }} </li>
@end
```

You can access the loop index as shown in the following example

```edge
@each((user, index) in users)
  <li> {{ index + 1 }} {{ user.username }} </li>
@end
```

Similarly you can also loop over an object and access its key and value.

```ts
view.render('recipes', {
  food: {
    ketchup: '5 tbsp',
    mustard: '1 tbsp',
    pickle: '0 tbsp'
  }
})
```

```edge
@each((amount, ingredient) in food)
  <li> Use {{ amount }} of {{ ingredient }} </li>
@end
```

The `@each` tag works just fine with async code inside it. Here's an example of the same.

```ts
view.render('users', {
  users: [
    {
      username: 'virk',
      posts: async () => [{ title: 'Adonis 101' }],
    },
    {
      username: 'romain',
      posts: async () => [{ title: 'Flydrive 101' }],
    }
  ]
})
```

```edge
@each(user in users)
  <h2> {{ user.username }} posts </h2>

  @each(post in await user.posts())
    <p> {{ post.title }} </p>
  @end
@end
```
