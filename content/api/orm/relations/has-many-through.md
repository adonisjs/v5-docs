---
summary: API documentation for Lucid has many through relationship
---

The [HasManyThrough relationship class](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/HasManyThrough/index.ts) manages you to define a has many relationship via an intermediate model. A great example of this is, **"a country has many posts via users"**.

You will not find yourself directly working with this class. However, an instance of the class can be accessed using the `Model.$getRelation` method.

```ts
import {
  BaseModel,
  hasManyThrough,
  HasManyThrough,
} from '@ioc:Adonis/Lucid/Orm'

import Post from 'App/Models/Post'
import User from 'App/Models/User'

class Country extends BaseModel {
  @hasManyThrough([() => Post, () => User])
  public posts: HasManyThrough<typeof Post>
}
```

```ts
Country.$getRelation('posts').relationName
Country.$getRelation('posts').type
Country.$getRelation('posts').relatedModel()
```

## Methods/Properties
Following is the list of methods and properties available on the `HasManyThrough` relationship.

### type
The type of the relationship. The value is always set to `hasManyThrough`.

```ts
class Country extends BaseModel {
  @hasManyThrough([() => Post, () => User])
  public posts: HasManyThrough<typeof Post>
}

Country.$getRelation('posts').type // 'hasManyThrough'
```

---

### relationName
The relationship name. It is a property name defined on the parent model.

```ts
class Country extends BaseModel {
  @hasManyThrough([() => Post, () => User])
  public posts: HasManyThrough<typeof Post>
}

Country.$getRelation('posts').relationName // 'posts'
```

---

### serializeAs
The name to be used for serializing the relationship. You can define it using the decorator options.

```ts
class Country extends BaseModel {
  @hasManyThrough([() => Post, () => User], {
    serializeAs: 'articles'
  })
  public posts: HasManyThrough<typeof Post>
}
```

---

### booted
Find if the relationship has been booted. If not, call the `boot` method.

---

### boot
Boot the relationship. Lucid models public APIs call this method internally, and you never have to boot the relationship manually.

---

### model
Reference to the parent model (the one that defines the relationship).

```ts
class Country extends BaseModel {
  @hasManyThrough([() => Post, () => User])
  public posts: HasManyThrough<typeof Post>
}

Country.$getRelation('posts').model // Country
```

---

### relatedModel
Reference to the relationship model. The property value is a function that returns the related model.

```ts
class Country extends BaseModel {
  @hasManyThrough([() => Post, () => User])
  public posts: HasManyThrough<typeof Post>
}

Country.$getRelation('posts').relatedModel() // Post
```

---

### throughModel
Reference to the `throughModel`. The property value is a function that returns the throughModel.

```ts
class Country extends BaseModel {
  @hasManyThrough([() => Post, () => User])
  public posts: HasManyThrough<typeof Post>
}

Country.$getRelation('posts').throughModel() // User
```

---

