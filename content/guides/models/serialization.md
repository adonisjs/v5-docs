---
summary: Learn how to serialize model instances to plain JavaScript objects.
---

If you create an API server, you want to convert the model instances to plain JSON objects before sending them to the client in response.

The process of transforming class instances to plain JSON objects is known as serialization. During the serialization process, you may also want to:

- Convert the `camelCase` model property names to `snake_case`.
- Hide/remove some of the properties from the API responses. For example: Removing the `password` property from the User model.
- Convert/mutate values. For example: Converting the timestamps to an ISO string.
- Add additional computed properties. For example: Compute the `fullName` from the user's first and the last name.

You can perform all these transformations within your models without creating any separate transformers or resource classes.

:::note

There is no need to serialize your models to JSON when using them inside the Edge templates. Serialization is only required for API servers returning JSON responses.

:::

## Serializing models

You can serialize a model by calling either the `serialize` or the `toJSON` method. For example:

```ts
const post = await Post.find(1)
const postJSON = post.serialize()
```

You can serialize an array of model instances by calling the `Array.map` method.

```ts
const posts = await Post.all()
const postsJSON = posts.map((post) => post.serialize())
```

### Serializing paginated results
When working with paginated results, you can serialize the models by calling the `.serialize` method on the paginator instance.

The `paginator.serialize` method returns an object with `meta` and `data` properties. The `meta` is the [pagination metadata](../database/pagination.md#serializing-to-json) and `data` is an array of serialized models.

```ts
const posts = await Post.query().paginate(1)
const paginationJSON = posts.serialize()

/**
 {
    meta: {},
    data: []
 }
 */
```

### Computed properties

During the serialization process, the model returns an object with properties using the `@column` decorator. If you want to serialize any additional properties, then make use of the `@computed` decorator.

```ts
import { DateTime } from 'luxon'
import { string } from '@ioc:Adonis/Core/Helpers'
import { BaseModel, column, computed } from '@ioc:Adonis/Lucid/Orm'

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public body: string

  // highlight-start
  @computed()
  public get excerpt() {
    return string.truncate(this.body, 50)
  }
  // highlight-end
}
```

### Re-naming properties
You can rename the serialized property names by using the `serializeAs` option. You will still access the property by its actual name on the model, but the serialized output will use the `serializeAs` name. For example:

:::note
Make use of [Model naming strategy](../../reference/orm/naming-strategy.md#serializedname) if you want to overwrite the naming convention for all serialized properties.
:::

```ts
import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  // highlight-start
  @column({ serializeAs: 'content' })
  public body: string
  // highlight-end
}
```

```ts
const post = await Post.find(1)
post.serialize()

/**
 {
    id: 1,
    content: 'Adonis 101'
 }
 */
```

### Hiding properties
You can remove the model properties from the serialized output by setting the `serializeAs` value to `null`. For example:

```ts
import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  // highlight-start
  @column({ serializeAs: null })
  public password: string
  // highlight-end
}
```

```ts
const user = await User.find(1)
user.serialize()

/**
 {
    id: 1,
    email: 'virk@adonisjs.com'
 }
 */
```

### Mutating/transforming values
You can also transform a property value during serialization by defining the `serialize` method. It receives the property's current value, and the return value is passed to the serialized output.

:::note
Do make sure to guard the method implementation against the `null` values.
:::

```ts
import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  // highlight-start
  @column.dateTime({
    autoCreate: true,
    serialize: (value: DateTime | null) => {
      return value ? value.setZone('utc').toISO() : value
    },
  })
  public createdAt: DateTime
  // highlight-end
}
```

## Serializing relationships
The `preloaded` relationships are automatically serialized every time you serialize a model instance. For example:

```ts
const posts = await Post
  .query()
  .preload('comments')

const postsJSON = posts.map((post) => post.serialize())
```

In the above example, the `comments` for all the posts will be serialized to the post object. For example:

```ts
{
  id: 1,
  title: 'Adonis 101',
  comments: [{
    id: 1,
    content: 'Nice article'
  }]
}
```

You can change the relationship property name by defining the `serializeAs` option on the relationship definition.

```ts
import { DateTime } from 'luxon'
import Comment from 'App/Models/Comment'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  // highlight-start
  @hasMany(() => Comment, {
    serializeAs: 'postComments'
  })
  public comments: HasMany<typeof Comment>
  // highlight-end
}
```

```ts
const posts = await Post
  .query()
  .preload('comments')

const postsJSON = posts.map((post) => post.serialize())

/**
{
  id: 1,
  title: 'Adonis 101',
  postComments: [{
    id: 1,
    content: 'Nice article'
  }]
}
*/
```

If you don't want to serialize a relationship, you can set the `serializeAs = null`.

## Serializing `$extras` object
The query result values which are not defined as columns on the model are moved to the `$extras` object.

For example, in the following query, we fetch the `category_name` using a subquery. However, your model has no knowledge about this on the fly `category_name` column, and hence we will move its value to the `$extras` object.

```ts
const post = await Post
  .query()
  .select('*')
  .select(
    Database
      .from('categories')
      .select('name')
      .whereColumn('posts.category_id', 'categories.id')
      .limit('1')
      .as('category_name')
  )
  .first()
```

You can access the extras object from the model instance as follows:

```ts
post.$extras.category_name
```

You can also serialize the `$extras` object by defining the following property on the model.

```ts
class Post extends BaseModel {
  /**
   * Serialize the `$extras` object as it is
   */
  public serializeExtras = true
}
```

Also, you can customize the properties you want to pick from the extras object by declaring the `serializeExtras` property as a function.

```ts
class Post extends BaseModel {
  public serializeExtras() {
    return {
      category: {
        name: this.$extras.category_name
      },
    }
  }
}
```

## Cherry picking fields/relationships
The cherry-picking API is designed by keeping the consumer of the API in mind. Some of the options may look verbose or less intuitive, but once you look at it from the perspective of the API consumer, things will start to make more sense.

---

### Picking/omitting fields
You can pass a tree of fields/relationships to pick or omit from the final results during the serialization process. For example:

```ts
const post = await Post.find(1)

posts.serialize({
  fields: {
    pick: ['id', 'title', 'createdAt']
  }
})
```

Instead of picking fields, you can also define the fields to `omit`. When both are specified, the `omit` will win over the `pick` array.

```ts
const post = await Post.find(1)

posts.serialize({
  fields: {
    omit: ['createdAt', 'updatedAt']
  }
})
```

---

### Picking relationships and their fields
You can also cherry-pick the complete relation nodes or pick/omit fields from the relationships.

```ts
const post = await Post
  .query()
  .preload('comments')
  .preload('category')
  .preload('author')
  .first()

post.serialize({
  fields: {
    pick: ['id', 'title', 'body'],
  },
  relations: {
    comments: {
      fields: ['id', 'body'],
    },
    author: {
      fields: ['id', 'email', 'avatar_url'],
    },
  }
})
```

The serialization tree may look verbose at first. However, most API servers do not define the fields or pick/omit by hand and usually compute it from the URL query string.

---

### Points to note

- The cherry-picking API **uses the serialization property names** and **not the model property names**. 
- Again, from the API consumer point of view, they don't know the property name you have defined on the model. They can only see the JSON response and cherry-pick using the same property names.
- The cherry-picking API cannot override the `serializeAs = null` option. Otherwise, someone can define the `password` field in the URL query string to view all the hashed passwords.
