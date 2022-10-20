---
datetime: 2020-06-08
author: Virk
avatarUrl: https://res.cloudinary.com/adonis-js/image/upload/v1619103621/adonisjs-authors-avatars/DYO4KUru_400x400_shujhw.jpg
summary: Learn how to use socket.io with AdonisJS
---

[Socket.io](https://socket.io/) is a very popular library for real-time and bidirectional communication. In this guide, we will learn how to use socket.io with AdonisJS.

The first step is to install the package from the npm package registry.

:::codegroup

```sh
// title: npm
npm i socket.io
```

```sh
// title: yarn
yarn add socket.io
```
:::

Next, let's create a service class responsible for starting the socketio server and provide us a reference to it.

The code for the service can be anywhere inside your codebase. I prefer keeping it inside the `./app/Services` directory.

```ts
// title: app/Services/Ws.ts
import { Server } from 'socket.io'
import AdonisServer from '@ioc:Adonis/Core/Server'

class Ws {
  public io: Server
  private booted = false

  public boot() {
    /**
     * Ignore multiple calls to the boot method
     */
    if (this.booted) {
      return
    }

    this.booted = true
    this.io = new Server(AdonisServer.instance!)
  }
}

export default new Ws()
```

Next, let's create a `start/socket.ts` file and paste the following contents inside it. Like the `routes` file, we will use this file to listen to the incoming socket connections.

```ts
// title: start/socket.ts
import Ws from 'App/Services/Ws'
Ws.boot()

/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', (socket) => {
  socket.emit('news', { hello: 'world' })

  socket.on('my other event', (data) => {
    console.log(data)
  })
})
```

Finally, import the above-created file inside the `providers/AppProvider.ts` file under the `ready` method. 

The `ready` method runs after the AdonisJS HTTP server is ready, and this is when we should establish the socketio connection.

```ts
// title: providers/AppProvider.ts
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public async ready() {
    if (this.app.environment === 'web') {
      await import('../start/socket')
    }
  }
}
```

That's all you need to do to set up socket.io. Let's take a step further and also test that we can establish a connection from the browser.

## Client setup
We will use the CDN build of socketio-client to keep things simple. Let's open the `resources/views/welcome.edge` and add the following scripts to the page.

```edge
// title: resources/views/welcome.edge

<body>
  <!-- Rest of markup -->

  // highlight-start
    <script src="https://cdn.socket.io/4.0.1/socket.io.min.js"></script>
    <script>
      const socket = io()
      socket.on('news', (data) => {
        console.log(data)
        socket.emit('my other event', { my: 'data' })
      })
    </script>
  // highlight-end
</body>
</html>
```

Let's start the development server by running `node ace serve --watch` and open [http://localhost:3333](http://localhost:3333) in the browser to test the integration.

::video{url="https://res.cloudinary.com/adonis-js/video/upload/v1591543846/adonisjs.com/blog/socket-io_i4qe6n.mp4" controls}

## Broadcast from anywhere
Since we have abstracted the socketio setup to a service class, you can import it from anywhere inside your codebase to broadcast events. For example:

```ts
import Ws from 'App/Services/Ws'

class UsersController {
  public async store() {
    Ws.io.emit('new:user', { username: 'virk' })
  }
}
```

## Configure CORS
The socketio connection uses the underlying Node.js HTTP server directly, and hence the AdonisJS CORS setup will not work with it.

However, you can configure [cors with socketio directly](https://socket.io/docs/v4/handling-cors/) as follows.

```ts
class Ws {
  public io: Server
  private booted = false

  public boot() {
    /**
     * Ignore multiple calls to the boot method
     */
    if (this.booted) {
      return
    }

    this.booted = true
    // highlight-start
    this.io = new Server(AdonisServer.instance!, {
      cors: {
        origin: '*'
      }
    })
    // highlight-end
  }
}
```
