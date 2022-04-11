Validates the value to be formatted as a valid URL string. 

```ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

{
  website: schema.string([
    rules.url()
  ])
}
```

Along with the format validation, you can also **enforce the url to be from a certain domain**. For example:

```ts
{
  twitterProfile: schema.string([
    rules.url({
      // Only twitter.com urls are allowed
      allowedHosts: ['twitter.com']
    })
  ])
}
```

The inverse of `allowedHosts` is the `bannedHosts`.

```ts
{
  website: schema.string([
    rules.url({
      bannedHosts: [
        'acme.com',
        'example.com'
      ]
    })
  ])
}
```

## Validation options

Following is the list of options for validate a URL string

```ts
{
  website: schema.string([
    rules.url({
      protocols: ['http', 'https', 'ftp'],
      requireTld: true,
      requireProtocol: false,
      requireHost: true,
      allowedHosts: [],
      bannedHosts: [],
      validateLength: false
    })
  ])
}
```

| Option | Description |
|---------|------------------|
| `protocols` | An array of allowed protocols ("http", "https", or "ftp"). Defining protocols will implicitly set the `requireProtocol` option to `true`. |
| `requireTld` | Ensure the tld is present in the URL. Defaults to `true`  |
| `requireProtocol` | Ensure the URL has protocol defined. Defaults to `false` |
| `requireHost` | Ensure the URL has the host defined. Defaults to `true` |
| `allowedHosts` | An array of allowed hosts. URLs outside the defined hosts will fail the validation. |
| `bannedHosts` | An array of banned hosts. URLs matching the defined hosts will fail the validation. |
| `validateLength` | Validate the length of the URL to be under or equal to **2083 charcters**. Defaults to `true`. |

## Normalizing url
You can normalize the URL using the `rules.normalizeUrl` method.

```ts
{
  website: schema.string([
    rules.url(),
    rules.normalizeUrl({
      ensureProtocol: 'https',
      stripWWW: true,
    })
  ])
}
```

| Option | Description |
|--------|-------------|
| `ensureProtocol` | The property ensures that the URL post validation has `https` protocol |
| `stripWWW` | Strips the `www` from the URL |
