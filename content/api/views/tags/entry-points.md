The `@entryPointScripts` and the `@entryPointStyles` tags renders the required `script` and `link` elements for a given entrypoint.

- Both are inline tags
- They accepts the name of the entrypoint defined inside the `webpack.config.js` file.

:::note

Make sure to read the [assets manager](../../../guides/http/assets-manager.md) guide to learn more about entrypoints.

:::

```edge
<!-- Renders scripts -->
@entryPointScripts('app')

<!-- Renders styles -->
@entryPointStyles('app')
```

You can control the attributes of the script and link elements by modifying the `assets.script.attributes` and `assets.style.attributes` objects inside the `config/app.ts` file.

```ts
export const assets: AssetsManagerConfig = {
  driver: 'encore',
  publicPath: Application.publicPath('assets'),

  script: {
    // highlight-start
    attributes: {
      defer: true,
    },
    // highlight-end
  },

  style: {
    // highlight-start
    attributes: {},
    // highlight-end
  },
}
```
