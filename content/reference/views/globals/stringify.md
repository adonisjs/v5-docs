The `stringify` method is very similar to the `JSON.stringify` but escaped certain HTML characters to prevent XSS attacks when passing data from the backend to the frontend script.

Consider the following example.

```edge
@set('userInput', "</script><script>alert('bad actor')</script>")

<script>
  console.log({{{ JSON.stringify(userInput) }}})
  console.log({{{ stringify(userInput) }}})
</script>
```

The `JSON.stringify` usage will execute the code as HTML, whereas the `stringify` method will not. Therefore, converting your back-end data structures to a JSON string using the `stringify` helper is recommended.
