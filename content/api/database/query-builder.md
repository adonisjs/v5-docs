The Database query builder is used to construct **select**, **update** and **delete** SQL queries. For inserting new rows you must use the [insert query builder]() and use [raw query builder]() for running raw SQL queries.

You can get an instance of the database query builder using one of the following methods.

```ts
import Database from '@ioc:Adonis/Lucid/Database'

Database.query()

// selecting table returns the query builder instance as well
Database.from('users')
```

## select
The `select` method allows selecting columns from the database table.

```ts
Database
  .from('users')
  .select('id', 'username', 'email')
```

You can define aliases for the columns using the `as` expression or by passing an object of key-value pair.

```ts
Database
  .from('users')
  .select('id', 'email as userEmail')
```

In the following example, the object key is the alias and value is the column real name.

:::tip
Chaining the `select` method will append to the existing set of selected columns. You can make use of `clearSelect` method to remove previously selected columns.
:::

```ts
Database
  .from('users')
  .select('id')
  .select({
    userEmail: 'email'
  })
```

Also, you can make use of sub-queries and raw-queries for generating columns at runtime. For example, selecting the last login ip address for a user from the `user_logins` table.

```ts
Database
  .from('users')
  .select(
    Database
      .from('user_logins')
      .select('ip_address')
      .whereColumn('users.id', 'user_logins.user_id')
      .orderBy('id', 'desc')
      .limit(1)
      .as('last_login_ip')
  )
```

Similar to a sub-query, you can pass an instance of the raw query as well.

```ts
Database
  .from('users')
  .select(
    Database
      .raw(`
        (select ip_address from user_logins where users.id = user_logins.user_id limit 1) as last_login_ip
      `)
  )
```

## from
The `from` method is used to define the database table for the query.

```ts
Database.from('users')
```

The query builder also allows using derived tables by passing a sub-query or a closure (which acts like a sub-query).

```ts
Database.from((subquery) => {
  subquery
    .from('user_exams')
    .sum('marks as total')
    .groupBy('user_id')
    .as('total_marks')
}).avg('total_marks.total')
```

## where
The `where` method is used to define the where clause in your SQL queries. The query builder accepts a wide range of arguments types to let you leverage SQL complete power.

```ts
Database
  .from('users')
  .where('username', 'virk')
```

You can also define SQL operators as follows:

:::tip
You can also use `luxon` date time objects. Just make sure to format them using the `toSQLDate` method.

```ts
.where('created_at', '>', DateTime.local().toSQLDate())
```
:::

```ts
return Database
  .from('users')
  .where('created_at', '>', '2020-09-09')
```

#### Wrapping where clause
You can pass a callback to the `where` method in order to wrap the where condition inside a callback. For example:

```ts
Database
  .from('users')
  .where((query) => {
    query
      .where('username', 'virk')
      .whereNull('deleted_at')
  })
  .orWhere((query) => {
    query
      .where('email', 'virk@adonisjs.com')
      .whereNull('deleted_at')
  })

/*
SELECT * FROM "users"
  WHERE (
    "username" = ? AND "deleted_at" IS NULL
  )
  or (
    "email" = ? AND "deleted_at" IS NULL
  )
*/
```

#### Using sub queries and raw queries
The `where` method value can also be a sub-query.

```ts
Database
  .from('users')
  .whereIn(
    'id',
    Database
      .from('user_logins')
      .select('user_id')
      .where('created_at', '<', '2020-09-09')
  )
```

Similarly you can also define a raw query.

```ts
Database
  .from('users')
  .whereIn(
    'id',
    Database.raw(
      '(select "user_id" from "user_logins" where "created_at" < ?)',
      ['2020-09-09']
    )
  )
```

The following variations of the `where` method follows the same API.

- `andWhere`: Alias for the `where` method
- `orWhere`: Adds an **or where** clause
- `whereNot`: Adds a **where not** clause
- `orWhereNot`: Adds an **or where not** clause
- `andWhereNot`: Alias for `whereNot`

## whereIn
The `whereIn` method is used to define the **where in** clause in your SQL queries. For example

```ts
Database
  .from('users')
  .whereIn('id', [1, 2, 3])
```

You can also pass a pair of columns and their corresponding values.

```ts
Database
  .from('users')
  .whereIn(['id', 'email'], [
    [1, 'virk@adonisjs.com']
  ])
```

