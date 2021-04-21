You can define custom messages alongside the schema object. Messages can be defined just for the validation rule, or you can define them for individual fields as well.

```ts
await request.validate({
  schema: schema.create({
    // ...
  }),
  // highlight-start
  messages: {
    required: 'The {{ field }} is required to create a new account',
    'username.unique': 'Username not available'
  }
  // highlight-end
})
```

- Custom message for the `required` rule will be used by all the fields that fails the required validation.
- Whereas, the `username.unique` combination is applicable only to the `username` field, for the `unique` validation rule.

Messages for nested objects and arrays can be defined using the dot separator.

```ts
{
  messages: {
    'user.username.required': 'Missing value for username',
    'tags.*.number': 'Tags must be an array of numbers',
    'products.*.title.required': 'Each product must have a title'
  }  
}
```

## Dynamic placeholders
You can make use of the following placeholders to reference runtime values inside your custom messages.

```ts
{
  messages: {
    required: '{{ field }} is required to sign up',
    enum: 'The value of {{ field }} must be in {{ options.choices }}'
  }
}
```

| Placeholder | Description |
|-------------|-------------|
| `{{ field }}` | Name of the field under validation. Nested object paths are represented with a dot separator. For example: `user.profile.username` |
| `{{ rule }}` | Name of the validation rule |
| `{{ options }}` | The options passed by the validation methods. For example: The `enum` rule will pass an array of `choices` and some rules may not pass any options at all |

## Wildcard callback
You can also define a callback function to construct the message at runtime. The callback can only be defined as a fallback using the wildcard `*` expression.

In the following example, the callback will be invoked for all the fields, except for the `username` field only when it fails the `required` validation.

```ts
{
  messages: {
    '*': (field, rule, arrayExpressionPointer, options) => {
      return `${rule} validation error on ${field}`
    },
    'username.required': 'Username is required to sign up',
  }
}
```

## Options passed to the message string
Following is the list of options passed by the different validation methods to the message string.

### date
The `date` validation rule will pass the `options.format`.

```ts
{
  'date.format': '{{ date }} must be formatted as {{ format }}',
}
```

---

### distinct
The `distinct` validation rule will pass the `field` on which the distinct rule is applied, along with `index` at which the duplicate value was found.

```ts
{
  'products.distinct': 'The product at {{ options.index + 1 }} position has already been added earlier'
}
```

---

### enum / enumSet
The `enum` and `enumSet` validation rules will pass an array of `options.choices`.

```ts
{
  'enum': 'The value must be one of {{ options.choices }}',
  'enumSet': 'The values must be one of {{ options.choices }}',
}
```

---

### file
The file validation allows defining custom messages for the sub rules. For example:

```ts
{
  'file.size': 'The file size must be under {{ options.size }}',
  'file.extnames': 'The file must have one of {{ options.extnames }} extension names',
}
```

---

### minLength / maxLength
The `minLength` and `maxLength` validation rules will pass the `options.length` to the message.

```ts
{
  'minLength': 'The array must have {{ options.minLength }} items',
}
```


---

### requiredIfExists / requiredIfNotExists
The `requiredIfExists` and `requiredIfNotExists` validation rules will pass the `options.otherField` as a string.

```ts
{
  'requiredIfExists': '{{ options.otherField }} requires {{ field }}',
}
```

---

### Conditional required rules
The following `requiredIf*` rules will pass the `options.otherFields` as an array of strings.

- requiredIfExistsAll
- requiredIfExistsAny
- requiredIfNotExistsAll
- requiredIfNotExistsAny

```ts
{
  'requiredIfExistsAll': '{{ options.otherFields }} requires {{ field }}',
}
```

---

### requiredWhen
The `requiredWhen` validation rule will pass the following options.

- `options.otherField`
- `options.operator`
- `options.values`


```ts
{
  'requiredWhen': '{{ field }} is required when {{ otherField }}{{ operator }}{{ values }}'
}
```
