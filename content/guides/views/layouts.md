---
summary: Learn how to create and use layouts in edge
---

Layouts in Edge allow you to define the main layout for your pages and then override specific sections as needed.

## Basic example

Let's create a standard webpage using layouts.

#### 1. Create the following file structure

```
.
├── views
│   ├── layouts
│   │   └── main.edge
│   └── home.edge
```

#### 2. Paste the following markup to the layout file.

```edge
// title: resources/views/layouts/main.edge
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ title }}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.1/css/bulma.min.css">
  </head>
  <body>
    <nav class="navbar is-dark" role="navigation" aria-label="main navigation">
    </nav>

    @!section('body')

    <footer class="footer">
    </footer>
  </body>
</html>
```

#### 3. Paste the following markup to the `resources/views/home.edge` file.

```edge
// title: resources/views/home.edge
@layout('layouts/main')
@set('title', 'Home page')

@section('body')
  <section class="hero is-warning">
    <div class="hero-body">
      <p class="title">
        Title
      </p>
      <p class="subtitle">
        Subtitle
      </p>
    </div>
  </section>
@end
```

#### 4. Render the view, and you will end up with the following result

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1617089516/v5/edge-layout.png)

## The `layout` tag

The layout tag is used to define the layout for a given template.

- It must appear on the first line of the template. Otherwise, it will be ignored.
- You can only use one layout per template
- The layout name has to be static and cannot be defined using runtime variables.

## The `section` tag

The section tag is a placeholder exposed by a layout for injecting content. A layout can define as many sections as it wants, and the parent template can override them when necessary.

In the following example, the layout renders the scripts tags inside the `scripts` section. This allows all the pages to use these scripts or override them completely by re-defining the same section with different script tags.

#### Layout

```edge
@section('scripts')
  <script src="./vendor.js"></script>
  <script src="./app.js"></script>
@end
```

#### Parent template overriding everything

```edge
@section('scripts')
  <script src="./vendor.js"></script>
  <script src="./admin.js"></script>
@end
```

#### Parent template appending to existing scripts

```edge
@section('scripts')
  @super {{-- Super means inherit --}}
  <script src="./autocomplete.js"></script>
@end
```

- The name for all the section tags must be unique.
- The section name has to be static and cannot be defined using runtime variables.
- You cannot have nested sections.
- All sections must be at the top level. This constraint is similar to ESM exports in JavaScript, where each `export` statement is at the **top level** and **unique**.
