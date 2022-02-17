---
summary: Learn how to create signed URLs using the Route module
---

Signed URLs provide a neat way to generate URLs with a hash signature appended to them. The hash ensures that the generated URL is not modified or tampered with.

:::note

The `makeSignedUrl` function accepts the same set of arguments accepted by the [Route.makeUrl](../http/routing.md#url-generation) method. So make sure to read the docs for `Route.makeUrl` as well.

:::

For example:

```ts
Route.makeSignedUrl('verifyEmail', {
  email: 'foo@bar.com',
})

// /verify/foo@bar.com?signature=eyJtZXNzYWdlIjoiL3ZlcmlmeS9mb29AYmFyLmNvbSJ9.Xu-a0xu_E4O0sJxeAhyhUU5TVMPtxHGNz4bY9skxqRo
```

The signature appended to the URL is generated from the complete URI string. Changing any portion of the URL will result in an invalid signature.

## Verifying signature

The route for which you generated the signed URL can verify the signature using the `request.hasValidSignature()` method.

```ts
Route.get('/verify/:email', async ({ request }) => {
  if (request.hasValidSignature()) {
    return 'Marking email as verified'
  }

  return 'Signature is missing or URL was tampered.'
}).as('verifyEmail')
```

## Expiring signed URLs

By default, the signed URLs live forever. However, you can add expiry to them at the time of generating one.

```ts
Route.makeSignedUrl(
  'verifyEmail',
  {
    email: 'foo@bar.com',
  },
  {
    expiresIn: '30m',
  }
)
```

## Using the URL builder

You can also make use of the URL builder to generate signed URLs.

```ts
Route.builder()
  .params({ email: 'foo@bar.com' })
  .makeSigned('verifyEmail', { expiresIn: '30m' })
```
