---
summary: Reference to the utility helpers baked into the core of the framework.
---

AdonisJS bundles the utilities used by the framework or the ecosystem packages into a Helpers module and makes them available to your application code.

Since these utilities are already installed and used by the framework, the helpers module does not add any additional bloat to your `node_modules`.

## String helpers
The string helpers expose the following transformation methods.

### camelCase
Convert a string to its `camelCase` version.

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.camelCase('hello-world') // helloWorld
```

---

### snakeCase
Convert a string to its `snake_case` version.

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.snakeCase('helloWorld') // hello_world
```

---

### dashCase
Convert a string to its `dash-case` version. Optionally, you can also capitalize the first letter of each segment.

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.dashCase('helloWorld') // hello-world
string.dashCase('helloWorld', { capitalize: true }) // Hello-World
```

---

### pascalCase
Convert a string to its `PascalCase` version.

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.pascalCase('helloWorld') // HelloWorld
```

---

### capitalCase
Capitalize a string

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.capitalCase('helloWorld') // Hello World
```

---

### sentenceCase
Convert string to a sentence

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.sentenceCase('hello-world') // Hello world
```

---

### dotCase
Convert string to its `dot.case` version.

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.dotCase('hello-world') // hello.world
```

---

### noCase
Remove all sorts of casing

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.noCase('hello-world') // hello world
string.noCase('hello_world') // hello world
string.noCase('helloWorld') // hello world
```

---

### titleCase
Convert a sentence to title case

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.titleCase('Here is a fox') // Here Is a Fox
```

---

### pluralize
Pluralize a word.

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.pluralize('box') // boxes
string.pluralize('i') // we
```

You can also define your own irregular rules using the `defineIrregularRule` method. The method accepts the singular version as the first argument and the plural version as the second argument.

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.defineIrregularRule('auth', 'auth')
string.plural('auth') // auth
```

You can also define your own uncountable rules using the `defineUncountableRule` method.

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.defineUncountableRule('login')
string.plural('login') // home
```

---

### truncate
Truncate a string after a given number of characters

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.truncate(
  'This is a very long, maybe not that long title',
  12
) // This is a ve...
```

By default, the string is truncated exactly after the given characters. However, you can instruct the method to wait for the words to complete.

```ts
string.truncate(
  'This is a very long, maybe not that long title',
  12,
  {
    completeWords: true
  }
) // This is a very...
```

Also, it is possible to customize the suffix.

```ts
string.truncate(
  'This is a very long, maybe not that long title',
  12,
  {
    completeWords: true,
    suffix: ' <a href="/1"> Read more </a>',
  }
) // This is a very <a href="/1"> Read more </a>
```

---

### excerpt
The `excerpt` method is the same as the `truncate` method. However, it strips the HTML from the string.

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.excerpt(
  '<p>This is a <strong>very long</strong>, maybe not that long title</p>',
  12
) // This is a very...
```

---

### condenseWhitespace
Condense whitespaces from a given string. The method removes the whitespace from the `left`, `right`, and multiple whitespaces between the words.

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.condenseWhitespace(' hello  world ')
// hello world
```

---

### escapeHTML
Escape HTML from the string

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.escapeHTML('<p> foo © bar </p>')
// &lt;p&gt; foo © bar &lt;/p&gt;
```

Additionally, you can also encode non-ASCII symbols.

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.escapeHTML(
  '<p> foo © bar </p>',
  {
    encodeSymbols: true
  }
)
// &lt;p&gt; foo &#xA9; bar &lt;/p&gt;
```

---

### encodeSymbols
Encode symbols. Checkout [he](https://npm.im/he) for available options

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.encodeSymbols('foo © bar')
// foo &#xA9; bar
```

---

### toSentence
Join an array of words with a separator.

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.toSentence([
  'route',
  'middleware',
  'controller'
]) // route, middleware, and controller

