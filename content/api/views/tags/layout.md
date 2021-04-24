The `@layout` tag allows you define the layout template for the current template.

- The tag must be used on the first line of the template. Otherwise, it will be ignored.
- It is an inline tag and accepts the layout path.
- You cannot define a layout at runtime. The value has to be a static string, since layouts are processed at the compile time.

```edge
@layout('layouts/main')
```

## section
The template using the layout must define all the markup inside the sections exported by the layout. Any content outside of the `@section` tag is ignored.

- `@section` is a block level tag.
- It accepts the section name as the only argument.
- The section name has to be a static string. Runtime values are not allowed.
- All section tags must appear as top level tags. Meaning you cannot nest a section inside a conditional or a loop.

```edge
@layout('layouts/main')

@section('body')
  The content for the body section
@end

@section('footer')
  The content for the footer section
@end
```

The layout also has to export the sections with the same name.

```edge
@!section('body')
@!section('footer')
```

## super
The `@super` tag allows you to inherit the existing content of the section. It is an inline tag and does not accept any arguments.

```edge
@layout('layouts/main')

@section('scripts')
  @super
  <script src="{{ asset('autocomplete.js') }}"></script>
@end
```
