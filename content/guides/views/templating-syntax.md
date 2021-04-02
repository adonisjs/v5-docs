With Edge, we ensure not to introduce too many new concepts and instead rely on the Javascript language features.

The syntax of Edge revolves around the two main primitives.

- **Curly braces** are used to evaluate an expression and display its output value.
- **Edge tags** are used to add new features to the template engine. The tags API is used by the core of edge and also exposed for you to add your own custom tags.

## Curly braces

Edge uses the popular approach of double curly braces (aka mustache) to evaluate the Javascript expressions. You can use any valid [Javascript expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators#expressions) inside the curly braces and Edge will evaluate it for you.

```edge
{{ user.username }}
{{ user.username.toUpperCase() }}
{{ (2 + 2) * 3 }}
{{ (await getUser()).username }}
```

The double curly braces escapes the expressions output to keep your template safe from the XSS attacks.

#### Given the following expression

```edge
{{ '<script> alert(`foo`) </script>' }}
```

#### The output will be:

```html
&lt;script&gt; alert(&#x60;foo&#x60;) &lt;/script&gt;
```

However, in situations where you trust the expression, you can **instruct edge to not escape the value by using three curly braces.**

```edge
{{{ '<script> alert(`foo`) </script>' }}}
```

#### Output

```html
<script>
  alert(`foo`)
</script>
```

## Escaping curly braces

You can escape the curly braces from getting parsed by prefixing the `@` symbol. This is usually helpful, when you are using edge to generate the markup for another template engine and want edge to ignore parsing of certain mustache braces.

```edge
Hello @{{ username }}
```

#### Output

```html
Hello {{ username }}
```

## Edge tags

Tags are the expressions that starts with the `@` symbol. Tags provide a unified API for adding features to the templating layer.

For example, the core of Edge has no support for conditionals, loops, or partials. They all are added on top by using the tags API.

```edge
{{-- if tag --}}
@if(user)
@end

{{-- include tag --}}
@include('partials/header')
```

A tag must always appear in its own line and cannot be mixed with other contents. Here is the [extensive syntax guide](https://github.com/edge-js/syntax).

```edge
{{-- ✅ Valid --}}
@if(user)
@end


{{-- ❌ Invalid --}}
Hello @if(user)
@end
```

We have further divided the tags into sub-groups to cater different templating needs.

### Block level tags

Block level tags are the one's that optionally accepts the content inside them. A block level tag must always be closed using the `@end` statement. For example:

#### `if` is a block level tag

```edge
@if(user)
@end
```

#### `section` is a block level tag

```edge
@section('body')
@end
```

### Inline tags

Inline tags do not accept any content inside them and are self closed within the same statement. For example:

#### `include` is an inline tag

```edge
@include('partials/header')
```

#### `layout` is an inline tag

```edge
@layout('layouts/master')
```

### Self closed block level tags

Occasionally you will find yourself self closing a block level tag. A great example of this is a `component` tag.

For example: A button component optionally accepts the markup for the button. However, in certain situations you don't want to define the markup and hence you can self close the tag using the `@!` expression.

#### Button component with body

```edge
@component('button')
  <span> Login </span>
@end
```

#### Self closed button component

```edge
@!component('button', { text: 'Login' })
```

### Seekable tags

Seekable tags are the one's that accepts one or more arguments. For example:

#### `include` is a seekable tag as it requires the partial path

```edge
@include('partials/header')
```

#### `super` is NOT a seekable tag

```edge
@super
```

The concept of seekable tags is introduced to optimize the edge compiler. For non seekable tags, the edge compiler does not wait for the opening and closing parenthesis to appear and just moves to the next line.

## Comments

The comments are written by wrapping the text inside the `{{-- --}}` expression.

```edge
{{-- This is a comment --}}

{{--
  This is a multiline comment
--}}

Hello {{ username }} {{-- inline comment --}}

{{-- surrounded by --}} Hello {{-- comments --}}
```

## Swallow new lines

Since tags are always written in their own line, they add an empty line to the final output. This empty line is not problematic with HTML markup, since HTML is not whitespace sensitive. However, if you are working with a whitespace sensitive language, then you can remove newline using the tilde `~` character.

```edge
<p>Hello
@if(username)~
 {{ username }}
@endif~
</p>
```

#### Output

```
<p>Hello virk</p>
```
