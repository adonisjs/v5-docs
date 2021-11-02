---
datetime: 2021-11-02
author: Virk
avatarUrl: https://res.cloudinary.com/adonis-js/image/upload/v1619103621/adonisjs-authors-avatars/DYO4KUru_400x400_shujhw.jpg
summary: Cookbook to deploy AdonisJS application to your VPS using Cleavr
---

This guide covers the steps for deploying an AdonisJS application to your VPS using [Cleavr](https://cleavr.io).

Cleavr provides a first-class experience for AdonisJS applications, so deploying your apps only takes a few clicks.   


## Prerequisites

This guide assumes you have the following ready-to-go. 

- An account set up with [Cleavr](https://cleavr.io)
- A provisioned server

## Step 1: Add an Adonis site

On your server in Cleavr, add a new **Adonis** site. 

:::note

To save time, you can set up your database during the site creation step and the connection configs will automatically be added to the environment variables. 

:::

## Step 2: Configure Web App

After the site has been successfully added to your server, navigate to the web app section to configure your app. 

#### Connect repository

In Settings > Code Repository, connect your web app to the git repository that your code resides on. 

#### Configure environment variables 

Cleavr adds default environment variables for your AdonisJS app. Configure any additional required variables. 

#### Configure deployment hooks

A default set of deployment hooks are automatically added for your AdonisJS app, which will be enough for most projects. You may add additional deployment hooks for your needs. 

:::note

If you included setting up a database while adding your AdonisJS site, the **Migrate Database** deployment hook will be enabled by default. You may disable the deployment hook after the initial deployment. 

:::

## Step 3: Deploy your Web App

After you have completed configuring your web app, you can now deploy your project! 

View the [Cleavr Adonis deployment guide](https://docs.cleavr.io/guides/adonis) and the [Cleavr Adonis troubleshooting guide](https://docs.cleavr.io/adonis-deployments) for additional info. 
