---
summary: Database query builder API reference
---

The Database query builder is used to construct **SELECT**, **UPDATE**, and **DELETE** SQL queries. For inserting new rows you must use the [insert query builder](./insert-query-builder.md) and use [raw query builder](./raw-query-builder.md) for running raw SQL queries.

You can get an instance of the database query builder using one of the following methods.

```ts
import Database from '@ioc:Adonis/Lucid/Database'

Database.query()

// selecting table returns the query builder instance as well
Database.from('users')
```

## Methods/properties
Following is the list of available methods/properties available on the Query builder instance.

### select
The `select` method allows selecting columns from the database table. You can either pass an array of columns or pass them as multiple arguments.

```ts
Database
  .from('users')
  .select('id', 'username', 'email')
```

#### Column aliases

You can define aliases for the columns using the `as` expression or passing an object of key-value pair.

```ts
Database
  .from('users')
  .select('id', 'email as userEmail')
```

```ts
Database
  .from('users')
  .select({
    id: 'id',

    // Key is alias name
    userEmail: 'email'
  })
```

#### Using sub queries

Also, you can make use of sub-queries and raw-queries for generating columns at runtime, for example, selecting the last login IP address for a user from the `user_logins` table.

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
      .as('last_login_ip') // 👈 This is important
  )
```

#### Using raw queries

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

---

### from
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

---

### where
The `where` method is used to define the where clause in your SQL queries. The query builder accepts a wide range of arguments types to let you leverage the complete power of SQL.

The following example accepts the column name as the first argument and its value as the second argument.

```ts
Database
  .from('users')
  .where('username', 'virk')
```

You can also define SQL operators, as shown below.

```ts
Database
  .from('users')
  .where('created_at', '>', '2020-09-09')
```

```ts
// Using luxon to make the date
Database
  .from('users')
  .where('created_at', '>', DateTime.local().toSQLDate())
```

```ts
// Using like operator
Database
  .from('posts')
  .where('title', 'like', '%Adonis 101%')
```

#### Where groups
You can create `where` groups by passing a callback to the `where` method. For example:

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
```

Generated SQL

```sql
SELECT * FROM "users"
  WHERE (
    "username" = ? AND "deleted_at" IS NULL
  )
  or (
    "email" = ? AND "deleted_at" IS NULL
  )
```

#### Using sub queries
The `where` method value can also be a sub-query.

```ts
Database
  .from('user_groups')
  .where(
    'user_id',
    Database
      .from('users')
      .select('user_id')
      .where('users.user_id', 1)
  )
```

#### Using raw queries
Similarly, you can also define a raw query.

```ts
Database
  .from('user_groups')
  .where(
    'user_id',
    Database
      .raw(`select "user_id" from "users" where "users"."user_id" = ?`, [1])
      .wrap('(', ')')
  )
```

---

### where method variants
Following is the list of the `where` method variations and shares the same API.

| Method | Description |
|--------|-------------|
| `andWhere` | Alias for the `where` method |
| `orWhere` | Adds an **or where** clause |
| `whereNot` | Adds a **where not** clause |
| `orWhereNot` | Adds an **or where not** clause |
| `andWhereNot` | Alias for `whereNot` |

### whereColumn
The `whereColumn` method allows you to define a column as the value for the where clause. The method is usually helpful with queries and joins. For example:

```ts
Database
  .from('users')
  .whereColumn('updated_at', '>', 'created_at')
```

```ts
Database
  .from('users')
  .select(
    Database
      .from('user_logins')
      .select('ip_address')
      .whereColumn('users.id', 'user_logins.user_id') // 👈
      .orderBy('id', 'desc')
      .limit(1)
      .as('last_login_ip')
  )
```

### whereColumn method variants
Following is the list of the `whereColumn` method variations and shares the same API.


| Method | Description |
|--------|-------------|
| `andWhereColumn` | Alias for the `whereColumn` method |
| `orWhereColumn` | Adds an **or where** clause |
| `whereNotColumn` | Adds a **where not** clause |
| `orWhereNotColumn` | Adds an **or where not** clause |
| `andWhereNotColumn` | Alias for `whereNotColumn` |

### whereLike
Adds a where clause with case-sensitive substring comparison on a given column with a given value.

