---
summary: Learn how to debug Edge templates using the chrome devtools or the inspect helper
---

Edge provides a couple of options to debug the templates. The simplest one is the `inspect` global helper. This method pretty prints any value you provide to it and the other one is the `@debugger` tag.

## The `inspect` helper

The `inspect` helper pretty prints the value in the same output. You can think of this method as Node.js `util.inspect`, but instead it output HTML vs writing the output to the console.

```edge
{{ inspect({
  a: 1,
  b: [3, 4, undefined, null],
  c: undefined,
  d: null,
  e: {
    regex: /^x/i,
    buf: Buffer.from('abc'),
    holes: holes
  },
  balance: BigInt(100),
  id: Symbol('1234'),
  scores: new Set([1, 2, 3]),
  classes: new Map([['english', '1st'], ['maths', '2nd']]),
  currentScores: new WeakSet([[1, 2, 3]]),
  currentClasses: new WeakMap([[['english', '1st'], ['maths', '2nd']]]),
  now: new Date()
}) }}
```

#### Output

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1617090065/v5/edge-inspect.png)

## The `@debugger` tag

The `@debugger` tag drops a debugger break point inside the compiled JavaScript code and you can debug the output function using the standard [Node.js debugging methods](https://nodejs.org/api/debugger.html)

Just drop the `@debugger` in the position where you want the debugger to pause.

```edge
@debugger
<p> Hello {{ user.username }} </p>
```

Run the Node server with the `--inspect` flag and use Chrome to debug.

```sh
node ace serve --watch --node-args="--inspect"
```

::video{url="https://res.cloudinary.com/adonis-js/video/upload/q_auto/v1618594355/v5/edge-debugger.mp4" controls}
