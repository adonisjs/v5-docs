---
summary: Learn how to paginate results using the Lucid ORM
---

Lucid has inbuilt support for **offset-based pagination**. You can paginate the results of a query by chaining the `.paginate` method.

The `paginate` method accepts the page number as the first argument and the rows to fetch as the second argument. Internally, we execute an additional query to count the total number of rows.

```ts
const page = request.input('page', 1)
const limit = 10

const posts = await Database.from('posts').paginate(page, limit)
console.log(posts)
```

The `paginate` method returns an instance of the [SimplePaginatorClass](../../reference/database/query-builder.md#pagination). It holds the meta data for the pagination, alongside the fetched `rows`.

```ts
SimplePaginator {
  perPage: 10,
  currentPage: 1,
  firstPage: 1,
  isEmpty: false,
  total: 50,
  hasTotal: true,
  lastPage: 5,
  hasMorePages: true,
  hasPages: true
}
```
:::note
It is recommended to use the `orderBy` method when using pagination to avoid a different order every time you query the data. 
:::

## Displaying pagination links
Following is a complete example of displaying the pagination links inside an Edge template.

```ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

class PostsController {
  public async index ({ request, view }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = 10

    const posts = await Database.from('posts').paginate(page, limit)

    // Changes the baseURL for the pagination links
    posts.baseUrl('/posts')

    return view.render('posts/index', { posts })
  }
}
```

Open the `posts/index.edge` file and paste the following code snippet inside it.

```edge
<div>
  @each(post in posts)
    <h1>{{ post.title }}</h1>
    <p> {{ excerpt(post.body, 200) }} </p>
  @endeach
</div>

<hr>

// highlight-start
<div>
  @each(anchor in posts.getUrlsForRange(1, posts.lastPage))
    <a href="{{ anchor.url }}">
      {{ anchor.page }}
    </a>
  @endeach
</div>
// highlight-end
```

The `getUrlsForRange` method accepts a range of pages and returns an array of objects with the following properties.

```ts
[
  {
    url: '/?page=1',
    page: 1,
    isActive: true,
    isSeperator: false,
  },
  {
    url: '/?page=2',
    page: 2,
    isActive: true,
    isSeperator: false,
  },
  // ...
]
```

![](https://res.cloudinary.com/adonis-js/image/upload/v1596970976/adonisjs.com/lucid-pagination.png)

## Serializing to JSON
You can also serialize the paginator results to JSON by calling the `toJSON` method. It returns the key names in `snake_case` by default. However, you can pass a [naming strategy](../../reference/orm/naming-strategy.md#paginationmetakeys) to override the default convention.

```ts
const posts = await Database.from('posts').paginate(page, limit)
return posts.toJSON()
```

```json
{
  "meta": {
    "total": 50,
    "per_page": 5,
    "current_page": 1,
    "last_page": 10,
    "first_page": 1,
    "first_page_url": "/?page=1",
    "last_page_url": "/?page=10",
    "next_page_url": "/?page=2",
    "previous_page_url": null
  },
  "data": []
}
```

In the following example, we override the naming strategy to return keys in `camelCase`.

```ts
const posts = await Database.from('posts').paginate(page, limit)

posts.namingStrategy = {
  paginationMetaKeys() {
    return {
      total: 'total',
      perPage: 'perPage',
      currentPage: 'currentPage',
      lastPage: 'lastPage',
      firstPage: 'firstPage',
      firstPageUrl: 'firstPageUrl',
      lastPageUrl: 'lastPageUrl',
      nextPageUrl: 'nextPageUrl',
      previousPageUrl: 'previousPageUrl',
    }
  }
}

return posts.toJSON()
```

You can also assign a custom naming strategy to the `SimplePaginator` class constructor to override it globally. The following code must go inside a provider or a [preload file](../fundamentals/adonisrc-file.md#preloads).

```ts
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public async ready() {
    // highlight-start
    const Db = this.app.container.use('Adonis/Lucid/Database')

    Db.SimplePaginator.namingStrategy = {
      paginationMetaKeys() {
        return {
          // ... same as above
        }
      }
    }
    // highlight-end
  }
}

```

## Additional reading
- [Paginator class reference guide](../../reference/database/query-builder.md#pagination)
