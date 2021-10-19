---
summary: View helpers for the i18n class
---

Following is the list of helper properties and methods shared with the templates. 

### i18n
An instance of `i18n` for the default locale is shared with the templates as a global property.

However, the [DetectUserLocale](https://github.com/adonisjs/i18n/blob/develop/templates/DetectUserLocale.txt#L47) middleware overrides this property and shares a request specific instance for the current user's locale.

```edge
{{ i18n.locale }}
{{ i18n.formatNumber(100) }}
```

---

### t
The `t` helper is an alias for the `i18n.formatMessage` method.

```edge
{{ t('messages.title') }}
```

---

### getDefaultLocale
Returns the default locale for the application.

```edge
{{ getDefaultLocale() }}
```

---

### getSupportedLocales
Returns an array of the supported locales. 

```edge
{{ getSupportedLocales() }}
```
