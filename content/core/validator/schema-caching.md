---
summary: A 101 guide to schema caching in AdonisJS and covering the topics around caching caveats and using refs.
---

The schema created using the `schema.create` method is first complied to an executable function and then executed to validate the data against the defined rules.

The compilation process does take a couple of milliseconds before the validation begins. However, based on your performance expectations, you may want to consider caching the compiled schema and hence don't pay the compilation penalty on every request.

## Using the `cacheKey`
You can cache a schema by defining a unique `cacheKey`. You can generate this cache key using any approach or rely on the `ctx.routeKey` during an HTTP request.

```ts
await request.validate({
  schema: schema.create({...}),
  cacheKey: ctx.routeKey,
})
```

- The first call to `request.validate` will compile the schema and saves the output in reference to the `cacheKey`.
- Until the `cacheKey` is identical, the validator won't recompile the schema.

## Caching caveats
Caching in any form is not free, and the same is the case with schema caching. If your schema relies on runtime values, then caching schema will not give the desired outcome. Consider the following example:

- You are creating a form that accepts the user **state** and their **city**.
- The city options are based upon the value of the selected **state**.

```ts
/**
 * Assuming the following variables hold data
 */
const STATES = []
const CITIES = {}

export default class AddressValidator {
  public selectedState = this.ctx.request.input('state') // 👈

  public schema = schema.create({
    state: schema.enum(STATES),
    city: schema.enum(CITIES[this.selectedState] || [])
  })
}
```

If you look at the above example, the enum options for the `city` are dependent on the `selectedState` and may vary with every HTTP request.

However, since we have schema caching turned on. The enum options after the first request will get cached and will not change even if the user selects a different state.

Now that you understand how caching works. Let's explore some different ways to use dynamic data within your validation schema.

### Give up caching
The first option is to give up caching. This will add a delay of a couple of milliseconds to your requests but gives you the most straightforward API to use runtime values within your schema definition.

### Create a unique key
Considering the above example, you can append the selected state to the `cacheKey`, and hence each state will have its copy of cached schema. For example:

```ts
export default class AddressValidator {
  public selectedState = this.ctx.request.input('state')

  public schema = schema.create({
    state: schema.enum(STATES),
    city: schema.enum(CITIES[this.selectedState] || [])
  })

  // highlight-start
  public cacheKey = `${this.ctx.routeKey}-${selectedState}`
  // highlight-end
}
```

The above approach has its own set of downsides. For example, if there are 37 states, there will be 37 cached copies of the same schema with a slight variation. Also, this number will grow exponentially if you need more than one dynamic value.

Giving up caching is better than caching too many schemas with slight variations.

### Using refs
Refs give you the best of both worlds. You can still cache your schema and also reference the runtime values inside them. Following is an example of the same:

```ts
export default class AddressValidator {
  public selectedState = this.ctx.request.input('state')

  // highlight-start
  public refs = schema.refs({
    cities: CITIES[this.selectedState] || []
  })
  // highlight-end

  public schema = schema.create({
    state: schema.enum(STATES),
    // highlight-start
    city: schema.enum(this.refs.cities)
    // highlight-end
  })
}
```

Instead of referencing `CITIES[this.selectedState]` directly, you move it to the `schema.refs` object, and from there on, the cities will be picked up at runtime without recompiling the schema.

:::note

Refs only work if the **validation rule** or the **schema type** supports them.

:::
