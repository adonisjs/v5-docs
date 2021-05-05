---
summary: A guide on debugging Lucid database queries.
---

Lucid emits the `db:query` event when debugging is enabled globally or for an individual query.

You can enable debugging globally by setting the `debug` flag to `true` inside the `config/database.ts` file.

```ts
{
  client: 'pg',
  connection: {},
  debug: true, // 👈
}
```

You can enable debugging for an individual query using the `debug` method on the query builder.

:::codegroup

```ts
// title: Select
Database
  .query()
  .select('*')
  .debug(true) // 👈
```

```ts
// title: Insert
Database
  .insertQuery()
  .debug(true) // 👈
  .insert({})
```

```ts
// title: Raw
Database
  .rawQuery('select * from users')
  .debug(true) // 👈
```

:::

## Listening to the Event
Once you have enabled debugging, you can listen for the `db:query` event using the [Event](../digging-deeper/events.md) module.

```ts
// title: start/events.ts
import Event from '@ioc:Adonis/Core/Event'

Event.on('db:query', function ({ sql, bindings }) {
  console.log(sql, bindings)
})
```

### Pretty print queries
You can use the `Database.prettyPrint` method as the event listener to pretty-print the queries on the console.

```ts
import Event from '@ioc:Adonis/Core/Event'
import Database from '@ioc:Adonis/Lucid/Database'

Event.on('db:query', Database.prettyPrint)
```

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1618890917/v5/query-events.png)

## Debugging in production
Pretty printing queries add additional overhead to the process and can impact the performance of your application. Hence, we recommend using the [Logger](../digging-deeper/logger.md) to log the database queries during production. 

Following is a complete example of switching the event listener based upon the application environment.

```ts
import Event from '@ioc:Adonis/Core/Event'
import Database from '@ioc:Adonis/Lucid/Database'

import Logger from '@ioc:Adonis/Core/Logger'
import Application from '@ioc:Adonis/Core/Application'

Event.on('db:query', (query) => {
  if (Application.inProduction) {
    Logger.debug(query)    
  } else {
    Database.prettyPrint(query)
  }
})
```
