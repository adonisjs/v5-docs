---
summary: Introduction to the async event emitter of AdonisJS.
---

The AdonisJS event emitter module is built on top of [Emittery](https://github.com/sindresorhus/emittery). It differs from the Node.js native Events module in the following ways.

- It is asynchronous, whereas the Node.js events module emits events synchronously. So make sure to also [read the Emittery](https://github.com/sindresorhus/emittery#how-is-this-different-than-the-built-in-eventemitter-in-nodejs) explanation on this as well.
- Ability to make events type-safe.
- Ability to trap events during tests instead of triggering the actual event.

## Usage
We recommend defining all the event listeners inside a dedicated file, just like how you define routes in a single file.

For this guide, let's define the event listeners inside the `start/events.ts` file. You can create this file manually or run the following Ace command.

```sh
node ace make:prldfile events

# SELECT ALL THE ENVIRONMENTS
```

Open the newly created file and write the following code inside it. The `Event.on` method registers an event listener. It accepts the event name as the first argument, followed by a method to handle the event.

```ts
import Event from '@ioc:Adonis/Core/Event'

Event.on('new:user', (user) => {
  console.log(user)
})
```

To trigger the `new:user` event listener, you will have to emit this event. You can do it from anywhere inside your application after it has been booted.

```ts
import Event from '@ioc:Adonis/Core/Event'

export default class UsersController {
  public async store() {
    // ... code to create a new user
    // highlight-start
    Event.emit('new:user', { id: 1 })
    // highlight-end
  }
}
```

## Making events type-safe
The event listeners and the code that emits the event are usually not in the same place/file. Therefore, it is very easy for some of your code to emit the event and send the wrong data. For example:

```ts
Event.on('new:user', (user) => {
  console.log(user.email)
})

// There is no email property defined here
Event.emit('new:user', { id: 1 })
```

You can prevent this behavior by defining the argument's type for a given event inside the `contracts/events.ts` file.

```ts
declare module '@ioc:Adonis/Core/Event' {
  interface EventsList {
    'new:user': { id: number; email: string }
  }
}
```

The TypeScript static compiler will ensure that all `Event.emit` calls for the `new:user` event are type-safe.

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1618599912/v5/type-safe-events.jpg)

## Listener classes
Like controllers and middleware, you can also extract the inline event listeners to their dedicated classes.

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

You can create a listener class by running the following Ace command.

```sh
node ace make:listener User

# CREATE: app/Listeners/User.ts
```

Open the newly created file and define the following method on the class.

```ts
import { EventsList } from '@ioc:Adonis/Core/Event'

export default class User {
  public async onNewUser(user: EventsList['new:user']) {
    // send email to the new user
  }
}
```

Finally, you can bind the `onNewUser` method as the event listener inside the `start/events.ts` file. The binding process is similar to a Route controller binding, and there is no need to define the complete namespace.

```ts
Event.on('new:user', 'User.onNewUser')
```

## Error handling
Emittery emits events asynchronously when you call the `Event.emit` method. One way to handle the errors is to wrap your emit calls inside a `try/catch` block.

```ts
try {
  await Event.emit('new:user', { id: 1 })
} catch (error) {
  // Handle error
}
```

However, this is not the most intuitive way to write code. Usually, you want to emit events and then forget about them.

AdonisJS allows you to register an error handler invoked for all the errors that occurred during the event emit lifecycle to make error handling a bit easier.

You should define the error handler only once (maybe alongside the rest of the event handlers).

```ts
Event.onError((event, error, eventData) => {
  // handle the error
})
```

## Differences from the Node.js event emitter
As mentioned earlier, the Event module of AdonisJS is built on top of [Emittery](https://github.com/sindresorhus/emittery), and it is different from the Node.js event emitter in the following ways.

- Emittery is asynchronous and does not block the event loop.
- It does not have the magic error event
- It does not place a limit on the number of listeners you can define for a specific event.
- **It only allows you to pass a [single argument](https://github.com/sindresorhus/emittery#can-you-support-multiple-arguments-for-emit) during the `emit` calls.**
