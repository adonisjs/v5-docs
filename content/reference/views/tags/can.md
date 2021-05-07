The `@can` and the `@cannot` tags are contributed by the [@adonisjs/bouncer](../../../guides/digging-deeper/authorization.md) package. It allows you write conditionals around the bouncer permissions.

- Both are block-level tags.
- They accept the action name as the first argument, followed by the data accepted by the action.

```edge
@can('editPost', post)
  <a href="{{ route('posts.edit', [post.id]) }}"> Edit </a>
@end

@can('deletePost', post)
  <a href="{{ route('posts.delete', [post.id]) }}"> Delete </a>
@end
```

You can reference the actions on a policy by passing a string containing both the policy name and the action name separated by the dot notation.

```edge
@can('PostPolicy.edit', post)
  <a href="{{ route('posts.edit', [post.id]) }}"> Edit </a>
@end
```

### Passing authorizer for a different user

The `@can` and the `@cannot` tags authorize the actions against the currently logged-in user. If the underlying bouncer/policy action needs a different user, you will have to pass an explicit authorizer instance.

```edge
@can('PostPolicy.edit', bouncer.forUser(admin), post)
@end
```

In the above example, the second argument, `bouncer.forUser(admin)` is a child instance of bouncer for a specific user, followed by the action arguments.
