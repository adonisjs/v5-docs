The view helper truncates a given string value by the number of characters. For example:

```edge
{{
  truncate(
    'This is a very long sentence that i would like to be shortened',
    18
  )
}}

<!-- Output: This is a very long... -->
```

The `truncate` method doesn't chop the words in between and let them get completed. However, you can turn off this behavior by setting `completeWords` option to `false`.

```edge
{{
  truncate(
    'This is a very long sentence that i would like to be shortened',
    18,
    // highlight-start
    { completeWords: false }
    // highlight-end
  )
}}

// highlight-start
<!-- Output: This is a very lon... -->
// highlight-end
```

Also, you can define a custom suffix for the truncated string.

```edge
{{
  truncate(
    'This is a very long sentence that i would like to be shortened',
    18,
    { suffix: ' [Read more]' }
  )
}}

<!-- Output: This is a very long [Read more] -->
```