```ts
Database
  .from('posts')
  .whereLike('title', '%Adonis 101%')
```

### whereILike
Adds a where clause with case-insensitive substring comparison on a given column with a given value. The method generates a slightly different for each dialect to achieve the case insensitive comparison.

```ts
Database
  .from('posts')
  .whereILike('title', '%Adonis 101%')
```

### whereIn
The `whereIn` method is used to define the **wherein** SQL clause. The method accepts the column name as the first argument and an array of values as the second argument.

```ts
Database
  .from('users')
  .whereIn('id', [1, 2, 3])
```

The values can also be defined for more than column. For example:

```ts
Database
  .from('users')
  .whereIn(['id', 'email'], [
    [1, 'virk@adonisjs.com']
  ])

// SQL: select * from "users" where ("id", "email") in ((?, ?))
```

#### Using sub queries
You can also compute the `whereIn` values using a subquery.

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

The `whereIn` method also accepts a callback as the 2nd argument. The callback receives an instance of the subquery that you can use to compute values as runtime.

```ts
Database
  .from('users')
  .whereIn(
    'id',
    (query) => query.from('user_logins').select('user_id')
  )
```

---

### whereIn method variants
Following is the list of the `whereIn` method variations and shares the same API.

| Method | Description |
|--------|-------------|
| `andWhereIn` | Alias for the `whereIn` method |
| `orWhereIn` | Adds an **or where in** clause |
| `whereNotIn` | Adds a **where not in** clause |
| `orWhereNotIn` | Adds an **or where not in** clause |
| `andWhereNotIn` | Alias for `whereNotIn` |

### whereNull
The `whereNull` method adds a where null clause to the query.

```ts
Database
  .from('users')
  .whereNull('deleted_at')
```

### whereNull method variants
Following is the list of the `whereNull` method variations and shares the same API.

| Method | Description |
|--------|-------------|
| `andWhereNull` | Alias for the `whereNull` method |
| `orWhereNull` | Adds an **or where null** clause |
| `whereNotNull` | Adds a **where not null** clause |
| `orWhereNotNull` | Adds an **or where not null** clause |
| `andWhereNotNull` | Alias for `whereNotNull` |

### whereExists
The `whereExists` method allows adding where constraints by checking for the existence of results on a subquery. For example: Select all users who have at least logged in once.

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

You can also pass in a sub-query or a raw query as the first argument.

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

---

### whereExists method variants

Following is the list of the `whereExists` method variations and shares the same API.

| Method | Description |
|--------|-------------|
| `andWhereExists` |  Alias for the `whereExists` method | 
| `orWhereExists` |  Adds an **or where exists** clause | 
| `whereNotExists` |  Adds a **where not exists** clause | 
| `orWhereNotExists` |  Adds an **or where not exists** clause | 
| `andWhereNotExists` |  Alias for the `whereNotExists` method | 

### whereBetween
The `whereBetween` method adds the **where between** clause. It accepts the column name as the first argument and an array of values as the second argument.

```ts
Database
  .from('users')
  .whereBetween('age', [18, 60])
```


#### Using sub queries
You can also use subqueries to derive the values from a different database table.

```ts
Database
  .from('users')
  .whereBetween('age', [
    Database.from('participation_rules').select('min_age'),
    Database.from('participation_rules').select('max_age'),
  ])
```

#### Using raw queries

You can also make use of raw queries for deriving values from another database table.

```ts
Database
  .from('users')
  .whereBetween('age', [
    Database.raw('(select min_age from participation_rules)'),
    Database.raw('(select max_age from participation_rules)'),
  ])
```

### whereBetween method variants
Following is the list of the `whereBetween` method variations and shares the same API.

| Method | Description |
|--------|-------------|
| `andWhereBetween` | Alias for the `whereBetween` method |
| `orWhereBetween` | Adds an **or where between** clause |
| `whereNotBetween` | Adds a **where not between** clause |
| `orWhereNotBetween` | Adds an **or where not between** clause |
| `andWhereNotBetween` | Alias for the `whereNotBetween` method |

### whereRaw
You can use the `whereRaw` method to express conditions not covered by the existing query builder methods.

:::warning

Always make sure to bind parameters and do not encode user input directly in the raw query.

:::


