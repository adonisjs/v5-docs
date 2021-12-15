---
summary: Learn how to write conditionals inside Edge templates
---

You can write conditionals using the `@if`, `@elseif` and the `@else` tags. All three tags works similar to the JavaScript if/else statements.

```edge
@if(user)
  <p> {{ user.username }} </p>
@end
```

```edge
@if(user.fullName)
  <p> Hello {{ user.fullName }}! </p>
@elseif(user.firstName)
  <p> Hello {{ user.firstName }}! </p>
@else
  <p> Hello Guest! </p>
@end
```

The inverse of the `@if` tag is the `@unless` tag. You might find it expressive to write the NOT IF statements.

```edge
@unless(account.isActive)
  <p> Please verify the email address to activate your account </p>
@end
```
