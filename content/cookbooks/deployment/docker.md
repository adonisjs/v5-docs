---
datetime: 2021-11-19
author: Roth Fessler Maxime
avatarUrl: https://avatars.githubusercontent.com/u/57860498?v=4
summary: Cookbook to deploy AdonisJS application to Docker
---

This guide covers the steps for deploying an AdonisJS application to a [Docker Image](https://www.docker.com).

:::note
This guide assumes you have a reasonably basic understanding of how Docker images and containers are built and deployed.
:::

Deploying AdonisJS to a docker image isn't much different from deploying a simple NodeJS application to a docker image, however it has a few extra steps due to its build step.

You can build your project for production by running the following ace command. Learn more about the [TypeScript build process](../../guides/fundamentals/typescript-build-process.md)

```sh
node ace build --production
# OR use the npm script
npm run build
```

## Create the docker image

:::note
In the interest of simplicity this guide will only cover how to create a `Dockerfile` and not a `docker-compose.yaml` file.
:::

Before beginning make you sure you have docker engine version 17.05 or newer.

```sh
docker version
```

- In the root folder of your project create a `Dockerfile`
- In the root folder also create a `.dockerignore` file
- Add `node_modules` and `.env` file to the `.dockerignore` file as well as any other folders/files you don't want as part of the deployment
- Open your empty `Dockerfile` and paste the following inside of it

```sh
// title: dockerfile
# Pull latest NodeJs LTS version with Alpine Linux
# and rename it "builder" to re-use it for the next stage

FROM node:16-alpine3.14 AS builder
# Make a working directory for your app in the container
WORKDIR /home/app
# Copy all files to the container
COPY . .
# Install dependencies
RUN npm install
# and build the application
RUN node ace build --production

# Build stage for production

FROM node:16-alpine3.14
# Change the workdir
WORKDIR /home/app
# Copy files from builder to the new stage
COPY --from=builder /home/app/build ./build
WORKDIR /home/app/build
# Install production dependencies
RUN npm ci --production
# Open the port
EXPOSE 3333
# Start the server
CMD [ "node", "server.js" ]
```

## Building and Running

Now that we have a docker file we are ready to build and run the container.

```sh
docker build -t adonisjs .
```

Once the build is completed you'll be able to run it by running

```sh
docker container run -p 4444:3333 --name adonisapp --env-file .env adonisjs
```

Finally, navigate to [localhost:4444](http://localhost:4444/) to view your newly dockerized Adonis app.

From here you can deploy your images to almost any hosting platform on the market including Kubernetes.