#### ❌ Encoding user values directly
```ts
Database
  .from('users')
  .whereRaw(`username = ${username}`)
```

#### ✅ Using bind params
```ts
Database
  .from('users')
  .whereRaw('username = ?', [username])
```

You can also define the column names dynamically using `??`.

```ts
Database
  .from('users')
  .whereRaw('?? = ?', ['users.username', username])
```

### whereRaw method variants
Following is the list of the `whereRaw` method variations and shares the same API.

| Method | Description |
|--------|-------------|
| `andWhereRaw` | Alias for the `whereRaw` method |
| `orWhereRaw` | Adds an **or where raw** clause |

### whereJson
Add a where clause with an object to match the value of a JSON column inside the database.

```ts
Database
  .from('users')
  .whereJson('address', { city: 'XYZ', pincode: '110001' })
```

The column value can also be computed using a sub-query.

```ts
Database
  .from('users')
  .whereJson(
    'address',
    Database
      .select('address')
      .from('user_address')
      .where('address.user_id', 1)
  )
```

### whereJson method variants
Following is the list of the `whereJson` method variations and shares the same API.

| Method | Description |
|--------|-------------|
| `orWhereJson` | Add a **or where** clause matching the value of a JSON column |
| `andWhereJson` | Alias for `whereJson` |
| `whereNotJson` | Add a **where not** clause against a JSON column |
| `orWhereNotJson` | Add a **or where not** clause against a JSON column |
| `andWhereNotJson` | Alias for `whereNotJson` |

### whereJsonSuperset
Add a clause where the value of the JSON column is the superset of the defined object. In the following example, the user address is stored as JSON and we find by the user by their pincode.

```ts
Database
  .from('users')
  .whereJsonSuperset('address', { pincode: '110001' })
```

### whereJsonSuperset method variants
Following is the list of the `whereJsonSuperset` method variations and shares the same API.

| Method | Description |
|--------|-------------|
| `orWhereJsonSuperset` | Add a **or where** clause matching the value of a JSON column |
| `andWhereJsonSuperset` | Alias for `whereJsonSuperset` |
| `whereNotJsonSuperset` | Add a **where not** clause against a JSON column |
| `orWhereNotJsonSuperset` | Add a **or where not** clause against a JSON column |
| `andWhereNotJsonSuperset` | Alias for `whereNotJsonSuperset` |

### whereJsonSubset
Add a clause where the value of the JSON column is the subset of the defined object. In the following example, the user address is stored as JSON and we find by the user by their pincode or the city name.

```ts
Database
  .from('users')
  .whereJsonSubset('address', { pincode: '110001', city: 'XYZ' })
```

### whereJsonSubset method variants
Following is the list of the `whereJsonSubset` method variations and shares the same API.

| Method | Description |
|--------|-------------|
| `orWhereJsonSubset` | Add a **or where** clause matching the value of a JSON column |
| `andWhereJsonSubset` | Alias for `whereJsonSubset` |
| `whereNotJsonSubset` | Add a **where not** clause against a JSON column |
| `orWhereNotJsonSubset` | Add a **or where not** clause against a JSON column |
| `andWhereNotJsonSubset` | Alias for `whereNotJsonSubset` |

### join
The `join` method allows specifying SQL joins between two tables. For example: Select the `ip_address` and the `country` columns by joining the `user_logins` table.

```ts
Database
  .from('users')
  .join('user_logins', 'users.id', '=', 'user_logins.user_id')
  .select('users.*')
  .select('user_logins.ip_address')
  .select('user_logins.country')
```

You can pass a callback as the 2nd argument to define more join constraints.

```ts
Database
  .from('users')
  // highlight-start
  .join('user_logins', (query) => {
    query
      .on('users.id', '=', 'user_logins.user_id')
      .andOnVal('user_logins.created_at', '>', '2020-10-09')
  })
  // highlight-end
  .select('users.*')
  .select('user_logins.ip_address')
  .select('user_logins.country')
```

To group join constraints, you can pass a callback to the `on` method.