string.toSentence([
  'route',
  'middleware'
]) // route and middleware
```

You can define the following options to customize the output.

- `separator` is the value between two words except the last one.
- `pairSeparator` is the value between the first and the last word. Used, only when there are two words
- `lastSeparator` is the value between the second last and the last word. Used only when there are more than two words.

```ts
string.toSentence([
  'route',
  'middleware',
  'controller'
], {
  separator: '/ ',
  lastSeparator: '/or '
}) // route/ middleware/or controller
```

---

### prettyBytes
Convert bytes value to a human-readable string. For options, reference the [bytes](https://www.npmjs.com/package/bytes) package.

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.prettyBytes(1024) // 1KB
string.prettyBytes(1024, { unitSeparator: ' ' }) // 1 KB
```

---

### toBytes
Convert human-readable string to bytes. This method is the opposite of the `prettyBytes` method.

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.toBytes('1KB') // 1024
```

---

### prettyMs
Convert time in milliseconds to a human-readable string

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.prettyMs(60000) // 1min
string.prettyMs(60000, { long: true }) // 1 minute
```

---

### toMs
Convert human-readable string to milliseconds. This method is the opposite of the `prettyMs` method.

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.toMs('1min') // 60000
```

---

### ordinalize
Ordinalize a string or a number value

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.ordinalize(1) // 1st
string.ordinalize(99) // 99th
```

---

### generateRandom
Generate a cryptographically strong random string

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.generateRandom(32)
```

---

### isEmpty
Find if a value is empty. Also checks for empty strings with all whitespace

```ts
import { string } from '@ioc:Adonis/Core/Helpers'

string.isEmpty('') // true
string.isEmpty('      ') // true
```

## Type detection
Type detection in JavaScript is very weak and often leads to unexpected bugs. For example: `typeof null` is **object** and `typeof []` is also an **object**.

You can use the `types` helper to have more accurate and consistent type checking in your application.

### lookup
The `lookup` method returns the type for a given value.

```ts
import { types } from '@ioc:Adonis/Core/Helpers'

types.lookup({}) // object
types.lookup([]) // array
types.lookup(Object.create(null)) // object
types.lookup(null) // null
types.lookup(function () {}) // function
types.lookup(class Foo {}) // class
types.lookup(new Map()) // map
```

---

### isNull
Find if the given value is null

```ts
import { types } from '@ioc:Adonis/Core/Helpers'

types.isNull(null) // true
```

---

### isBoolean
Find if the given value is a boolean

```ts
import { types } from '@ioc:Adonis/Core/Helpers'

types.isBoolean(true) // true
```

---

### isBuffer
Find if the given value is a buffer

```ts
import { types } from '@ioc:Adonis/Core/Helpers'

types.isBuffer(new Buffer()) // true
```

---

### isNumber
Find if the given value is a number

```ts
import { types } from '@ioc:Adonis/Core/Helpers'

types.isNumber(100) // true
```

---

### isString
Find if the given value is a string

```ts
import { types } from '@ioc:Adonis/Core/Helpers'

types.isString('hello') // true
```

---

### isArguments
Find if the given value is an arguments object

```ts
import { types } from '@ioc:Adonis/Core/Helpers'

function foo() {
  types.isArguments(arguments) // true
}
```

---

### isObject
Find if the given value is a plain object

```ts
import { types } from '@ioc:Adonis/Core/Helpers'

types.isObject({}) // true
```

---

### isDate
Find if the given value is a date object

```ts
import { types } from '@ioc:Adonis/Core/Helpers'

types.isDate(new Date()) // true
```

---

### isArray
Find if the given value is an array

```ts
import { types } from '@ioc:Adonis/Core/Helpers'

types.isArray([1, 2, 3]) // true
```

---

### isRegexp
Find if the given value is a regular expression

```ts
import { types } from '@ioc:Adonis/Core/Helpers'

types.isRegexp(/[a-z]+/) // true
```

---

### isError
Find if the given value is an instance of the error object.

```ts
import { types } from '@ioc:Adonis/Core/Helpers'
import { Exception } from '@poppinss/utils'