### localKey
The `localKey` for the relationship. You must read the [NamingStrategy](../naming-strategy.md#relationlocalkey) doc to learn more about how the key name is computed.

You can also define the `localKey` explicitly. Do make sure you mention the model property name and NOT the database column name.

```ts
class Country extends BaseModel {
  @column()
  public id: number

  @hasManyThrough([() => Post, () => User], {
    localKey: 'id', // id column on the "Country" model
  })
  public posts: HasManyThrough<typeof Post>
}
```

---

### foreignKey
The `foreignKey` for the relationship. **The foreign key is the reference on the through model and not the related model**.

You can also define the `foreignKey` explicitly. Do make sure you mention the model property name and NOT the database column name.

```ts
class Country extends BaseModel {
  @hasManyThrough([() => Post, () => User], {
    foreignKey: 'countryId', // countryId column on the "User" model
  })
  public posts: HasManyThrough<typeof Post>
}
```

---

### throughLocalKey
The `throughLocalKey` for the relationship. It is usually the primary key on the through model.

You can also define the `throughLocalKey` explicitly. Do make sure you mention the model property name and NOT the database column name.

```ts
class Country extends BaseModel {
  @hasManyThrough([() => Post, () => User], {
    throughLocalKey: 'id', // id column on the "User" model
  })
  public posts: HasManyThrough<typeof Post>
}
```

---

### throughForeignKey
The `throughForeignKey` for the relationship. It is the foreign key between the through and the related model.

You can also define the `throughForeignKey` explicitly. Do make sure you mention the model property name and NOT the database column name.

```ts
class Country extends BaseModel {
  @hasManyThrough([() => Post, () => User], {
    throughForeignKey: 'userId', // userId column on the "Post" model
  })
  public posts: HasManyThrough<typeof Post>
}
```

---

### onQuery
The `onQuery` method is an optional hook to modify the relationship queries. You can define it at the time of declaring the relation.

```ts
class Country extends BaseModel {
  @hasManyThrough([() => Post, () => User], {
    onQuery(query) {
      query.where('isPublished', true)
    }
  })
  public posts: HasManyThrough<typeof Post>
}
```

If you want to preload a nested relationship using the `onQuery` hook, then make sure to put it inside the `!query.isRelatedSubQuery` conditional because sub-queries are **NOT executed directly**, they are used inside other queries.

```ts
class Country extends BaseModel {
  @hasManyThrough([() => Post, () => User], {
    onQuery(query) {
      // highlight-start
      if (!query.isRelatedSubQuery) {
        query.preload('comments')
      }
      // highlight-end
    }
  })
  public posts: HasManyThrough<typeof Post>
}
```

---

### setRelated
Set a relationship on the parent model instance. The methods accept the parent model as the first argument and the related model instance as the second argument.

You must ensure that both the model instances are related to each other before calling this method.

```ts
const country = new Country()
const post = new Post()

Country.$getRelation('posts').setRelated(country, [post])
```

---

### pushRelated
The `pushRelated` method pushes the relationship to the existing relationship value array.

```ts
const country = new Country()

Country.$getRelation('posts').pushRelated(country, new Post())
Country.$getRelation('posts').pushRelated(country, new Post())
Country.$getRelation('posts').pushRelated(country, new Post())

country.posts.length // 3
```

---

### setRelatedForMany
Set the relationships on more than one parent model. The method accepts an array of the parent models as the first argument and an array of related models as the second argument.

Lucid internally calls this with the results of the preloader.

```ts
const countries = [
  Country {
    id: 1,
  },
  Country {
    id: 2,
  },
  Country {
    id: 3,
  }
]

const posts = [
  Post {
    id: 1,
    $extras: {
      through_country_id: 1,
    }
  },
  Post {
    id: 2,
    $extras: {
      through_country_id: 1,
    }
  },
  Post {
    id: 3,
    $extras: {
      through_country_id: 2,
    }
  },
  Post {
    id: 4,
    $extras: {
      through_country_id: 3,
    }
  }
]

Country.$getRelation('posts').setRelatedForMany(countries, posts)
```

---

### client
Returns the reference to the [HasManyThroughQueryClient](#query-client). The query client exposes the API to fetch related rows from the database.

---

### eagerQuery
Returns an instance of the [HasManyThroughQueryBuilder](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/HasManyThrough/QueryBuilder.ts). The query builder has the same API as the [Model query builder](../query-builder.md)

---

### subQuery
Returns an instance of the [HasManyThroughSubQueryBuilder](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/HasManyThrough/SubQueryBuilder.ts). The sub queries are not meant to be executed and mainly used by the [withCount](../query-builder.md#withcount) and [whereHas](../query-builder.md#wherehas) methods.

## Query client
The query client exposes the API to fetch related rows from the database. You can access the query client for a relationship using the `related` method.

:::note
You cannot persist a `hasManyThrough` relationships directly and instead use the closest relationship for persistence. For example: Use the `posts` relationship on the `User` model to create related
posts.
:::

```ts
const country = await Country.find(1)
country.related('posts') // HasManyThroughClientContract
```

Using the query client, you can access the query builder instance for making related queries.

## Query Builder
The [HasManyThroughQueryBuilder](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Relations/HasManyThrough/QueryBuilder.ts) has the following additional methods on top of a standard model query builder.

You can access the relationship query builder as follows:

```ts
const country = await Country.find(1)

country.related('posts').query() // HasManyThroughQueryBuilder
```

### groupLimit
The `groupLimit` method uses [SQL window functions](https://www.sqlservertutorial.net/sql-server-window-functions/sql-server-row_number-function/) to add a limit to each group during relationship preloading. Please read the [preloading guide](../../../guides/models/relationships.md#preload-relationship) to learn why and when you need the `groupLimit` method.

```ts
await Country.query().preload('posts', (query) => {
  query.groupLimit(10)
})
```

### groupOrderBy
Add an order by clause to the group limit query. The method has the same API as the `orderBy` method on the standard query builder.

:::note

You only need to apply `groupOrderBy` when using the `groupLimit` method.

:::

```ts
await Country.query().preload('posts', (query) => {
  query
    .groupLimit(10)
    .groupOrderBy('posts.created_at', 'desc')
})
```
