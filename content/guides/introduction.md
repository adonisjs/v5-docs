---
summary: Technical introduction to the framework and documentation structure.
---

Welcome to AdonisJS!

This is the official documentation website for the framework. We have divided the documentation into multiple groups, each trying to address a specific use case or audience.

Please read the [AdonisJS at a glance](https://adonisjs.com/adonisjs-at-glance) document if you are unsure whether AdonisJS will fit your needs or match the programming style.

## TypeScript usage

AdonisJS is a backend framework for Node.js. The framework is written in TypeScript, and the application you will create using AdonisJS is also going to be in TypeScript.

We are very particular about how we leverage TypeScript and maintain a good balance between the static type safety and the visual noise.

If you have never used TypeScript, we recommend learning the basics of the language first and then using AdonisJS.

## Familiarity with Node.js 

We also expect you to be familiar with the Node.js ecosystem and asynchronous programming in general. Suppose you are coming from a threaded language like PHP or Ruby. In that case, we recommend educating yourself with the Node.js event loop and understand how it is different from a threaded environment.


## Guides

The technical guides are the in-depth documentation of the framework and cover every single topic and feature of the framework.

The guides also have documentation for the official packages of AdonisJS, i.e., Lucid ORM, template engine, Redis, and so on.

## Reference

Modules with larger API surfaces like **Database** and **Validator** are also documented inside the reference guides.

Fitting all the validation rules, the database query builder methods within guides will overcrowd them, and hence they are moved to the reference guides.

## Cookbooks

Cookbooks are actionable guides to help you achieve a practical task. Also, feel free to contribute to cookbooks by sending a PR.

## Editor extensions

Editors with support for TypeScript are all you need to work with your AdonisJS applications. However, the following is the list of extensions to enhance your developer experience.

:::note

We are looking for contributors to add support for edge template syntax to other editors as well. Here is an [extensive syntax guide](https://github.com/edge-js/syntax) to test your integration.

:::

- [VS Code edge templating syntax](https://marketplace.visualstudio.com/items?itemName=luongnd.edge) is a community package to syntax highlight the edge templates.
- [VS code go to controller](https://marketplace.visualstudio.com/items?itemName=stef-k.adonis-js-goto-controller) is a community package to add **click + go to controller** support.
- [VS code go to view](https://marketplace.visualstudio.com/items?itemName=stef-k.adonis-js-goto-view) is a community package to add **click + go to a template file** support.
- [Sublime text edge templating syntax](https://github.com/edge-js/edge-sublime) is an official extension to syntax highlight the edge templates.
