---
goals:
  - We explain a bit about the Edge
  - An emphasis that it is a backend only template engine
  - Edge is not tied to HTML. You can use it with any markup language. Be it markdown, JSON or whatever
  - Editors language extensions
  - Accurate stack traces
  - One should know about Edge properly
---

The views layer of AdonisJS is powered by Edge. Edge is a simple, yet powerful template engine that helps you dynamically generate HTML with runtime data.

The edge templates are standard HTML documents using the edge syntax to reference runtime data, write conditionals, or run loops. For example:

##### Reference runtime values. Also known as interpolation

```edge
<h1> Hello {{ username }} </h1>
```

##### Write conditionals

```edge
@if(user.username)
  <h1> Hello {{ user.username }} </h1>
@else
  <h1> Hello Guest </h1>
@end
```

##### Run loops

```edge
@each(user in users)
  <h1> Hello {{ user.username }} </h1>
@end
```

## Edge features

Edge is one of the most modern template engines in the Node.js ecosystem.

## Rendering views

## Editor extensions

## What is Edge?

Edge is a template engine for Node.js. It runs
