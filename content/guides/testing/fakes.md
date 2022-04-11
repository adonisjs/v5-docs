AdonisJS ships with fake implementations for most of its first-party packages. You can use fakes during testing to have a better testing experience without manually mocking parts of your codebase.

## Mail fake
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
  assert.lengthOf(mailer.size(), 1)
  assert.isTrue(mailer.exists((mail) => {
    return mail.subject === 'Welcome to AdonisJS'
  }))

  Mail.restore()
  // highlight-end
})
```

Calling `Mail.fake` creates a fake only for the default mailer. However, you can explicitly pass the name(s) of the mailers to fake.

```ts
// Fake the default mailer
Mail.fake()

// Fake smtp and s3 mailers
Mail.fake(['smtp', 's3'])
```

## Events
You can fake events by calling the `Event.fake` method. The method accepts an optional array of events to fake. Otherwise, all upcoming events are faked.

```ts
import Event from '@ioc:Adonis/Core/Event'

// Fake all events
Event.fake()

// Fake specific events
Event.fake(['new:user', 'update:email'])

// Restore fake
Event.restore()
```

The `Event.fake` method returns a fake emitter you can use to fetch later or find events.

```ts
const emitter = Event.fake()

assert.equal(emitter.size(), 1)
assert.isTrue(emitter.exists('new:user'))
assert.isTrue(emitter.exists((event) => {
  return event.name === 'new:user' && event.data.id === 1
}))
```

## Drive
You can fake the Drive implementation by calling the `Drive.fake` method. By default, only the default disk is faked. However, you can define disk names explicitly as well.

```ts
import Drive from '@ioc:Adonis/Core/Drive'

// Fake default disk
Drive.fake()

// Fake local and s3
Drive.fake(['s3', 'local'])

// Restore fake
Drive.restore()
Drive.restore(['s3', 'local'])
```

The `Drive.fake` method returns the fake drive object you can use to fetch later or find files.

```ts
const drive = Drive.fake()

assert.isTrue(await drive.exists('avatar.jpg'))

// Size is above 2mb
assert.isBelow(await drive.bytes('avatar.jpg'), 1000 * 1000 * 20)
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