```ts
Database
  .from('users')
  .join('user_logins', (query) => {
    query
      // highlight-start
      .on((subquery) => {
        subquery
          .on('users.id', '=', 'user_logins.user_id')
          .andOnVal('user_logins.created_at', '>', '2020-10-09')
      })
      .orOn((subquery) => {
        subquery
          .on('users.id', '=', 'user_logins.account_id')
          .andOnVal('user_logins.created_at', '>', '2020-10-09')
      })
      // highlight-end
  })
  .select('users.*')
  .select('user_logins.ip_address')
  .select('user_logins.country')
```

Output SQL

```sql
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
```

The `join` method uses the **inner join** by default, and you can use a different join using one of the following available methods.

- `leftJoin`
- `leftOuterJoin`
- `rightJoin`
- `rightOuterJoin`
- `fullOuterJoin`
- `crossJoin`

---

### joinRaw
You can use the `joinRaw` method to express conditions not covered by the query builder standard API.

```ts
Database
  .from('users')
  .joinRaw('natural full join user_logins')
```

---

### On methods
Following is the list of available `on` methods you can use with a **join query**.

#### onIn

```ts
Database
  .from('users')
  .join('user_logins', (query) => {
    query.onIn('user_logins.country', ['India', 'US', 'UK'])
  })
```

#### onNotIn

```ts
Database
  .from('users')
  .join('user_logins', (query) => {
    query.onNotIn('user_logins.country', ['India', 'US', 'UK'])
  })
```

#### onNull

```ts
Database
  .from('users')
  .join('user_logins', (query) => {
    query.onNull('user_logins.ip_address')
  })
```

#### onNotNull

```ts
Database
  .from('users')
  .join('user_logins', (query) => {
    query.onNotNull('user_logins.ip_address')
  })
```

#### onExists

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

#### onNotExists

```ts
Database
  .from('users')
  .join('user_logins', (query) => {
    query.onNotExists((subquery) => {
      subquery
        .select('*')
        .from('accounts')
        .whereRaw('users.account_id = accounts.id')
    })
  })
```

#### onBetween

```ts
Database
  .from('users')
  .join('user_logins', (query) => {
    query.onBetween('user_logins.login_date', ['2020-10-01', '2020-12-31'])
  })
```

#### onNotBetween

```ts
Database
  .from('users')
  .join('user_logins', (query) => {
    query.onNotBetween('user_logins.login_date', ['2020-10-01', '2020-12-31'])
  })
```

---

### having

The `having` method adds the **having** clause. It accepts the column name as the first argument, followed by the optional operator and the value.

```ts
Database
  .from('exams')
  .select('user_id')
  .groupBy('user_id')
  .having('score', '>', 80)
```

### havingRaw
Most of the time, you will find yourself using the `havingRaw` method, as you can define the aggregates for the having clause.

```ts
Database
  .from('exams')
  .select('user_id')
  .groupBy('user_id')
  .havingRaw('SUM(score) > ?', [200])
```

---

### having method variants 

Following is the list of all the available **having methods**.

| Method | Description |
|--------|-------------|
| `havingIn` | Adds a having in clause to the query. It accepts an array of values. |
| `havingNotIn` | Adds a having not in clause to the query. It accepts an array of values. |
| `havingNull` |  Adds a having null clause to the query. |
| `havingNotNull` | Adds a having not null clause to the query. |
| `havingExists` | Adds a having exists clause to the query. |
| `havingNotExists` | Adds a having not exists clause to the query. |
| `havingBetween` | Adds a having between clause to the query. It accepts an array of values. |
| `havingNotBetween` | Adds a having not between clause to the query. It accepts an array of values |

### distinct
The `distinct` method applies the **distinct** clause to the select statement. You can define one or more column names as multiple arguments.

```ts
Database
  .from('users')
  .distinct('country')

Database
  .from('users')
  .distinct('country', 'locale')
```

You can call the `distinct` method without any parameters to eliminate duplicate rows.

```ts
Database.from('users').distinct()
```

There is another PostgreSQL-only method, `distinctOn`. Here's an article explaining [SELECT DISTINCT ON](https://www.geekytidbits.com/postgres-distinct-on/).

```ts
Database
  .from('logs')
  .distinctOn('url')
  .orderBy('created_at', 'DESC')
```

---

### groupBy
The `groupBy` method applies the **group by** clause to the query.

```ts
Database
  .from('logs')
  .select('url')
  .groupBy('url')
```

---

