---
summary: I18n Manager class API reference
---

The [I18n manager class](https://github.com/adonisjs/i18n/blob/develop/src/I18nManager/index.ts) exposes the API to create locale-specific instances of the `I18n` class and also extend the default capabilities by adding custom formatters and loaders.

You can import the singleton instance of the `I18nManager` class as follows:

```ts
import I18n from '@ioc:Adonis/Addons/I18n'
```

## Methods/Properties
Following is the list of methods/properties available on the I18n Manager class.

### defaultLocale
A read-only reference to the `defaultLocale` defined inside the config file.

```ts
import I18n from '@ioc:Adonis/Addons/I18n'

console.log(I18n.defaultLocale)
```

---

### locale
Returns an instance of the [I18n](./i18n.md) class for a given locale.

```ts
import I18n from '@ioc:Adonis/Addons/I18n'

const en = I18n.locale('en')
const fr = I18n.locale('fr')
```

---

### getSupportedLocale
Returns the best matching supported locale for the user language(s). The method uses the [content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation) to find the supported locale.

```ts
import I18n from '@ioc:Adonis/Addons/I18n'

const bestMatch = I18n.getSupportedLocale(['en', 'fr'])
```

---

### getFallbackLocale
Returns the fallback locale for a given locale. The method looks up the `fallbacks` object defined within the config file. It returns the `defaultLocale` when no fallback is found.

```ts
import I18n from '@ioc:Adonis/Addons/I18n'

I18n.getFallbackLocale('ca')
```

---

### supportedLocales
Returns an array of locales supported by the application. The config value is used when defined explicitly within the config file. Otherwise, we will infer the supported locales from the language directories.

```ts
import I18n from '@ioc:Adonis/Addons/I18n'

I18n.supportedLocales() // ['en', 'fr', 'it']
```

---

### loadTranslations
Loads the translations using the configured loaders. The translations the further cached within the memory. 

If you want to refresh the translations, use the [reloadTranslations](#reloadtranslations) method.

:::note
This method is called automatically during the application boot.
:::

```ts
import I18n from '@ioc:Adonis/Addons/I18n'

await I18n.loadTranslations()
```

---

### reloadTranslations
Reload translations from all the configured loaders. Each call to this method will make the loaders fetch translations from the source.

```ts
import I18n from '@ioc:Adonis/Addons/I18n'

await I18n.reloadTranslations()
```

---

### getTranslations
Returns an object of cached translations. The object is a merged copy of all the translations loaded from multiple configured loaders.

```ts
import I18n from '@ioc:Adonis/Addons/I18n'

I18n.getTranslations()
```

---

### getTranslationsFor
Returns the translations for a given locale.

```ts
import I18n from '@ioc:Adonis/Addons/I18n'

I18n.getTranslationsFor('en')
I18n.getTranslationsFor('fr')
```

---

### getFormatter
Returns an instance of the configured translations formatter.

```ts
import I18n from '@ioc:Adonis/Addons/I18n'

I18n.getFormatter()
```

---

### prettyPrint
A helper method to pretty-print the payload of the `i18n:missing:translation` event.

```ts
import Event from '@ioc:Adonis/Core/Event'
import I18n from '@ioc:Adonis/Addons/I18n'

Event.on('i18n:missing:translation', I18n.prettyPrint)
```

---

### extend
Extend the default capabilities by adding custom formatters and translations loaders.

:::note
Make sure to read the [extensions guide](../../guides/digging-deeper/i18n.md#add-custom-message-formatter) for an in-depth explaination for adding custom formatters and loaders.
:::

```ts
import I18n from '@ioc:Adonis/Addons/I18n'

I18n.extend('name', 'formatter', () => new Impl())
I18n.extend('name', 'loader', () => new Impl())
```
