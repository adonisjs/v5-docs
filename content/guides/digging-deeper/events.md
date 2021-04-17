AdonisJS ships with an event emitter module built on top of [emittery](https://github.com/sindresorhus/emittery). It differs from the Node.js native Events module in following ways.

- It is asynchronous in nature, whereas the Node.js events module emits events synchronously. Make sure to also [read the emittery](https://github.com/sindresorhus/emittery#how-is-this-different-than-the-built-in-eventemitter-in-nodejs) explanation on this as well.
- Ability to make events type safe.
- Ability to trap events during tests, instead of triggering the real event.

## Usage
We recommend you to define all the event listeners inside a dedicated file, just like the way you define routes in a single file.

For the purpose of this guide, lets define the event listeners inside the `start/events.ts` file. You can create this file manually or run the following ace command.

```sh
node ace make:prdlfile events

# SELECT ALL THE ENVIRONMENTS
```

Open the newly created file and write the following code inside it. The `Event.on` method registers a listener that is invoked everytime you emit the `new:user` event from anywhere inside your application.

```ts
import Event from '@ioc:Adonis/Core/Event'

Event.on('new:user', (user) => {
  console.log(user)
})
```

## Making events type safe
The events listeners and the code that emits the event are usually not in the same place/file. It is very easy for some part of your code to emit the event and send the wrong data to it. For example:

```ts
Event.on('new:user', (user) => {
  console.log(user.email)
})

// There is no email property defined here
Event.emit('new:user', { id: 1 })
```

You can prevent this behavior by defining the arguments type for a given event inside the `contracts/events.ts` file.

```ts
declare module '@ioc:Adonis/Core/Event' {
  interface EventsList {
    'new:user': { id: number; email: string }
  }
}
```

Now, the Typescript static compiler will make sure that all `Event.emit` calls for the `new:user` event are type safe.

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1618599912/v5/type-safe-events.jpg)

## Listener classes
Just like controllers and middleware, you can also extract the inline event listeners to their own dedicated classes.

Conventionally event listeners are stored inside the `app/Listeners` directory. However, you can customize the namespace inside the `.adonisrc.json` file.

<details>
<summary> Customize event listeners namespace </summary>

```json
{
  "namespaces": {
    "eventListeners": "App/CustomDir/Listeners"
  }
}
```

</details>

You can create a listener class by running the following ace command.

```sh
node ace make:listener User

# CREATE: app/Listeners/User.ts
```

### About listener classes
The 
