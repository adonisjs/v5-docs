AdonisJS is a backend framework. It helps you create data-driven dynamic web applications. Using AdonisJS, you can **handle the HTTP requests**, **query the database**, **authenticate users**, **upload files**, **send emails**, **render templates** and do a lot more.

If you have ever worked with a different backend framework like Rails, Laravel, or Django, you can consider AdonisJS to be in the same boat.

## Who is it for?

Over the years, a typical overflow for creating an app in Node.js has been.

- Create an Express.js project.
- Install a dozen of middleware for every little thing. 
- Use your experience or read articles to come up with a project structure and naming conventions.
- Do some more research to find the packages for interacting with the database, authenticating users, and so on.
- If you work in a team or a dev shop, good luck documenting everything and explaining every decision.

All the upfront work you do, adds almost no value to the final product. Maybe it satiates your creative hunger.

---

On the other hand, AdonisJS does all this hard upfront. We have created high-level packages like the **ORM**, **authentication layer**, **template engine** with extreme care and attention to detail.

AdonisJS is not a wrapper we hacked together over the weekend. Instead, we have spent years getting it to the stage it is today.

Finally, to answer the main question. AdonisJS is for individuals and teams.

- Who wants to ship faster
- Cares about good development experience and good documentation.
- Wants to quickly onboard new developers without training them on a homegrown mini framework.
- Favors opinionated choices to save valuable time.

## Typescript usage

The framework is written in Typescript and the project structure we scaffold for you is also in Typescript.

We have been very particular about the way we leverage the static type system of Typescript and make sure to maintain a good balance between the visual noise and usage of static types.

### Infer types

We avoid manual type hinting and attempt to infer static types from the runtime code. Data validator and environment variables validation is an excellent example of it.

### Bundling experience

We make sure that the official CLI of AdonisJS should compile your Typescript code in both development and production. You should never have to install any additional build tools for it.

### Typescript influence on API design

We begin by designing the features to have good static types/IntelliSense and then work backward to simplify the API and remove visual noise. In other words, Typescript heavily dictates the way we design the framework APIs.

## Framework core and surrounding packages

AdonisJS is not a minimalist framework. We bundle all the essentials of creating a modern web app right into the core of the framework.

Also, we are not a monolith and provide extra functionality/features as first-party packages.

### Baked into the core

- HTTP server and middleware pipeline to handle incoming requests.
- A powerful router with support for subdomain routing and route groups.
- Baked in support for secure cookies and sessions.
- A rock-solid data validator.
- In-built support for file uploads.
- Static file server to serve the frontend assets.
- Modules for password hashing and encryption.
- And, a lot more.

### ORM

AdonisJS is one of the rarest framework to ship with a SQL ORM built on top of the Active Record pattern.

It comes with a query builder built on top of knex, migrations system, data models, model factories and database seeders.

Make sure to check the official documentation to learn more.

### Authentication layer

AdonisJS has a diverse authentication system. You can authenticate users using the standard sessions, or generate API tokens for stateless auth.

Also, you can `@adonisjs/ally` package to authenticate users via social platforms like Twitter, Google, Github and so on.

### Authorization layer

Authorization support is also baked into the framework via `@adonisjs/bouncer` package. Bouncer enables you to define permissions as policies and authenticate user actions against them.

### Template engine

### CLI framework and REPL

## Framework sponsors