Similar to the `where` method the whereIn values can also be computed using a sub-query or a raw-query.

```ts
Database
  .from('users')
  .whereIn(
    'id',
    Database
      .from('user_logins')
      .select('user_id')
      .where('created_at', '<', '2020-09-09')
  )
```

For multiple columns

```ts
Database
  .from('users')
  .whereIn(
    ['id', 'email'],
    Database
      .from('accounts')
      .select('user_id', 'email')
  )
```

You can also generate a sub-query by passing a callback as the 2nd argument.

```ts
Database
  .from('users')
  .whereIn(
    'id',
    (query) => query.from('user_logins').select('user_id')
  )
```

The following variations of the `whereIn` method follows the same API.

- `andWhereIn`: Alias for the `whereIn` method
- `orWhereIn`: Adds an **or where in** clause
- `whereNotIn`: Adds a **where not in** clause
- `orWhereNotIn`: Adds an **or where not in** clause
- `andWhereNotIn`: Alias for `whereNotIn`

## whereExists
The `whereExists` methods allows adding where constraints by checking for existence of results on a sub query. For example: Select all users who have at least logged in once.

```ts
Database
  .from('users')
  .whereExists((query) => {
    query
      .from('user_logins')
      .whereColumn('users.id', 'user_logins.user_id')
      .limit(1)
  })
```

You can also pass in a sub-query or a raw-query as the first argument.

```ts
Database
  .from('users')
  .whereExists(
    Database
      .from('user_logins')
      .whereColumn('users.id', 'user_logins.user_id')
      .limit(1)
  )
```

```ts
Database
  .from('users')
  .whereExists(
    Database.raw(
      'select * from user_logins where users.id = user_logins.user_id'
    )
  )
```

The `whereExists` method also has following variations.

- `andWhereExists`: Alias for the `whereExists` method
- `orWhereExists`: Adds an **or where exists** clause
- `whereNotExists`: Adds a **where not exists** clause
- `orWhereNotExists`: Adds an **or where not exists** clause
- `andWhereNotExists`: Alias for the `whereNotExists` method

## whereBetween
The `whereBetween` method adds the **where between** clause.

```ts
Database
  .from('users')
  .whereBetween('age', [18, 60])
```

The min and max values can be derived from other tables using sub-queries.

```ts
Database
  .from('users')
  .whereBetween('age', [
    Database.from('participation_rules').select('min_age'),
    Database.from('participation_rules').select('max_age'),
  ])
```

You can also make use of raw-queries for deriving values from other database tables.

```ts
Database
  .from('users')
  .whereBetween('age', [
    Database.raw('(select min_age from participation_rules)'),
    Database.raw('(select max_age from participation_rules)'),
  ])
```

The `whereBetween` method also has following variations.

- `andWhereBetween`: Alias for the `whereBetween` method
- `orWhereBetween`: Adds an **or where between** clause
- `whereNotBetween`: Adds a **where not between** clause
- `orWhereNotBetween`: Adds an **or where not between** clause
- `andWhereNotBetween`: Alias for the `whereNotBetween` method

## whereRaw
You can make use of the `whereRaw` method to express conditions not covered by the query builder standard API.

[warning]
Always make sure to bind parameters and do not encode user input directly in the raw query.
[/warning]


#### Encoding user values directly (Wrong)
```ts
Database
  .from('users')
  .whereRaw(`username = ${username}`)
```

#### Using bind params (Right)
```ts
Database
  .from('users')
  .whereRaw('username = ?', [username])
```

The `whereRaw` method also has following variations.

- `andWhereRaw`: Alias for the `whereRaw` method
- `orWhereRaw`: Adds an **or where raw** clause

## join
The `join` method allows to specify SQL joins between two tables. For example: Select user login `ip_address` and the `country`.

```ts
Database
  .from('users')
  .join('user_logins', 'users.id', '=', 'user_logins.user_id')
  .select('users.*')
  .select('user_logins.ip_address')
  .select('user_logins.country')
```

You can pass a callback as the 2nd argument to define more join constraints.

```ts{3-7}
Database
  .from('users')
  .join('user_logins', (query) => {
    query
      .on('users.id', '=', 'user_logins.user_id')
      .andOn('user_logins.created_at', '>', Database.ref('2020-10-09'))
  })
  .select('users.*')
  .select('user_logins.ip_address')
  .select('user_logins.country')
```

