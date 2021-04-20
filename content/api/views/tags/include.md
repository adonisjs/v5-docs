The `@include` tag allows you include a partial to a given template.

- It is an inline tag.
- It accepts only a single argument, that is the partial path relative from the views directory.
- The partial have access to the parent template state.

```edge
@include('partials/header')
```

You can also use variables to define the partial path.

```edge
@include(headerPartial)
```

You can also make use of the `@includeIf` tag to include a partial conditionally. The first argument is the condition to evaluate before including the partial.

```edge
@includeIf(post.comments.length, 'partials/comments')
```
