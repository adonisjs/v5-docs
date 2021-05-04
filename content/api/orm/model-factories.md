---
summary: Base model class complete reference guide
---

You can define a model factory for a given model using the `Factory.define` method. The method accepts the model reference as the first argument and a callback to configure the default values as the second argument.

```ts
import Factory from '@ioc:Adonis/Lucid/Factory'
import User from 'App/Models/User'

Factory
  .define(User, ({ faker }) => {
    return {
      fullName: faker.name.findName(),
      email: faker.internet.email(),
    }
  })
  .onMerge(() => {
  })
```

The `define` method returns an instance of the [FactoryModel](https://github.com/adonisjs/lucid/blob/develop/src/Factory/FactoryModel.ts)