### groupByRaw
The `groupByRaw` method allows writing a SQL query to define the group by statement.

```ts
Database
  .from('sales')
  .select('year')
  .groupByRaw('year WITH ROLLUP')
```

---

### orderBy
The `orderBy` method applies the **order by** clause to the query.

```ts
Database
  .from('users')
  .orderBy('created_at', 'desc')
```

You can sort by multiple columns by calling the `orderBy` method multiple times.

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

#### Using sub queries

You can also pass a sub-query instance to the `orderBy` method — for example, Order posts by the number of comments they have received.

```ts
const commentsCountQuery = Database
  .from('comments')
  .count('*')
  .whereColumn('posts.id', '=', 'comments.post_id')

Database
  .from('posts')
  .orderBy(commentsCountQuery, 'desc')
```

---

### orderByRaw
Use the `orderByRaw` method to define the sort order from a SQL string.

```ts
const commentsCountQuery = Database
  .raw(
    'select count(*) from comments where posts.id = comments.post_id'
  )
  .wrap('(', ')')

Database
  .from('posts')
  .orderBy(commentsCountQuery, 'desc')
```

---

### offset
Apply offset to the SQL query

```ts
Database.from('posts').offset(11)
```

---

### limit
Apply a limit to the SQL query

```ts
Database.from('posts').limit(20)
```

---

### forPage
The `forPage` is a convenient method to apply `offset` and `limit` using the page number. It accepts a total of two arguments.

- The first argument is the page number **(not the offset)**.
- The second argument is the number of rows to fetch. Defaults to 20

```ts
Database
  .from('posts')
  .forPage(request.input('page', 1), 20)
```

### count
The `count` method allows you to use the **count aggregate** in your SQL queries.

:::note

The keys for the aggregate values are dialect-specific, and hence we recommend you always define aliases for predictable output.

:::

:::note

In PostgreSQL, the count method returns a string representation of a bigint data type.
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

---

### Other aggregate methods
The API for all the following aggregate methods is identical to the `count` method.

| Method | Description |
|--------|-------------|
| `countDistinct` | Count only the distinct rows |
| `min` | Aggregate values using the **min function** |
| `max` | Aggregate values using the **max function** |
| `sum` | Aggregate values using the **sum function** |
| `sumDistinct` | Aggregate values for only distinct rows using the **sum function** |
| `avg` | Aggregate values using the **avg function** |
| `avgDistinct` | Aggregate values for only distinct rows using the **avg function** |

### union
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

```ts
Database
  .from('users')
  .whereNull('last_name')
  // highlight-start
  .union([
    (query) => {
      query.from('users').whereNull('first_name')
    },
    (query) => {
      query.from('users').whereNull('email')
    },
  ], true)
  // highlight-end

// highlight-start
/**
SELECT * FROM "users" WHERE "last_name" IS NULL
UNION
(SELECT * FROM "users" WHERE "first_name" IS NULL)
UNION
(SELECT * FROM "users" WHERE "email" IS NULL)
*/
// highlight-end
```

#### Using sub queries
You can also define union queries by passing an instance of a query builder.

```ts
Database
  .from('users')
  .whereNull('last_name')
  // highlight-start
  .union([
    Database.from('users').whereNull('first_name'),
    Database.from('users').whereNull('email')
  ], true)
  // highlight-end
```

The following methods have the same API as the `union` method.

- `unionAll`
- `intersect`

---

### with
The `with` method allows you to use CTE (Common table expression) in **PostgreSQL**, **Oracle**, **SQLite3** and the **MSSQL** databases.

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

The method also accepts an optional third parameter which is an array of column names. The number of column names specified must match the number of columns in the result set of the CTE query.

```ts
Database
  .query()
  .with('aliased_table', (query) => {
    query.from('users').select('id', 'email')
  }, ['id', 'email'])
  .select('*')
  .from('aliased_table')

/**
WITH "aliased_table" (id, email) AS (
  SELECT * FROM "users"
)
SELECT * FROM "aliased_table"
*/
```

---

### withMaterialized/withNotMaterialized
The `withMaterialized` and the `withNotMaterialized` methods allows you to use CTE (Common table expression) as materialized views in **PostgreSQL** and **SQLite3** database.

