---
summary: ORM adapter class complete reference guide
---

The BaseModel class DOES NOT interact with the query builders directly. Instead, it relies on the [Model adapter class](https://github.com/adonisjs/lucid/blob/develop/src/Orm/Adapter/index.ts) to construct the query builder instances for different database operation.

This separation allows you swap the adapter with your custom implementation to cover advanced use cases.

## Creating a custom adapter
Every custom adapter must adhere to the `AdapterContract` interface.

```ts
import { AdapterContract } from '@ioc:Adonis/Lucid/Orm'
class MyAdapter implements AdapterContract {}
```

You can assign the adapter to the model as follows:

```ts
class User extends BaseModel {
  public static $adapter = new MyAdapter()
}
```

## Methods/Properties
Following is the list of methods/properties that every adapter must have.

### modelConstructorClient
Returns the query client for a given model constructor. 

```ts
import { AdapterContract, ModelAdapterOptions } from '@ioc:Adonis/Lucid/Orm'

class MyAdapter implements AdapterContract {
  public modelConstructorClient(model: typeof BaseModel, options?: ModelAdapterOptions) {
    const connection = options?.connection || model.connection
    return connection ? Database.connection(connection) : Database.connection()
  }
}
```

---

### modelClient
Returns the query client for a given model instance. The default implementation resolves the client as follows

- Return the transaction client if the model has `$trx` property defined
- Return the query client for a given connection if model instance has `$options.connection` property defined.
- Finally, look for the `connection` property on the model constructor (aka static connection property).

```ts
import { AdapterContract } from '@ioc:Adonis/Lucid/Orm'

class MyAdapter implements AdapterContract {
  public modelClient(instance: BaseModel) {
  }
}
```

---

### query
Return the query builder instance for a given Model constructor. The `Model.query` method internals calls the `query` method on the adapter.

```ts
import { AdapterContract, ModelAdapterOptions } from '@ioc:Adonis/Lucid/Orm'

class MyAdapter implements AdapterContract {
  public query(model: typeof BaseModel, options?: ModelAdapterOptions) {
    return Database.modelQuery(model)
  }
}
```

---

### insert
Perform the insert operation for a given model instance. The method receives the model instance and an object of attributes to insert.

```ts
import { AdapterContract } from '@ioc:Adonis/Lucid/Orm'

class MyAdapter implements AdapterContract {
  public async insert(instance: BaseModel, attributes: any) {
  }
}
```

---

### update
Perform the update operation for a given model instance. The method receives the model instance and an object of attributes to update.

```ts
import { AdapterContract } from '@ioc:Adonis/Lucid/Orm'

class MyAdapter implements AdapterContract {
  public async update(instance: BaseModel, dirtyAttributes: any) {
  }
}
```

---

### delete
Perform the delete operation for a given model instance. The method receives only the model instance.

```ts
import { AdapterContract } from '@ioc:Adonis/Lucid/Orm'

class MyAdapter implements AdapterContract {
  public async delete(instance: BaseModel) {
  }
}
```

--- 

### refresh
Refresh the model instance by performing a select query and hydrating its attributes. The method receives only the model instance.

```ts
import { AdapterContract } from '@ioc:Adonis/Lucid/Orm'

class MyAdapter implements AdapterContract {
  public async refresh(instance: BaseModel) {
  }
}
```
