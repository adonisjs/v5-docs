---
summary: Transaction client complete API reference
---

The [Transaction client](https://github.com/adonisjs/lucid/blob/master/src/TransactionClient/index.ts) extends the [Query client](./query-client.md) and has following extra properties on top of the standard query client.

You can access the transaction query client as follows:

```ts
import Database from '@ioc:Adonis/Lucid/Database'
const trx = await Database.transaction()

// for a given connection
const trx = await Database
  .connection('pg')
  .transaction()
```

You can also define the transaction isolation level as follows.

```ts
await Database.transaction({
  isolationLevel: 'read uncommitted'
})
```

Following is the list of available isolation levels.

- **"read uncommitted"**
- **"read committed"**
- **"snapshot"**
- **"repeatable read"**
- **"serializable"**

## Methods/Properties
Following is the list of methods and properties available on the transaction client class.

### commit
Commit the transaction

```ts
await trx.commit()
```

---

### rollback
Rollback the transaction

```ts
await trx.rollback()
```

---

### isCompleted
Find if the transaction has been completed or not.

```ts
if (!trx.isCompleted) {
  await trx.commit()
}
```

## Events
The transaction client also events the following events when the transaction is committed or rolled back.

```ts
trx.once('commit', (self) => {
  console.log(self)
})
```

```ts
trx.once('rollback', (self) => {
  console.log(self)
})
```