```ts
Database
  .query()
  .withMaterialized('aliased_table', (query) => {
    query.from('users').select('*')
  })
  .select('*')
  .from('aliased_table')

/**
WITH "aliased_table" AS MATERIALIZED (
  SELECT * FROM "users"
)
SELECT * FROM "aliased_table"
*/
```

---

### withRecursive
The `withRecursive` method creates a recursive CTE (Common table expression) in **PostgreSQL**, **Oracle**, **SQLite3** and the **MSSQL** databases.

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

The above example is not meant to simplify the complexity of SQL. Instead, it demonstrates the power of the query builder to construct such SQL queries without writing them as a SQL string.

The method also accepts an optional third parameter which is an array of column names. The number of column names specified must match the number of columns in the result set of the CTE query.

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
  }, ['amount', 'id'])
  .sum('amount as total')
  .from('tree')
```

Here's a great article explaining the [PostgreSQL Recursive Query](https://www.postgresqltutorial.com/postgresql-recursive-query/)

---

### update
The `update` method allows updating one or more database rows. You can make use of the query builder to add additional constraints when performing the update.

```ts
const affectedRows = Database
  .from('users')
  .where('id', 1)
  .update({ email: 'virk@adonisjs.com' })
```

The return value is the number of affected rows. However, when using `PostgreSQL`, `Oracle`, or `MSSQL`, you can specify the return columns as well.

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

---

### increment
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

---

### decrement
The `decrement` method is the opposite of the `increment` method. However, the API is the same.

```ts
Database
  .from('accounts')
  .where('id', 1)
  .decrement('balance', 10)
```

---

### delete
The `delete` method issues a **delete** SQL query. You can make use of the query builder to add additional constraints when performing the delete.

```ts
Database
  .from('users')
  .where('id', 1)
  .delete()
```

The `delete` method also has an alias called `del`.

---

### useTransaction
The `useTransaction` method instructs the query builder to wrap the query inside a transaction. The guide on [database transactions](../../guides/database/transactions.md) covers different ways to create and use transactions in your application.

```ts
const trx = await Database.transaction()

Database
  .from('users')
  .useTransaction(trx) // 👈
  .where('id', 1)
  .update({ email: 'virk@adonisjs.com' })

await trx.commit()
```

---

### forUpdate
The `forUpdate` method acquires an update lock on the selected rows in PostgreSQL and MySQL.

:::note
Make sure always to supply the transaction object using the `useTransaction` method before using `forUpdate` or similar locks.
:::

```ts
const user = Database
  .from('users')
  .where('id', 1)
  .useTransaction(trx)
  .forUpdate() // 👈
  .first()
```

---

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

---

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

---

### noWait
The `noWait` method fails if any of the selected rows are locked by another transaction. The method is only supported by MySQL 8.0+ and PostgreSQL 9.5+.

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

---

### clone
The `clone` method returns a new query builder object with all constraints applied from the original query.

```ts
const query = Database.from('users').select('id', 'email')
const clonedQuery = query.clone().clearSelect()

await query // select "id", "email" from "users"
await clonedQuery // select * from "users"
```

---

### debug
The `debug` method allows enabling or disabling debugging at an individual query level. Here's a [complete guide](../../guides/database/debugging.md) on debugging queries.

```ts
Database
  .from('users')
  .debug(true)
```

---

### timeout
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

---

### toSQL
The `toSQL` method returns the query SQL and bindings as an object.

```ts
const output = Database
  .from('users')
  .where('id', 1)
  .toSQL()

console.log(output)
```

The `toSQL` object also has the `toNative` method to format the SQL query as per the database dialect in use.

```ts
const output = Database
  .from('users')
  .where('id', 1)
  .toSQL()
  .toNative()

console.log(output)
```

---

### toQuery
Returns the SQL query after applying the bind params.

```ts
const output = Database
  .from('users')
  .where('id', 1)
  .toQuery()

console.log(output)
// select * from "users" where "id" = 1
```

## Executing queries
The query builder extends the native `Promise` class. You can execute the queries using the `await` keyword or chaining the `then/catch` methods.

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

---

### first
The select queries always return an array of objects, even when the query is intended to fetch a single row. However, using the `first` method will give you the first row or null (when there are no rows).

:::note

First does NOT mean the first row in the table. It means the first row from the results array in whatever order you fetched it from the database.

:::

```ts
const user = await Database
  .from('users')
  .where('id', 1)
  .first()