types.isError(new Error('foo')) // true
types.isError(new Exception('foo')) // true
```

---

### isFunction
Find if the given value is a function

```ts
import { types } from '@ioc:Adonis/Core/Helpers'

types.isFunction(function foo() {}) // true
```

---

### isClass
Find if the given value is a class constructor. Uses regex to distinguish between a function and a class.

```ts
import { types } from '@ioc:Adonis/Core/Helpers'

class User {}

types.isClass(User) // true
types.isFunction(User) // false
```

---

### isInteger
Find if the given value is an integer.

```ts
import { types } from '@ioc:Adonis/Core/Helpers'

types.isInteger(22.00) // true
types.isInteger(22) // true
types.isInteger(-1) // true
types.isInteger(-1.00) // true

types.isInteger(22.10) // false
types.isInteger(.3) // false
types.isInteger(-.3) // false
```

---

### isFloat
Find if the given value is a float number.

```ts
import { types } from '@ioc:Adonis/Core/Helpers'

types.isFloat(22.10) // true
types.isFloat(-22.10) // true
types.isFloat(.3) // true
types.isFloat(-.3) // true

types.isFloat(22.00) // false
types.isFloat(-22.00) // false
types.isFloat(-22) // false
```

---

### isDecimal
Find if the given value has a decimal. The value can be a string or a number. The number values are casted to a string by calling the `toString()` method on the value itself.

The string conversion is performed to test the value against a regex since there is no way to find a decimal value in JavaScript natively.

```ts
import { types } from '@ioc:Adonis/Core/Helpers'

types.isDecimal('22.10') // true
types.isDecimal(22.1) // true

types.isDecimal('-22.10') // true
types.isDecimal(-22.1) // true

types.isDecimal('.3') // true
types.isDecimal(0.3) // true

types.isDecimal('-.3') // true
types.isDecimal(-0.3) // true

types.isDecimal('22.00') // true
types.isDecimal(22.0) // false (gets converted to 22)

types.isDecimal('-22.00') // true
types.isDecimal(-22.0) // false (gets converted to -22)

types.isDecimal('22') // false
types.isDecimal(22) // false

types.isDecimal('0.0000000000001') // true
types.isDecimal(0.0000000000001) // false (gets converted to 1e-13)
```

## safeEqual
Compares two values with each other by avoiding the [timing attack](https://en.wikipedia.org/wiki/Timing_attack). This method internally uses the [crypto.timingSafeEqual](https://nodejs.org/api/crypto.html#crypto_crypto_timingsafeequal_a_b) method, but can also compare two strings.

```ts
import { safeEqual } from '@ioc:Adonis/Core/Helpers'

if (safeEqual('hello world', 'hello world')) {
}
```

## requireAll
Helper to require all the `.js`, `.ts` and `.json` files from a directory. This method only works with commonjs modules and not with ES modules.

```ts
import { join } from 'path'
import { requireAll } from '@ioc:Adonis/Core/Helpers'

const configTree = requireAll(join(__dirname, 'config'))
```

The files are imported recursively by default. However, you can turn off recursive scanning by setting the second argument to `false`

```ts
requireAll(join(__dirname, 'config'), false)
```

An exception is raised when the root directory is missing. However, you can instruct the method to ignore the missing directory by setting the third argument as `true`.

```ts
requireAll(join(__dirname, 'config'), true, true)
```

## fsReadAll
Recursively scan all and collect paths for all the `.js`, `.ts`, and `.json` files from a given directory.

```ts
import { join } from 'path'
import { fsReadAll } from '@ioc:Adonis/Core/Helpers'

fsReadAll(join(__dirname, 'config'))
// ['app.ts', 'bodyparser.ts', 'cors.ts']
```

Optionally you can define a custom filter function to ignore certain paths. Defining a custom filter removes the existing filter of selecting only `.js`, `.ts` and `.json` files.

```ts
fsReadAll(join(__dirname, 'config'), (filePath) => {
  return filePath.endsWith('.md')
})
```

## base64
Encode/decode Base64 values. Make use of the `urlEncode` and `urlDecode` methods if you want to pass the encoded value to a URL.

```ts
import { base64 } from '@ioc:Adonis/Core/Helpers'

