The `@if`, `@elseif` and the `@else` tags allows you to write conditionals inside the Edge templates. 

- The `@if` and the `@elseif` tag accepts the expression to evaluate as the only argument.
- Only the `@if` tag needs to be closed explicitly with the `@end` statement. Other tags must appear within the opening and closing if block.

```edge
<!-- Start if -->
@if(user.fullName)
  <p> Hello {{ user.fullName }}! </p>
@elseif(user.firstName)
  <p> Hello {{ user.firstName }}! </p>
@else
  <p> Hello Guest! </p>
<!-- End if -->
@end
```

You can use the `@unless` tag in place of the `@if` tag to write an inverse if statement.

```edge
@unless(account.isActive)
  <p> Please verify the email address to activate your account </p>
@end
```
