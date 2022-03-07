---
datetime: 2021-12-09
author: hlozancic
avatarUrl: https://avatars.githubusercontent.com/u/10560710?v=4
summary: Learn how to use custom type parsers with pg driver
---

This guide covers the process of using pg adapter to override how a specific data-type is parsed and turned into a JavaScript type.

By default the PostgreSQL backend server returns everything as strings.

For example this could be problematic if you need from your API to return JavaScript Number type for all decimal columns you have in database.

To fix this you can make the underlying [node-postgres](https://node-postgres.com/api/client) driver disregard the conversion safety and convert your columns to desired types.

:::note
JavaScript doesn't have support for 64-bit integers and node-postgres cannot confidently parse int8 data type results as numbers because if you have a huge number it will overflow and the result you'd get back from node-postgres would not be the result in the database. 


**So use this only if you know that you won't ever have numbers greater than int4 in your database.**
:::

## Getting OID value of PostgreSQL type

Let's say that we want to parse all `decimal` columns to `float`. First we need to find `OID` value of `NUMERIC` PostgreSQL type.

:::note
Every data type corresponds to a unique OID within the server, and these OIDs are sent back with the query response. So, you need to match a particular OID to a function you'd like to use to take the raw text input and produce a valid JavaScript object as a result.
:::

To do this we can run this query on database:

```sql
select typname, oid, typarray from pg_type order by oid
```

But there is a simpler and easier way to do this. We have every type enumerated if we import `import { types } from 'pg'`.

## Using setTypeParser method to parse types

:::note
Make sure you have `PostgreSQL` driver installed.
:::

We need to call pg.setTypeParser method inside AppProvider.ts to set up our custom type parsers.

```ts
// title: providers/AppProvider.ts
import { types } from 'pg' // we are importing types from pg, so we can use existing enums
export default class AppProvider {
  constructor(protected app: ApplicationContract) {
  }

  public register() {
  }

  public async boot() {
    // -- this is where the magic happens!
    types.setTypeParser(types.builtins.NUMERIC, function(val) {
      return parseFloat(val)
    })

    // ... rest of AppProvider.ts
  }
}
```

## Make driver autmatically use BigInt for BIGINT + BIGSERIAL

One more example is how we can utilise this to convert BIGINT and BIGSERIAL PostgreSQL types to JavaScript BigInt:

```ts
// INT8 is OID 20 which corresponds to: BIGINT | BIGSERIAL
types.setTypeParser(types.builtins.INT8, BigInt)
```