base64.encode('hello world')
base64.decode(base64.encode('hello world'))

// URL safe encoding
base64.urlEncode('hello world')
base64.urlDecode(base64.urlEncode('hello world'))
```

You can also define custom encoding for the input value.

```ts
const encoded = base64.encode(bufferValue, 'binary')
base64.decode(encoded, 'binary')
```

## interpolate
A lightweight helper method to interpolate curly braces inside a string. This method is not a replacement for any template engines.

```ts
import { interpolate } from '@ioc:Adonis/Core/Helpers'

interpolate('hello {{ username }}', { username: 'virk' })

// Nested values
interpolate('hello {{ user.username }}', {
  user: { username: 'virk' }
})

// Array of objects
interpolate('hello {{ users.0.username }}', {
  users: [{ username: 'virk' }]
})

// Array of literal values
interpolate('hello {{ scores.0 }}', {
  scores: [67, 80]
})
```

## compose
JavaScript doesn't have a concept of inheriting multiple classes together, and neither does TypeScript. However, the [official documentation](https://www.typescriptlang.org/docs/handbook/mixins.html) of TypeScript does talks about the concept of mixins.

As per the TypeScript docs, you can create and apply mixins as follows.

```ts
type Constructor = new (...args: any[]) => any

const UserWithEmail = <T extends Constructor>(superclass: T) => {
  return class extends superclass {
    public email: string
  }
}

const UserWithPassword = <T extends Constructor>(superclass: T) => {
  return class extends superclass {
    public password: string
  }
}

class BaseModel {}
class User extends UserWithPassword(UserWithEmail(BaseModel)) {}
```

Mixins are close to a perfect way of inheriting multiple classes. I recommend reading [this article](https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/) for the same.

However, the syntax of applying multiple mixins is ugly, as you have to apply **mixins over mixins**, creating a nested hierarchy as shown below.

```ts
class User extends UserWithAttributes(
  UserWithAge(
    UserWithPassword(
      UserWithEmail(BaseModel)
    )
  )
) {}
```

The `compose` method is a small utility to improve the syntax a bit.

```ts
import { compose } from '@ioc:Adonis/Core/Helpers'

class User extends compose(
  BaseModel,
  UserWithPassword,
  UserWithEmail,
  UserWithAge,
  UserWithAttributes
) {}
```

#### Mixins gotchas
TypeScript has an [open issue](https://github.com/microsoft/TypeScript/issues/37142) related to the constructor arguments of the mixin class or the base class.

TypeScript expects all classes used in the mixin chain to have a constructor with only one argument of `...args: any[]`. For example: **The following code will work fine at runtime, but the TypeScript compiler complains about it**.

```ts
class BaseModel {
  constructor(name: string) {}
}

const UserWithEmail = <T extends typeof BaseModel>(superclass: T) => {
  return class extends superclass {
    // ERROR: A mixin class must have a constructor with a single rest parameter of type 'any[]'.ts(2545)
    public email: string
  }
}

class User extends compose(BaseModel, UserWithEmail) {}
```

You can work around this by overriding the base class's constructor using the `NormalizeConstructor` type.

```ts
import {
  compose,
  NormalizeConstructor
} from '@ioc:Adonis/Core/Helpers'

const UserWithEmail = <T extends NormalizeConstructor<typeof BaseModel>>(
  superclass: T
) => {
  return class extends superclass {
    public email: string
  }
}
```

## cuid
Generate a [collision-resistant ID](https://github.com/ericelliott/cuid).

```ts
import { cuid } from '@ioc:Adonis/Core/Helpers'

cuid()
// cjld2cjxh0000qzrmn831i7rn
```