[comment title="To be added later"]

In order to group join constraints, you can pass a callback to the `on` method.

```ts{5-14}
Database
  .from('users')
  .join('user_logins', (query) => {
    query
      .on((subquery) => {
        subquery
          .on('users.id', '=', 'user_logins.user_id')
          .andOn('user_logins.created_at', '>', Database.ref('2020-10-09'))
      })
      .orOn((subquery) => {
        subquery
          .on('users.id', '=', 'user_logins.account_id')
          .andOn('user_logins.created_at', '>', Database.ref('2020-10-09'))
      })
  })
  .select('users.*')
  .select('user_logins.ip_address')
  .select('user_logins.country')

/** Output

SELECT
  "users".*,
  "user_logins"."ip_address",
  "user_logins"."country"
FROM "users"
  INNER JOIN "user_logins" ON (
    "users"."id" = "user_logins"."user_id" AND "user_logins"."created_at" > ?
  )
  or (
    "users"."id" = "user_logins"."account_id" AND "user_logins"."created_at" > ?
  )
*/
```

[/comment]

The `join` method uses the **inner join** by default. However, you can use one of the following methods to use a more suitable join for your query.

- `leftJoin`
- `leftOuterJoin`
- `rightJoin`
- `rightOuterJoin`
- `fullOuterJoin`
- `crossJoin`

## joinRaw
You can make use of the `joinRaw` method to express conditions not covered by the query builder standard API.

```ts
Database
  .from('users')
  .joinRaw('natural full join user_logins')
```

## On methods
Similar to the `where` clause, you can add the `on` clause in the join query using one of the following methods.

– `onIn`
– `onNotIn`
– `onNull`
– `onNotNull`
– `onExists`
– `onNotExists`
– `onBetween`
– `onNotBetween`

```ts
Database
  .from('users')
  .join('user_logins', (query) => {
    query.onIn('user_logins.country', ['India', 'US', 'UK'])
  })
```

```ts
Database
  .from('users')
  .join('user_logins', (query) => {
    query.onExists((subquery) => {
      subquery
        .select('*')
        .from('accounts')
        .whereRaw('users.account_id = accounts.id')
    })
  })
```

## having
The `having` method adds the **having** clause. Most of the times you will find yourself using the `havingRaw` method.

```ts{6}
Database
  .from('marks')
  .select('user_id')
  .sum('score as total_marks')
  .groupBy('user_id')
  .havingRaw('SUM(score) > ?', [200])
```

You can use one of the following methods when the having clause does not rely on an aggregate function. Otherwise, stick to `havingRaw`.

```ts
Database
  .from('marks')
  .select('user_id')
  .groupBy('user_id')
  .having('total', '>', 200)
```

Following methods have the same signature as the `where` method.

– `havingIn`
– `havingNotIn`
– `havingNull`
– `havingNotNull`
– `havingExists`
– `havingNotExists`
– `havingBetween`
– `havingNotBetween`

## distinct
The `distinct` method applies the **distinct** clause to the select statement.

```ts
Database
  .from('users')
  .distinct('country')
```

You can call the `distinct` method without any parameters to eliminate duplicate rows.

```ts
Database.from('users').distinct()
```

There is another PostgreSQL only method `distinctOn`. Here's an article explaining [SELECT DISTINCT ON](https://www.geekytidbits.com/postgres-distinct-on/).

```ts
Database
  .from('logs')
  .distinctOn('url')
  .orderBy('created_at', 'DESC')
```

## groupBy
The `groupBy` method applies the **group by** clause to the query.

```ts
Database
  .from('logs')
  .select('url')
  .groupBy('url')
```

You can also define a raw-query with `groupByRaw` method.

```ts
Database
  .from('sales')
  .select('year')
  .groupByRaw('year WITH ROLLUP')
```

## orderBy
The `orderBy` method applies the **order by** clause to the query.

```ts
Database
  .from('users')
  .orderBy('created_at', 'desc')
```

Multiple orders can be applied by calling the `orderBy` method for the multiple times.

```ts
Database
  .from('users')
  .orderBy('username', 'asc')
  .orderBy('created_at', 'desc')
```

Or pass an array of objects.

