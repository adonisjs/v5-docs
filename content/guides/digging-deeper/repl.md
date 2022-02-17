---
summary: Interact with your applications from the command line using the AdonisJS REPL
---

REPL stands for **read–eval–print loop** - a way to quickly execute single-line instructions and print the output to the terminal.

Just like Node.js, AdonisJS also has its own **application-aware REPL**, giving you the access to your application code inside the REPL session. 

Let's give it a try by running the following Ace command.

```sh
node ace repl
```

::video{url="https://res.cloudinary.com/adonis-js/video/upload/v1604936668/adonisjs.com/adonis-repl_ibios2.mp4" controls}

## Helper methods
Writing the `import` statements inside the REPL requires a little bit of extra typing and therefore we have added a bunch of shortcut methods to import the commonly required modules.

Let's test the encryption module again, but this time we will use the shortcut method to import the module.

::video{url="https://res.cloudinary.com/adonis-js/video/upload/v1604937463/adonisjs.com/adonis-repl-shortcuts_jcyxay.mp4" controls}

You can view the list of helper methods by typing the `.ls` command.

![](https://res.cloudinary.com/adonis-js/image/upload/q_100/v1604938942/adonisjs.com/Screenshot_2020-11-09_at_9.50.06_PM_hekkxu.png)

Just like everything else, the REPL also has an extensible API and as you will install new packages you will see the list of helper methods growing.

For example: The Lucid ORM comes with the `loadModels` helper to recursively load models from the `app/Models` directory.

::video{url="https://res.cloudinary.com/adonis-js/video/upload/v1604939564/adonisjs.com/repl-load-models_ye0rdy.mp4" controls}

## Adding custom helpers

You can add your custom helpers by creating a preload file inside the `start` directory. Begin by creating a new file by running the following command.

:::note
Make sure to select the environment as `repl` by pressing the `<SPACE>` key and hit enter.
:::

```sh
node ace make:prldfile repl
```

Next, open the newly created file and paste the following contents inside it.

```ts
// title: start/repl.ts
import Repl from '@ioc:Adonis/Addons/Repl'

Repl.addMethod(
  'sayHi',
  (repl) => {
    console.log(repl.colors.green('hi'))
  },
  { description: 'A test method that prints "hi"' }
)
```

Finally, start the REPL session and type `sayHi()` to execute the method. Currently, we are writing to the console, however, you can perform any action inside this function.
