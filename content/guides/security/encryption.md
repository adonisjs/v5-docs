---
summary: Reference guide for the Encryption module
---

You can make use of the AdonisJS encryption module to encrypt and decrypt values in your application.

```ts
import Encryption from '@ioc:Adonis/Core/Encryption'

const encrypted = Encryption.encrypt('hello-world')
```

The encryption is based on the `aes-256-cbc` algorithm, and uses the `appKey` saved inside the `config/app.ts` file as the secret for encryption.

## Encrypting/decrypting values

The encryption module also generates a unique [iv](https://en.wikipedia.org/wiki/Initialization_vector) for every encryption call. Hence encrypting the same value twice will result in a different visual output.

#### encrypt

The `Encryption.encrypt` method encrypts a given value.

```ts
Encryption.encrypt('hello-world')
```

You can also optionally define an expiration date. After the given timeframe, the decryption will fail.

```ts
Encryption.encrypt('hello-world', '2 hours')
```

Finally, you can also define a purpose for the encryption. This is usually helpful when you are encrypting the value for a specific task or resource.

For example, you want to generate an encrypted link for sharing a post and then want to make sure that the link only works if the post id is the same as the one you generated the link.

```ts
const key = Encryption.encrypt(`post-${post.id}`, '30mins', String(post.id))

return `/posts/${post.id}?key=${key}`
```

During decryption, you can check if the post id matches or not as follows.

```ts
Encryption.decrypt(key, String(params.id))
```

#### decrypt

The `Encryption.decrypt` method decrypts the encrypted value. Returns `null` when unable to decrypt the value.

```ts
Encryption.decrypt(value)
Encryption.decrypt(value, purpose)
```

## Supported data types

You can encrypt the following data types.

```ts
// Object
Encryption.encrypt({
  id: 1,
  fullName: 'virk',
})

// Array
Encryption.encrypt([1, 2, 3, 4])

// Boolean
Encryption.encrypt(true)

// Number
Encryption.encrypt(10)

// Date objects are converted to ISO string
Encryption.encrypt(new Date())
```

## Using a custom secret key

The Encryption module uses the `appKey` defined inside the `config/app.ts` file as the secret for encrypting values. However, you can create a child instance with a custom secret key as well.

```ts
const userEncryptor = Encryption.child({
  secret: user.secret,
})

userEncryptor.encrypt('hello-world')
```
