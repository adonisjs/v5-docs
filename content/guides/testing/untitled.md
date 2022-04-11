
## Sinon mocks

AdonisJS does not have inbuilt support for mocking and we recommend you to use third party libraries like [SinonJS](https://sinonjs.org/).

Assuming you have an `ExchangeService` that returns the current exchange rate between two currencies.

```ts
export default class ExchangeService {
  constructor (private baseCurrency: string) {}

  public getRate(currency: string, amount: number) {
  }
}
```

During tests, instead of fetching the live exchange rates you can mock the `getRate` method to return a static value.

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

We recommend you to use [nock](https://github.com/nock/nock) to mock the outgoing network requests. Since nock works by overriding the Node.js `http.request`, it works with almost every HTTP client including `axios` and `got`.

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

test('complete purchase with stripe charge', async ({ client }) => {
  mockStripeCharge()
  await client.post('/purchase')
})
```

