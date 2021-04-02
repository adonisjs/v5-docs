The orm config is defined inside the `config/database` file under the `orm` property.

The config can also be overwritten at the model level.

```ts
class User extends BaseModel {}

// orm config for User model
User.$configurator = {}
```

[note]
All of the code examples assumes you are overwriting config with in the `config/database` file.
[/note]

## `getTableName`
Returns the default table name for the model. The default behavior is to convert the model name to snake case and pluralize it.

```ts
import Helpers from '@ioc:Adonis/Core/Helpers'

orm: {
  getTableName(model) {
    return Helpers
      .string(model.name)
      .snakeCase()
      .pluralize()
      .value
  }
}
```

## `getColumnName`
Returns the database column name for a given model property. The default behavior is to convert the property name to snake case.

```ts
import Helpers from '@ioc:Adonis/Core/Helpers'

orm: {
  getColumnName(model, key) {
    return Helpers.string(key).snakeCase().value
  }
}
```

## `getSerializeAsKey`
Returns the name for a given model property to be used when serializing the model. The default behavior is to convert the property name to snake case.

```ts
import Helpers from '@ioc:Adonis/Core/Helpers'

orm: {
  getSerializeAsKey(model, key) {
    return Helpers.string(key).snakeCase().value
  }
}
```

## `getLocalKey`
Returns the local key for a given relationship. The default behavior is to use the `primaryKey` as the local key for all the relationships except `belongsTo`.

```ts
orm: {
  getLocalKey(relation, model, related) {
    if (relation === 'belongsTo') {
			return related.primaryKey
		}

    return model.primaryKey
  }
}
```

## `getForeignKey`
Returns the foreign key for a given relationship. The default behavior is to look for camel case version of the key with the `model.name + mode.primaryKey`.

```ts
import Helpers from '@ioc:Adonis/Core/Helpers'

orm: {
  getForeignKey(relation, model, related) {
    if (relation === 'belongsTo') {
      return Helpers
        .string(`${related.name}_${related.primaryKey}`)
        .camelCase()
        .value
    }

    return Helpers
      .string(`${model.name}_${model.primaryKey}`)
      .camelCase()
      .value
  }
}
```

## `getPivotTableName`
Returns the pivot table name for the many to many relationship. The default behavior is to create a string by combining the model names.

```ts
import Helpers from '@ioc:Adonis/Core/Helpers'

orm: {
  getForeignKey(relation, model, related) {
    const baseName = [related.name, model.name].sort().join('_')

    return Helpers
      .string(baseName)
      .snakeCase()
      .value
  }
}
```

## `getPivotForeignKey`
Returns the foreign key name inside the pivot table. The method is invoked for both the models involved in a many to many relationship.

```ts
import Helpers from '@ioc:Adonis/Core/Helpers'

orm: {
  getPivotForeignKey(relation, model) {
    return Helpers
      .string(`${model.name}_${model.primaryKey}`)
      .snakeCase()
      .value
  }
}
```