```ts
Database
  .from('users')
  .orderBy([
    {
      column: 'username',
      order: 'asc',
    },
    {
      column: 'created_at',
      order: 'desc',
    }
  ])
```

You can also pass a sub-query instance to the `orderBy` method. For example: Order posts by the number of comments they have received.

```ts
const commentsCountQuery = Database
  .from('comments')
  .count('*')
  .whereColumn('posts.id', '=', 'comments.post_id')

Database
  .from('posts')
  .orderBy(commentsCountQuery, 'desc')
```

Finally, you can make use of the `orderByRaw` method to define the order by query from a SQL string.

```ts
const commentsCountQuery = Database
  .raw(
    '(select count(*) from comments where posts.id = comments.post_id)'
  )

Database
  .from('posts')
  .orderBy(commentsCountQuery, 'desc')
```

## offset
Apply offset to the SQL query

```ts
Database.from('posts').offset(11)
```

## limit
Apply limit to the SQL query

```ts
Database.from('posts').limit(20)
```

## forPage
The `forPage` is a convinence method to apply `offset` and `limit` using the page number.

[compare]

[lhs title="Without forPage"]
```ts
const page = request.input('page', 1)
const limit = 20
const offset = page === 1 ? 0 : (page - 1) * limit

Database
  .from('posts')
  .offset(offset)
  .limit(limit)
```
[/lhs]

[rhs title="With forPage"]
```ts
Database
  .from('posts')
  .forPage(request.input('page', 1), 20)
```
[/rhs]
[/compare]

## Aggregates
The query builder supports of all the SQL aggregate methods as a first class citizen. The following examples uses the `count` aggregate, however the API remains the same for aggregate methods as well.

### count
The `count` method allows you to use the **count aggregate** in your SQL queries.

:::note
The keys for the aggregate values are dialect specific and hence we recommend you to always define aliases for predictable output.
:::

:::note
In PostgreSQL, the count returns a bigint type which will be a `String` and not a `Number`.
:::

```ts
const users = await Database
  .from('users')
  .count('* as total')

console.log(users[0].total)
```

You can also define the aggregate as follows:

```ts
const users = await Database
  .from('users')
  .count('*', 'total')

console.log(users[0].total)
```

You can count multiple columns as follows:

```ts
const users = await Database
  .from('users')
  .count({
    'active': 'is_active',
    'total': '*',
  })

console.log(users[0].total)
console.log(users[0].active)
```

Following is the list of other supported aggregate methods. The API is identical to the `count` method.

- `countDistinct`
- `min`
- `max`
- `sum`
- `sumDistinct`
- `avg`
- `avgDistinct`

## union
The `union` method allows to you build up a union query by using multiple instances of the query builder. For example:

```ts
Database
  .from('users')
  .whereNull('last_name')
  .union((query) => {
    query.from('users').whereNull('first_name')
  })

/**
SELECT * FROM "users" WHERE "last_name" IS NULL
UNION
SELECT * FROM "users" WHERE "first_name" IS NULL
*/
```

You can also wrap your union queries by passing a boolean flag as the 2nd argument.

```ts
Database
  .from('users')
  .whereNull('last_name')
  .union((query) => {
    query.from('users').whereNull('first_name')
  }, true) // 👈

/**
SELECT * FROM "users" WHERE "last_name" IS NULL
UNION
(SELECT * FROM "users" WHERE "first_name" IS NULL)
*/
```

You can pass an array of callbacks to define multiple union queries.

```ts{4-11}
Database
  .from('users')
  .whereNull('last_name')
  .union([
    (query) => {
      query.from('users').whereNull('first_name')
    },
    (query) => {
      query.from('users').whereNull('email')
    },
  ], true)

/**
SELECT * FROM "users" WHERE "last_name" IS NULL
UNION
(SELECT * FROM "users" WHERE "first_name" IS NULL)
UNION
(SELECT * FROM "users" WHERE "email" IS NULL)
*/
```

Finally, you can also pass an instance of another query builder or a raw query to the `union` method.

```ts{4-7}
Database
  .from('users')
  .whereNull('last_name')
  .union([
    Database.from('users').whereNull('first_name'),
    Database.from('users').whereNull('email')
  ], true)
```

Following methods has the same API as the `union` method.

- `unionAll`
- `intersect`

## with
The `with` method allows you to make use of CTE (Common table expression) in PostgreSQL, Oracle, SQLite3 and MSSQL databases.

