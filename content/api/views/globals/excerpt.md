The view helper generates the excerpt from an HTML fragment. The return value removes the HTML tags and returns a plain string.

```edge
{{
  excerpt(
    '<p> Hello, this is a dummy <strong> post </strong> </p>',
    20
  )
}}

<!-- Output: Hello, this is a dummy... -->
```

The `excerpt` method doesn't chop the words in between and let them get completed. However, you can turn off this behavior by setting `completeWords` option to `false`.

```edge
{{
  excerpt(
    '<p> Hello, this is a dummy <strong> post </strong> </p>',
    20,
    // highlight-start
    { completeWords: false }
    // highlight-end
  )
}}

// highlight-start
<!-- Output: Hello, this is a du... -->
// highlight-end
```

Also, you can define a custom suffix for the truncated string.

```edge
{{
  excerpt(
    '<p> Hello, this is a dummy <strong> post </strong> </p>',
    20,
    { suffix: ' [Read more]' }
  )
}}

<!-- Output: Hello, this is a dummy [Read more] -->
```
