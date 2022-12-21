---
summary: Using database seeders to add seed database with dummy or initial data
---

Database seeding is a way to set up your application with some initial data required to run and use the application. For example:

- Creating a seeder to insert **countries**, **states**, and **cities** before deploying and running your application.
- Or a seeder to insert users inside the database for local development.

The seeders are stored inside the `database/seeders` directory. You can create a new seeder file by running the following Ace command.

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
You can execute all or selected database seeders by running the following Ace command.

```sh
# runs all
node ace db:seed
```

You can define the `--files` flag multiple times to run more than one file. Also, you will have to define the complete path to the seeder file. **We opted for the complete path because your terminal shell can autocomplete the path for you.**

```sh
node ace db:seed --files "./database/seeders/User.ts"
```

You can also select the seeder files interactively by running the `db:seed` command in interactive mode.

```sh
node ace db:seed -i
```

::video{url="https://res.cloudinary.com/adonis-js/video/upload/q_auto/v1618896667/v5/db-seed-interactive.mp4" controls}

## Environment specific seeders
Lucid allows you to mark a seeder file to run only in a specific environment by changing the `environment` property. This ensures you don't seed your production, testing, or development database with data you don't want by mistake.

The seeders using the `environment` flag will only run when the `NODE_ENV` environment variable is set to their respective value.

```ts
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class UserSeeder extends BaseSeeder {
  public static environment = ['development', 'testing']

  public async run () {
  }
}
```

## Idempotent operations
**Unlike migrations, there is no tracking system in place for the database seeders**. In other words, executing a seeder multiple times will perform the inserts multiple times as well.

Based upon the nature of a seeder, you may or may not want this behavior. For example:

- It is okay to run a `PostSeeder` multiple times and increase the number of posts you have in the database.
- On the other hand, you would want the `CountrySeeder` to perform inserts only once. These kinds of seeders are idempotent.

Fortunately, Lucid models have inbuilt support for idempotent operations using `updateOrCreate` or `fetchOrCreateMany`. Continuing with the `CountrySeeder`, the following is an example of creating countries only once.

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
The `db:seed` command accepts an optional `--connection` flag and forwards it to the seeder files as a `connection` property. From there on, you can use this property to set the appropriate connection during your model interactions. For example:

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

Now you can specify the `--connection` flag on your `db:seed` command, and the `UserSeeder` will use it.

```sh
node ace db:seed --connection=tenant-1
```

## Seeders config
The configuration for seeders is stored inside the `config/database.ts` file under the connection config object.

#### paths
Define the paths for loading the database seeder files. You can also define a path to an installed package.

```ts
{
  mysql: {
    client: 'mysql2',
    seeders: {
      paths: ['./database/seeders', '@somepackage/seeders-dir']
    }
  }
}
```

## Customizing seeders order
The `db:seed` command runs all the seeders in the order they are stored on the filesystem. 

If you want certain seeders to run before the other seeders, then either you can **prefix a counter to file names** or **you can create a Main seeder directory** as follows.

#### Step 1. Create the main seeder
Create the main seeder file by running the following Ace command.

```sh
node ace make:seeder MainSeeder/index

# CREATE: database/seeders/MainSeeder/Index.ts
```

---

#### Step 2. Register its path inside the `seeders` config
Open the `config/database.ts` file and register the path to the **Main seeder** directory inside the connection config.

After the following change, the `db:seed` command will scan the `./database/seeders/MainSeeder` directory.

```ts
{
  mysql: {
    client: 'mysql2',
    // ... rest of the config
    seeders: {
      paths: ['./database/seeders/MainSeeder']
    }
  }  
}
```

---

#### Step 3. Import other seeders inside the main seeder
Now, you can manually import all the seeders inside the **Main seeder** file and execute them in any order you want.

:::note
Following is an example implementation of the Main seeder. Feel free to customize it as per your requirements.
:::

```ts
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Application from '@ioc:Adonis/Core/Application'

export default class IndexSeeder extends BaseSeeder {
  private async runSeeder(Seeder: { default: typeof BaseSeeder }) {
    /**
     * Do not run when not in a environment specified in Seeder
     */
    if (
      (!Seeder.default.environment.includes('development') && Application.inDev)
      || (!Seeder.default.environment.includes('testing') && Application.inTest)
      || (!Seeder.default.environment.includes('production') && Application.inProduction)
    ) {
      return
    }

    await new Seeder.default(this.client).run()
  }

  public async run() {
    await this.runSeeder(await import('../Category'))
    await this.runSeeder(await import('../User'))
    await this.runSeeder(await import('../Post'))
  }
}
```

---

#### Step 4. Run the `db:seed` command

```sh
node ace db:seed

# completed database/seeders/MainSeeder/Index
```
