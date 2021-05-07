The `@each` tag let you loop over an array or an object of values.

- It is a block level tag
- It accepts a binary expression with `(in)` operator as the only argument.

```edge
@each(username in ['virk', 'nikk', 'romain'])
  {{ username }}
@end
```

You can access the array index as follows:

```edge
@each((username, key) in ['virk', 'nikk', 'romain'])
  {{ key }} - {{ username }}
@end
```

Similarly, you can also loop over objects.

```edge
@each((amount, ingredient) in {
  ketchup: '5 tbsp',
  mustard: '1 tbsp',
  pickle: '0 tbsp'
})
  Use {{ amount }} of {{ ingredient }}
@end
```
