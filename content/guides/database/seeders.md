Database seeding is a way to setup your application with some initial data that is required to run and use the application. For example:

- Creating a seeder to insert **countries**, **states** and **cities** before deploying and running your application.
- Or a seeder to insert users inside the database for local development.

The seeders are stored inside the `database/seeders` directory. You can create a new seeder file by running the following ace command.

```sh
node ace make:seeder User

# CREATE: database/seeders/User.ts
```

Every seeder file must extend the `BaseSeeder` class and implement the `run` method.

The following example uses a Lucid model to create multiple users. However, you can also use the Database query builder directly. **In other words, seeders don't care what you write inside the `run` method**.

```ts
// title: database/seeders/User.ts
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {

  public async run () {
    await User.createMany([
      {
        email: 'virk@adonisjs.com',
        password: 'secret',
      },
      {
        email: 'romain@adonisjs.com',
        password: 'supersecret'
      }
    ])
  }

}
```

## Running seeders
You can execute all or selected database seeders by the running the following ace command.

```sh
# runs all
node ace db:seed
```

You can define the `--files` flag multiple times to run more than one files. Also, you will have to define the complete path to the seeder file. **We opted for complete path, because your terminal shell can autocomplete the path for you.**

```sh
node ace db:seed --files "./database/seeders/User.ts"
```

You can also select the seeder files interactively by running the `db:seed` command in interactive mode.

```sh
node ace db:seed -i
```

::video{url="https://res.cloudinary.com/adonis-js/video/upload/q_auto/v1618896667/v5/db-seed-interactive.mp4" controls}

## Development only seeders
Lucid allows you to mark a seeder file as development only by setting the `developmentOnly` property to `true`. This ensures that you don't seed your production database with dummy data by mistake.

The seeders using the `developmentOnly` flag will only run when `NODE_ENV` environment variable is set to `development`.

```ts
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class UserSeeder extends BaseSeeder {
  public static developmentOnly = true

  public async run () {
  }
}
```

## Idempotent operations
**Unlike migrations, there is no tracking system in place for the database seeders**. In other words, executing a seeder multiple times will perform the inserts multiple times as well.

Based upon the nature of a seeder, you may or may not want this behavior. For example:

- It is okay to run a `PostSeeder` for multiple times and increase the number of posts you have in the database.
- On the other hand, you would want the `CountrySeeder` to perform inserts only once. These kind of seeders are idempotent in nature.

Fortunately, Lucid models has inbuilt support for idempotent operations using methods like `updateOrCreate` or `fetchOrCreateMany`. Continuing with the `CountrySeeder`, following is an example of creating countries only once.

```ts
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Country from 'App/Models/Country'

export default class CountrySeeder extends BaseSeeder {

  public async run () {
    const uniqueKey = 'isoCode'

    await Country.updateOrCreateMany(uniqueKey, [
      {
        isoCode: 'IN',
        name: 'India',
      },
      {
        isoCode: 'FR',
        name: 'France',
      },
      {
        isoCode: 'TH',
        name: ' Thailand',
      },
    ])
  }

}
```

In the above example, the `updateOrCreateMany` method will look for existing rows inside the database using the `isoCode` code and only inserts the missing ones and hence running the `CountrySeeder` for multiple times will not insert duplicate rows.

## Customizing database connection
The `db:seed` command accepts an optional `--connection` flag and forwards it to the seeder files as a `connection` property. From there on, you can use this property to set the appropriate connection during your models interactions. For example:

```ts
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {

  public async run () {
    await User.create({
      email: 'virk@adonisjs.com',
      password: 'secret',
    }, {
      connection: this.connection, // 👈
    })
  }

}
```

Now you can specify the `--connection` flag on your `db:seed` command and the `UserSeeder` will use it.

```sh
node ace db:seed --connection=tenant-1
```
