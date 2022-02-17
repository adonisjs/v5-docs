Following is the list of available string helpers that you can use with in your Edge templates. The framework core and official packages of AdonisJS are already using these helpers, its just we have also injected them as view helpers.

---

### camelCase
Convert a string to its `camelCase` version.

```edge
{{ camelCase('hello-world') }}

<!-- Output: helloWorld -->
```

---

### snakeCase
Convert a string to its `snake_case` version.

```edge
{{ snakeCase('helloWorld') }}

<!-- Output: hello_world -->
```

---

### dashCase
Convert a string to its `dash-case` version. Optionally, you can also capitalize the first letter of each segment.

```edge
{{ string.dashCase('helloWorld') }} <!-- hello-world -->

{{
  string.dashCase('helloWorld', { capitalize: true })
}} <!-- Hello-World -->
```

---

### pascalCase
Convert a string to its `PascalCase` version.

```edge
{{ pascalCase('helloWorld') }}

<!-- Output: HelloWorld -->
```

---

### capitalCase
Capitalize a string value.

```edge
{{ capitalCase('helloWorld') }}

<!-- Output: Hello World -->
```

---

### sentenceCase
Convert string to sentence case.

```edge
{{ sentenceCase('hello-world') }}

<!-- Output: Hello world -->
```

---

### dotCase
Convert string to its `dot.case` version.

```edge
{{ dotCase('hello-world') }}

<!-- Output: hello.world -->
```

---

### noCase
Remove all sorts of casing from a string.

```edge
{{ noCase('hello-world') }} <!-- hello world -->
{{ noCase('hello_world') }} <!-- hello world -->
{{ noCase('helloWorld') }} <!-- hello world -->
```

---

### titleCase
Convert a sentence to title case.

```edge
{{ titleCase('Here is a fox') }}

<!-- Output: Here Is a fox -->
```

---

### pluralize
Pluralize a word.

```edge
{{ pluralize('box') }} <!-- boxes -->
{{ pluralize('i') }} <!-- we -->
```

---

### toSentence
Join an array of words with a separator to form a sentence.

```edge
{{ 
  toSentence([
    'route',
    'middleware',
    'controller'
  ])
}}

<!-- route, middleware, and controller -->
```

You can also define the following options to customize the separators.

- `separator`: The value between two words except the last one.
- `pairSeparator`: The value between the first and the last word. Used, only when there are two words.
- `lastSeparator`: The value between the second last and the last word. Used, only when there are more than two words.

```edge
{{
  toSentence([
    'route',
    'middleware',
    'controller'
  ], {
    separator: '/ ',
    lastSeparator: '/or '
  })
}}

<!-- route/ middleware/or controller -->
```

---

### prettyBytes
Convert bytes value to a human readable string. Accepts and forwards all the options to the [bytes](https://www.npmjs.com/package/bytes) package.

```edge
{{ prettyBytes(1024) }} <!-- 1KB -->

{{
  prettyBytes(1024, { unitSeparator: ' ' })
}} <!-- 1 KB -->
```

---

### toBytes
Convert human readable string to bytes. This method is the opposite of the `prettyBytes` method.

```edge
{{ toBytes('1KB') }} <!-- 1024 -->
```

---

### prettyMs
Convert time represented in milliseconds to a human readable string.

```edge
{{ prettyMs(60000) }} <!-- 1min -->

{{ prettyMs(60000, { long: true }) }} <!-- 1 minute -->
```

---

### toMs
Convert human readable string to milliseconds. This method is the opposite of the `prettyMs` method.

```edge
{{ toMs('1min') }} <!-- 60000 -->
```

---

### ordinalize
Ordinalize a string or a number value.

```edge
{{ ordinalize(1) }} <!-- 1st -->
{{ ordinalize(99) }} <!-- 99th -->
```

---

### nl2br
Convert the newline charcaters with a `<br>` tag.

```ts
{{{ nl2br(post.content) }}}
```

When using the `nl2br` helper, you will have to use three curly braces to render the `<br>` tag a HTML instead of escaping it.

However, this will also render the HTML tags from the `post.content` variable. To overcome this situation, we recommend you to separately escape the user input before passing it to the `nl2br` method.

:::note
Following is the correct way of using the `nl2br` method. This ensures, the user input is always escaped.
:::

```ts
{{{ nl2br(e(post.content)) }}}
```

---

### e
Escape HTML inside a string value. The double curly braces already escape the value, so use this method only when you are not using the double curly braces.

```ts
{{{ e(post.content) }}}
```

---