if (user) {
  console.log(user.id)
}
```

---

### firstOrFail
The `firstOrFail` method is similar to the `first` method except, it raises an exception when no rows are found.

```ts
const user = await Database
  .from('users')
  .where('id', 1)
  .firstOrFail()
```

## Pagination
The query builder has first-class support for offset-based pagination. It also automatically counts the number of total rows by running a separate query behind the scenes.

```ts
const page = request.input('page', 1)
const limit = 20

const results = await Database
  .from('users')
  .paginate(page, limit)
```

The `paginate` method returns an instance of the [SimplePaginator](https://github.com/adonisjs/lucid/blob/efed38908680cca3b288d9b2a123586fab155b1d/src/Database/Paginator/SimplePaginator.ts#L20) class. The class has the following properties and methods.

### firstPage
Returns the number for the first page. It is always `1`.

```ts
results.firstPage
```

---

### perPage
Returns the value for the limit passed to the `paginate` method.

```ts
results.perPage
```

---

### currentPage
Returns the value of the current page.

```ts
results.currentPage
```

---

### lastPage
Returns the value for the last page by taking the total of rows into account.

```ts
results.lastPage
```

---

### total
Holds the value for the total number of rows in the database.

```ts
results.total
```

---

### hasPages
A boolean to know if there are pages for pagination. You can rely on this value to decide when or when not to show the pagination links.

Following is an example of the Edge view.

```edge
@if(results.hasPages)

  {{-- Display pagination links --}}

@endif
```

---

### hasMorePages
A boolean to know if there are more pages to go after the current page.

```ts
results.hasMorePages
```

---

### all()
Returns an array of rows returned by the SQL queries.

```ts
results.all()
```

---

### getUrl
Returns the URL for a given page number.

```ts
result.getUrl(1) // /?page=1
```

---

### getNextPageUrl
Returns the URL for the next page

```ts
// Assuming the current page is 2

result.getNextPageUrl() // /?page=3
```

---

### getPreviousPageUrl
Returns the URL for the previous page

```ts
// Assuming the current page is 2

result.getPreviousPageUrl() // /?page=1
```

---

### getUrlsForRange
Returns URLs for a given range. Helpful when you want to render links for a given range.

Following is an example of using `getUrlsForRange` inside an Edge template.

```edge
@each(
  link in results.getUrlsForRange(results.firstPage, results.lastPage)
)
  <a
    href="{{ link.url }}"
    class="{{ link.isActive ? 'active' : '' }}"
  >
    {{ link.page }}
  </a>
@endeach
```

---

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

---

### baseUrl
All of the URLs generated by the paginator class use the `/` (root) URL. However, you can change this by defining a custom base URL.

```ts
results.baseUrl('/posts')

results.getUrl(2) // /posts?page=2
```

---

### queryString
Define query string to be appended to the URLs generated by the paginator class.


```ts
results.queryString({ limit: 20, sort: 'top' })

results.getUrl(2) // /?page=2&limit=20&sort=top
```

## Helpful properties and methods
Following is the list of properties and methods you may occasionally need when building something on top of the query builder.

### client
Reference to the instance of the underlying [database query client](./query-client.md).

```ts
const query = Database.query()
console.log(query.client)
```

---

### knexQuery
Reference to the instance of the underlying KnexJS query.

```ts
const query = Database.query()
console.log(query.knexQuery)
```

---

### hasAggregates
A boolean to know if the query is using any of the aggregate methods.

```ts
const query = Database.from('posts').count('* as total')
console.log(query.hasAggregates) // true
```

---

### hasGroupBy
A boolean to know if the query is using a group by clause.

```ts
const query = Database.from('posts').groupBy('tenant_id')
console.log(query.hasGroupBy) // true
```

---

### hasUnion
A boolean to know if the query is using a union.

```ts
const query = Database
  .from('users')
  .whereNull('last_name')
  .union((query) => {
    query.from('users').whereNull('first_name')
  })