```ts
Database
  .query()
  .with('aliased_table', (query) => {
    query.from('users').select('*')
  })
  .select('*')
  .from('aliased_table')

/**
WITH "aliased_table" AS (
  SELECT * FROM "users"
)
SELECT * FROM "aliased_table"
*/
```

## withRecursive
The `withRecursive` method creates a recursive CTE (Common table expression) in PostgreSQL, Oracle, SQLite3 and MSSQL databases.

In the following example, we calculate the sum of all children accounts of a parent account. Also, we assume the following table structure.

| id | name              | parent_id | amount |
|----|-------------------|-----------|--------|
|  1 | Expenses          |      NULL |   NULL |
|  2 | Car Expenses      |         1 |    100 |
|  3 | Food Expenses     |         1 |     40 |
|  4 | Earnings          |      NULL |   NULL |
|  5 | Freelance work    |         4 |    100 |
|  6 | Blog post payment |         4 |     78 |
|  7 | Car service       |         2 |     60 |

```ts
Database
  .query()
  .withRecursive('tree', (query) => {
    query
      .from('accounts')
      .select('amount', 'id')
      .where('id', 1)
      .union((subquery) => {
        subquery
          .from('accounts as a')
          .select('a.amount', 'a.id')
          .innerJoin('tree', 'tree.id', '=', 'a.parent_id')
      })
  })
  .sum('amount as total')
  .from('tree')
```

The above example is not meant to simplify the complexity of SQL. Instead, it demonstrates the power of the query builder to construct such SQL queries without writing it as a SQL string.

Here's a great article explaining the [PostgreSQL Recursive Query](https://www.postgresqltutorial.com/postgresql-recursive-query/)

## update
The `update` method allows updating one or more database rows. You can make use of the query builder to add additional constraints when performing the update.

```ts
const affectedRows = Database
  .from('users')
  .where('id', 1)
  .update({ email: 'virk@adonisjs.com' })
```

The return value is the number of affected rows. However when using `PostgreSQL`, `Orcale` or `MSSQL`, you can specify the return columns as well.

```ts
const rows = Database
  .from('users')
  .where('id', 1)
  .update(
    { email: 'virk@adonisjs.com' },
    ['id', 'email'] // columns to return
  )

console.log(rows[0].id)
console.log(rows[0].email)
```

## increment
The `increment` method allows incrementing the value for one or more columns.

```ts
Database
  .from('accounts')
  .where('id', 1)
  .increment('balance', 10)

/**
UPDATE "accounts"
SET
  "balance" = "balance" + 10
WHERE
  "id" = 1
*/
```

You can also increment multiple columns by passing an object.

```ts
Database
  .from('accounts')
  .where('id', 1)
  .increment({
    balance: 10,
    credit_limit: 5
  })

/**
UPDATE "accounts"
SET
  "balance" = "balance" + 10,
  "credit_limit" = "credit_limit" + 5
WHERE
  "id" = 1
*/
```

## decrement
The `decrement` method is opposite of the `increment` method. However, the API is same.

```ts
Database
  .from('accounts')
  .where('id', 1)
  .decrement('balance', 10)
```

## delete
The `delete` method issues a **delete** SQL query. You can make use of the query builder to add additional constraints when performing the delete.

```ts
Database
  .from('users')
  .where('id', 1)
  .delete()
```

The `delete` method also has an alias called `del`.

## paginate

## useTransaction
The `useTransaction` method instructs the query builder to wrap the query inside a transaction. The guide on [database transactions](/guides/database/transactions) covers different ways to create and use transactions in your application.

```ts
const trx = await Database.transaction()

Database
  .from('users')
  .useTransaction(trx) // 👈
  .where('id', 1)
  .update({ email: 'virk@adonisjs.com' })
```

### forUpdate
The `forUpdate` method acquires an update lock on the selected rows in PostgreSQL and MySQL.

:::note
Make sure to always supply the transaction object using the `useTransaction` method, before using `forUpdate` or similar locks.
:::

```ts
const user = Database
  .from('users')
  .where('id', 1)
  .useTransaction(trx)
  .forUpdate() // 👈
  .first()
```

### forShare
The `forShare` adds a **FOR SHARE in PostgreSQL** and a **LOCK IN SHARE MODE for MySQL** during a select statement.

