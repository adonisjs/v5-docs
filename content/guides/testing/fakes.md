AdonisJS ships with fake implementations for most of its first-party packages. You can use fakes to have a better testing experience without manually mocking parts of your codebase.

## Mail
You can fake the outgoing emails by calling the `Mail.fake` method. Once you call this method, all other parts of your application interacting with the `Mail` object will not send real emails. Instead, they will be collected within memory for assertions.

```ts
import { test } from '@japa/runner'
// highlight-start
import Mail from '@ioc:Adonis/Addons/Mail'
// highlight-end

test('register user', async ({ assert, client }) => {
  // highlight-start
  const mailer = Mail.fake()
  // highlight-end

  await client
    .post('register')
    .form({
      email: 'virk@adonisjs.com',
      password: 'secret'
    })

  // highlight-start
  // Time for assertions
  assert.isTrue(mailer.exists((mail) => {
    return mail.subject === 'Welcome to AdonisJS'
  }))

  Mail.restore()
  // highlight-end
})
```

### Mail.fake

Calling `Mail.fake` creates a fake only for the default mailer. However, you can explicitly pass the name(s) of the mailers to fake.

```ts
// Fake the default mailer
Mail.fake()

// Fake smtp and s3 mailers
Mail.fake(['smtp', 's3'])
```

### Mail.restore
Once done with testing, you can restore the fakes for selected or all mailers.

```ts
// Restore the default mailer
Mail.restore()

// Restore smtp and s3 mailers
Mail.restore(['smtp', 's3'])

// Restore all faked mailers
Mail.restoreAll()
```

### Finding messages
You can check for the sent messages using `exists`, `find`, or the `filter` methods. All the methods accepts a subset of message properties or a callback.

```ts
assert.isTrue(mailer.exists({ subject: 'Welcome to AdonisJS' }))

assert.isTrue(mailer.exists((mail) => {
  return mail.subject === 'Welcome to AdonisJS'
}))

const message = mailer.find((mail) => {
  return mail.to[0].address === 'virk@adonisjs.com'
})

console.log(message)
```

## Events
You can fake events by calling the `Event.fake` method. The method accepts an optional array of events to fake. Otherwise, all upcoming events are faked.

```ts
import Event from '@ioc:Adonis/Core/Event'

// Fake all events
Event.fake()

// Fake specific events
Event.fake(['new:user', 'update:email'])
```

### Event.restore
You can restore events using the `Event.restore` method.

```ts
Event.restore()
```

### Finding events

The `Event.fake` method returns a fake emitter you can use to later fetch or find events.

```ts
const emitter = Event.fake()

assert.isTrue(emitter.exists('new:user'))
assert.isTrue(emitter.exists((event) => {
  return event.name === 'new:user' && event.data.id === 1
}))
```

You can use the `find` and `filter` methods to find specific events.

```ts
const emitter = Event.fake()

emitter.find('new:user')
// returns { name: 'new:user', data: any }

emitter.filter((event) => event.name.startsWith('invite:'))
// returns { name: 'new:user', data: any }
```

## Drive
You can fake the Drive implementation by calling the `Drive.fake` method. By default, only the default disk is faked. However, you can define disk names explicitly as well.

```ts
import Drive from '@ioc:Adonis/Core/Drive'

// Fake default disk
Drive.fake()

// Fake local and s3
Drive.fake(['s3', 'local'])
```

### Drive.restore
You can restore fakes by calling the `Drive.restore` method. Optionally, you can pass the disk names to restore, otherwise the default disk is restored. Or, use the `Drive.restoreAll` method to restore all the disk.

```ts
// Restore default disk
Drive.restore()

// Restore specific disks
Drive.restore(['s3', 'local'])

// Restore all the disks
Drive.restoreAll()
```

### Finding files

The `Drive.fake` method returns the fake drive object you can use to later fetch or find files.

```ts
const drive = Drive.fake()

// Find if file exists
assert.isTrue(await drive.exists('avatar.jpg'))

// Assert for the file size
assert.isBelow(await drive.bytes('avatar.jpg'), 1000 * 1000 * 20)

// Assert for file contents
assert.equal(await drive.get('package.json'), JSON.stringify({}))
```

## Hashing
You can fake the Hash module by calling the `Hash.fake` method. No password hashing is performed during the fake, and the `hash.make` method returns the same value.

```ts
import Hash from '@ioc:Adonis/Core/Hash'

// Fake hash implementation
Hash.fake()

const hashed = await Hash.make('secret') // returns "secret"
await Hash.verify(hashed, 'secret') // returns "true"

// Restore fake
Hash.restore()
```

## Mocking objects
AdonisJS does not ship with any mocking library out of the box. You are free to use any mocking library from the Node ecosystem.

Following is a small example demonstrating the usage of [SinonJS](https://sinonjs.org/) to mock ES6 classes.

```ts
export default class ExchangeService {
  constructor (private baseCurrency: string) {}

  public getRate(currency: string, amount: number) {
  }
}
```

During tests, you can import the `ExchangeService` and mock the `getRate` method as follows.

```ts
import { test } from '@japa/runner'

// highlight-start
import sinon from 'sinon'
import ExchangeService from 'App/Services/ExchangeService'
// highlight-end

test('transfer payment', async ({ client }) => {
  // highlight-start
  const mock = sinon.mock(ExchangeService.prototype)
  mock
    .expects('getRate')
    .once()
    .withArgs('INR', 600)
    .returns(6)
  // highlight-end

  await client
    .post('/transfer')
    .form({ currency: 'INR', amount: 600 })

 // highlight-start
  mock.verify()
  mock.restore()
  // highlight-end
})
```

## Mocking network requests
You can use [nock](https://github.com/nock/nock) to mock the outgoing network requests. Since nock works by overriding the Node.js `http.request`, it works with almost every HTTP client, including `axios` and `got`.

Following is an example to mock the `charges` API of Stripe.

```ts
// title: test_helpers/mocks.ts
import nock from 'nock'

export function mockStripeCharge() {
  return nock('https://api.stripe.com/v1')
    .post('/charges')
    .reply(201, (_, requestBody) => {
      return {
        id: 'ch_3KjEE62eZvKYlo2C0n3A7N3E',
        object: 'charge',
        amount: requestBody.amount,
      }
    })
}
```

Now, you can use the `mockStripeCharge` helper as follows.

```ts
import { mockStripeCharge } from 'TestHelpers/mocks'

test('complete purchase with stripe charge', async () => {
  mockStripeCharge()
  // Make a call to stripe API here
})
```