console.log(query.hasUnion) // true
```

---

### clearSelect
Call this method to clear selected columns.

```ts
const query = Database.query().select('id', 'title')
query.clone().clearSelect()
```

---

### clearWhere
Call this method to clear where clauses.

```ts
const query = Database.query().where('id', 1)
query.clone().clearWhere()
```

---

### clearOrder
Call this method to clear the order by constraint.

```ts
const query = Database.query().orderBy('id', 'desc')
query.clone().clearOrder()
```

---

### clearHaving
Call this method to clear the having clause.

```ts
const query = Database.query().having('total', '>', 100)
query.clone().clearHaving()
```

---

### clearLimit
Call this method to clear the applied limit.

```ts
const query = Database.query().limit(20)
query.clone().clearLimit()
```

---

### clearOffset
Call this method to clear the applied offset.

```ts
const query = Database.query().offset(20)
query.clone().clearOffset()
```

---

### reporterData
The query builder emits the `db:query` event and reports the query's execution time with the framework profiler.

Using the `reporterData` method, you can pass additional details to the event and the profiler.

```ts
const query = Database.from('users')

await query
  .reporterData({ userId: auth.user.id })
  .select('*')
```

Within the `db:query` event, you can access the value of `userId` as follows.

```ts
Event.on('db:query', (query) => {
  console.log(query.userId)
})
```

---

### withSchema
Specify the PostgreSQL schema to use when executing the query.

```ts
Database
  .from('users')
  .withSchema('public')
  .select('*')
```

---

### as
Specify the alias for a given query. Usually helpful when passing the query builder instance as a subquery. For example:

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
      .as('last_login_ip') // 👈 Query alias
  )
```

---

### if

The `if` helper allows you to conditionally add constraints to the query builder. For example:

```ts
Database
  .from('users')
  .if(searchQuery, (query) => {
    query.where('first_name', 'like', `%${searchQuery}%`)
    query.where('last_name', 'like', `%${searchQuery}%`)
  })
``` 

You can define the `else` method by passing another callback as the second argument.

```ts
Database
  .from('users')
  .if(
    condition,
    (query) => {}, // if condition met
    (query) => {}, // otherwise execute this
  )
```

---

### unless
The `unless` method is opposite of the `if` helper.

```ts
Database
  .from('projects')
  .unless(filters.status, () => {
    /**
     * Fetch projects with "active" status when
     * not status is defined in filters
     */
    query.where('status', 'active')
  })
``` 

You can pass another callback which gets executed when the `unless` statement isn't true.

```ts
Database
  .from('users')
  .unless(
    condition,
    (query) => {}, // if condition met
    (query) => {}, // otherwise execute this
  )
```

---

### match
The `match` helper allows you define an array of conditional blocks to match from and execute the corresponding callback.

In the following example, the query builder will go through all the conditional blocks and executes the first matching one and discards the other. **Think of it as a `switch` statement in JavaScript**.

```ts
Database
  .query()
  .match(
    [
      // Run this is user is a super user
      auth.isSuperUser, (query) => query.whereIn('status', ['published', 'draft'])
    ],
    [
      // Run this is user is loggedin
      auth.user, (query) => query.where('user_id', auth.user.id)
    ],
    // Otherwise run this
    (query) => query.where('status', 'published').where('is_public', true)
  )
```

---

### ifDialect
The `ifDialect` helper allows you to conditionally add constraints to the query builder when dialect matches one of the mentioned dialects.

```ts
Database
  .from('users')
  .query()
  .ifDialect('postgres', (query) => {
      query.whereJson('address', { city: 'XYZ', pincode: '110001' })
    }, 
  )
```

You can define the else method by passing another callback as the second argument.
```ts
Database
  .from('users')
  .ifDialect('postgres',
    (query) => {}, // if dialect is postgres
    (query) => {}, // otherwise execute this
  )
```

---

### unlessDialect
The `unlessDialect` method is opposite of the `ifDialect` helper.

```ts
Database
  .from('users')
  .unlessDialect('postgres', (query) => {
      query.whereJson('address', { city: 'XYZ', pincode: '110001' })
    } 
  )
```

You can pass another callback which gets executed when the `unlessDialect` statement isn't true.
```ts
Database
  .from('users')
  .query()
  .unlessDialect('postgres',
    (query) => {}, // if dialect is anything other than postgres
    (query) => {}  // otherwise execute this
  )
```
