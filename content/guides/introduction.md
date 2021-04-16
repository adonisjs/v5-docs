Welcome to AdonisJS. If you are just getting started with the framework, then you are at the right place.

This document aims to give you a birds-eye view of the framework so that you have a rough idea about how it feels to create an AdonisJS app. When you're ready to make a project, you can [start with the tutorial]() or [dive right into the technical guides]().

## What is AdonisJS?

AdonisJS is a backend framework. It helps you create data-driven dynamic web applications. Using AdonisJS, you can **handle the HTTP requests**, **query the database**, **authenticate users**, **upload files**, **send emails**, **render templates** and do a lot more.

If you have ever worked with a different backend framework like Rails, Laravel, or Django, then you can consider AdonisJS to be in the same boat.

The space of frameworks is really crowded, so let us help clear some of the misceptions.

- AdonisJS is **NOT a wrapper** on top of any other low level Node framework. It is built from ground up with a fresh approach.
- It is **NOT a hybrid framework** like Next.js. Infact, AdonisJS doesn't concern itself with the frontend ecosystem at all. It focuses entirely on the backend.

## Typescript usage
You will write your AdonisJS applications using Typescript, as we believe that static types does help mitigate errors to some extent and the intellisense improves the speed at which you write the code.

We have been very particular about the way we leverage the static type system of Typescript and make sure to maintain a good balance between the visual noise and usage of static types. In a nutshell,

- We avoid manual type hinting and attempt to infer static types from the runtime code. [Data validator](./validator/introduction.md) and [environment variables validation](./fundamentals/environment-variables.md#validating-environment-variables) is a great example of it.
- We begin by designing the features to first have good static types/intellisense and then work backwards from there to simplify the API and remove visual noise. In other words, Typescript heavily dictates the way we design the framework APIs.
- We make sure that the official CLI of AdonisJS should be able to compile your Typescript code in both development and production. You should never have to install any additional build tools for it.

## Focus on developer experience
Keywords like **developer experience** are subjective and that is why you see them appearing almost everywhere. So let us take a step ahead and explain our approach towards good developer experience.

### First, what is not a good developer experience?

#### A fragmented codebase using dozens of packages from different authors.
You can hardly expect any consistency in the naming conventions when the package for every little feature is written by a different author.

#### Using frameworks with no opinions or guidance.
You will create your own internal standards around directory structure, config management, deployment strategies and so on. All this will result in ever changing codebase and making it harder to hire and onboard new developers.

#### Using different CLI programs for different use cases. 

Since, most of your packages are framework agnostic, they all have to ship the necessary tooling to use the package. For example: 

- You will `tsc --watch` to compile your typescript code
- Run `typeorm migration:run` command to execute the TypeORM migrations
- And, maybe use `nodemon` to restart the HTTP server on file change

The list will continue to grow as you will grab new package from npm.

## Framework core
Creating a web application isn't really about assembling packages from npm. AdonisJS ships with a feature rich core, so that you can get up and running in minutes (if not seconds).

- HTTP server to handle incoming requests
- A good and powerful router to handle requests routing and maybe serve multiple subdomains from the same codebase
- Ability to work with cookies and sessions
- Validate and sanitize the user input
- Handle file uploads and store them locally or sent them to a file management service like S3.
- Logger to write log messages for critical events.
- Able to quickly deploy the code and maybe do rolling deployments to avoid downtimes.

## First party packages
On top of the framework core, you can use one of the following first party packages written by the AdonisJS core team.

- [@adonisjs/lucid]()
- [@adonisjs/view]()
- [@adonisjs/mail]()
- [@adonisjs/shield]()
- [@adonisjs/auth]()
- [@adonisjs/bouncer]()
- [@adonisjs/ally]()
- [@adonisjs/lucid-slugify]()
- [@adonisjs/redis]()
- [@adonisjs/repl]()

## Sponsorsed by

## Resources

- [Awesome AdonisJS]()
- [AdonisJS Vscode go to controllers]()
- [AdonisJS Vscode go to view]()
- [AdonisJS Sublime text extension]()
- [Interia adapter for AdonisJS]()
- []()

## Asking for help

- Github discussions
- Github issues
- Discord
- Twitter