```ts
const user = Database
  .from('users')
  .where('id', 1)
  .useTransaction(trx)
  .forShare() // 👈
  .first()
```

### skipLocked
The `skipLocked` method skips the rows locked by another transaction. The method is only supported by MySQL 8.0+ and PostgreSQL 9.5+.

```ts
Database
  .from('users')
  .where('id', 1)
  .forUpdate()
  .skipLocked() // 👈
  .first()

/**
SELECT * FROM "users"
WHERE "id" = 1
FOR UPDATE SKIP LOCKED
*/
```

### noWait
The `noWait` method results in a failure if any of the selected rows are locked by another transaction. The method is only supported by MySQL 8.0+ and PostgreSQL 9.5+.

```ts
Database
  .from('users')
  .where('id', 1)
  .forUpdate()
  .noWait() // 👈
  .first()

/**
SELECT * FROM "users"
WHERE "id" = 1
FOR UPDATE NOWAIT
*/
```

## clone
The `clone` method returns a new query builder object with all constraints applied from the original query.

```ts
const query = Database.from('users').select('id', 'email')
const clonedQuery = query.clone().clearSelect()

await query // select "id", "email" from "users"
await clonedQuery // select * from "users"
```

## debug
The `debug` method allows enabling or disabling debugging at an individual query level. Here's a [complete guide](/guides/database/debugging-queries/) on debugging queries.

```ts
Database
  .from('users')
  .debug(true)
```

## timeout
Define the `timeout` for the query. An exception is raised after the timeout has been exceeded.

The value of timeout is always in milliseconds.

```ts
Database
  .from('users')
  .timeout(2000)
```

You can also cancel the query when using timeouts with MySQL and PostgreSQL.

```ts
Database
  .from('users')
  .timeout(2000, { cancel: true })
```

## toSQL
The `toSQL` method returns the query SQL and bindings as an object.

```ts
const output = Database
  .from('users')
  .where('id', 1)
  .toSQL()

console.log(output)
```

The `toSQL` object also has `toNative` method to format the SQL query as per the database dialect in use.

```ts
const output = Database
  .from('users')
  .where('id', 1)
  .toSQL()
  .toNative()

console.log(output)
```

## toQuery
Returns the SQL query as a string with bindings applied to the placeholders.

```ts
const output = Database
  .from('users')
  .where('id', 1)
  .toQuery()

console.log(output)
// select * from "users" where "id" = 1
```

## Execute queries
The query builder extends the native `Promise` class. You can execute the queries using the `await` keyword or by chaining the `then/catch` methods.

Unlike native promises, the query builder is not eager in nature. It means, the query is not executed until you chain `then/catch` or make use of the `await keyword`.

```ts
Database
  .from('users')
  .then((users) => {
  })
  .catch((error) => {
  })
```

Using async/await

```ts
const users = await Database.from('users')
```

Also, you can execute a query by explicitly calling the `exec` method.

```ts
const users = await Database.from('users').exec()
```

### first
The select queries always returns an array of objects, even when the query is intended to fetch a single row. However, using the `first` method will give you first row or null (when there are no rows).

```ts
const user = await Database
  .from('users')
  .where('id', 1)
  .first()

if (user) {
  console.log(user.id)
}
```

### firstOrFail
The `firstOrFail` method is similar to the `first` method except, it raises an exception when no rows are found.

```ts
const user = await Database
  .from('users')
  .where('id', 1)
  .firstOrFail()
```

## Pagination
The query builder has first class support for offset based pagination. It also automatically counts the number of total rows by running a separate query behind the scenes.

```ts
const page = request.input('page', 1)
const limit = 20

const results = await Database
  .from('users')
  .paginate(page, limit)
```

