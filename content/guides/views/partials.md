---
summary: Reference to partials in edge
---

As the name suggests, partials are a way to extract a chunk of markup to its file and then re-use it across multiple templates.

Keeping the website **header**, **logo**, **footer**, and **sidebar** in its file are some common use cases for partials.

## Basic example

Let's create a standard webpage with a header, sidebar, main, and footer using partials.

#### 1. Create the following file structure

```sh
├── views
│   ├── partials
│   │   ├── footer.edge
│   │   ├── header.edge
│   │   └── sidebar.edge
│   └── home.edge
```

#### 2. Write the following content inside the respective partials

```edge
// title: partials/header.edge
<header class="header"></header>
```

```edge
// title: partials/sidebar.edge
<div class="sidebar"></div>
```

```edge
// title: partials/footer.edge
<footer class="footer"></footer>
```

#### 3. Write the following markup inside the `home.edge` file.

```edge
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title></title>
  <style>
    * { margin: 0; padding: 0; }
    .header { height: 60px; background: rgba(255,138,0,.2); }
    .layout { height: calc(100vh - 100px); display: flex; }
    .sidebar { height: 100%; background: rgba(156, 39, 176, 0.2); width: 250px; }
    main { height: 100%; background: #f7f7f7; flex: 1 }
    .footer { height: 40px; background: #5e5e5e; }
  </style>
</head>
<body>
  @include('partials/header')

  <section class="layout">
    @include('partials/sidebar')
    <main></main>
  </section>

  @include('partials/footer')
</body>
</html>
```

#### 4. Result

![](https://res.cloudinary.com/adonis-js/image/upload/q_auto,f_auto/v1617089390/v5/edge-partials-layout.png)

## The `@include` tag

The `@include` tag is responsible for loading and inlining the partials.

- It accepts only a single argument, that is, the partial path relative from the views directory
- The path can also be dynamic. Meaning you can use variables to define the partial path
- The partial have access to the parent template state

Also, there is an additional `@includeIf` tag to include the partial, only when a certain condition is `true`.

```edge
@includeIf(post.comments, 'partials/comments')
```