The `paginate` method returns an instance of the [SimplePaginator](https://github.com/adonisjs/lucid/blob/efed38908680cca3b288d9b2a123586fab155b1d/src/Database/Paginator/SimplePaginator.ts#L20) class. The class has following properties and methods.

### firstPage
Returns the number for the first page. It is always `1`.

```ts
results.firstPage
```

### perPage
Returns the value for the limit passed to the `paginate` method.

```ts
results.perPage
```

### currentPage
Returns the value for the current page.

```ts
results.currentPage
```

### lastPage
Returns the value for the last page by taking the total of rows into account.

```ts
results.lastPage
```

### total
Holds the value for the total number of rows in the database.

```ts
results.total
```

### hasPages
A boolean to know if there are pages for pagination. You can rely on this value to decide when or when not to show the pagination links.

Following is an example of the edge view

```edge
@if(results.hasPages)

  {{-- Display pagination links --}}

@endif
```

### hasMorePages
A boolean to know if there are more pages to go after the current page.

```ts
results.hasMorePages
```

### all()
Returns an array of rows returned by the SQL queries.

```ts
results.all()
```

### getUrl
Returns the number for a given page number.

```ts
result.getUrl(1) // /?page=1
```

### getNextPageUrl
Returns the url for the next page

```ts
// Assuming the current page is 2

result.getNextPageUrl() // /?page=3
```

### getPreviousPageUrl
Returns the url for the previous page

```ts
// Assuming the current page is 2

result.getPreviousPageUrl() // /?page=1
```

### getUrlsForRange
Returns urls for a given range. Helpful when you want to render links for a given range.

Following is an example of the edge template

```ts
@each(link in results.getUrlsForRange(results.firstPage, results.lastPage))
  <a
    href="{{ link.url }}"
    class="{{ link.isActive ? 'active' : '' }}"
    >
    {{ link.page }}
  </a>
@endeach
```

### toJSON
The `toJSON` method returns an object with `meta` and `data` properties. The output of the method is suitable for JSON API responses.

```ts
results.toJSON()

/**
{
  meta: {
    total: 200,
    per_page: 20,
    current_page: 1,
    first_page: 1,
    last_page: 20,
    ...
  },
  data: [
    {
    }
  ]
}
*/
```

### baseUrl
All of the URLs generated by the paginator class uses the `/` (root) URL. However, you can change this defining a custom base url.

```ts
results.baseUrl('/posts')

results.getUrl(2) // /posts?page=2
```

### queryString
Define query string to be appended to the URLs generated by the paginator class.


```ts
results.queryString({ limit: 20, sort: 'top' })

results.getUrl(2) // /?page=2&limit=20&sort=top
```

## Helpful properties and methods
Following is the list of properties and methods that you may need occasionally when trying build something on top of the query builder.

### client
Reference to the instance of the underlying [database query client](/api/database/query-client).

```ts
const query = Database.query()
console.log(query.client)
```

### knexQuery
Reference to the instance of the underlying KnexJS query.

```ts
const query = Database.query()
console.log(query.knexQuery)
```

### hasAggregates
A boolean to know if query is using any of the aggregate methods.

```ts
const query = Database.from('posts').count('* as total')
console.log(query.hasAggregates) // true
```

### hasGroupBy
A boolean to know if query is using a group by clause.

```ts
const query = Database.from('posts').groupBy('tenant_id')
console.log(query.hasGroupBy) // true
```

### hasUnion
A boolean to know if query is using a union.

```ts
const query = Database
  .from('users')
  .whereNull('last_name')
  .union((query) => {
    query.from('users').whereNull('first_name')
  })

console.log(query.hasUnion) // true
```

### clearSelect
Call this method to clear selected columns.

```ts
const query = Database.query().select('id', 'title')
query.clone().clearSelect()
```

### clearWhere
Call this method to clear where clauses.

```ts
const query = Database.query().where('id', 1)
query.clone().clearWhere()
```

### clearOrder
Call this method to clear the order by constraint.

```ts
const query = Database.query().orderBy('id', 'desc')
query.clone().clearOrder()
```

### clearHaving
Call this method to clear the having clause.

```ts
const query = Database.query().having('total', '>', 100)
query.clone().clearHaving()
```

### clearLimit
Call this method to clear the applied limit.

```ts
const query = Database.query().limit(20)
query.clone().clearLimit()
```

### clearOffset
Call this method to clear the applied offset.

```ts
const query = Database.query().offset(20)
query.clone().clearOffset()
```

### reporterData
The query builder emits the `db:query` event and also reports the queries execution time with the framework profiler.

Using the `reporterData` method, you can pass additional details to the event and the profiler.

```ts
const query = Database.from('users')

await query
  .reporterData({ userId: auth.user.id })
  .select('*')
```

Now within the `db:query` event, you can access the value of `userId` as follows.

```ts
Event.on('db:query', (query) => {
  console.log(query.userId)
})
```
