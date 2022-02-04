---
datetime: 2022-02-02
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

Before beginning make you sure you have docker engine version `17.05` or newer.

```sh
docker version
```

- In the root folder of your project create a `Dockerfile`
- In the root folder also create a `.dockerignore` file
- Add `node_modules` and `.env` file to the `.dockerignore` file as well as any other folders/files you don't want as part of the deployment

```dockerignore
// title: .dockerignore
node_modules
.env
.git
build
```
- Open your empty `Dockerfile` and paste the following inside of it

```dockerfile
# Pull latest NodeJs LTS version with Alpine Linux
# and rename it "base" to re-use it for the next stages
FROM node:16-alpine3.14 AS base
# Make a working directory for your app in the container
WORKDIR /home/app

# Build stage for build
FROM base AS builder
# Copy package and package-lock
COPY package*.json ./
# Install dependencies
RUN npm ci
# Copy all other files to the container
COPY . .
# and build the application
RUN node ace build --production

# Build stage for production
FROM base AS production
# Add a process supervisor and init system
RUN apk add dumb-init
# Copy package and package-lock
COPY package*.json ./
# Install production dependencies
RUN npm ci --production
# Copy files from builder to the new stage
COPY --chown=node:node --from=builder /home/app/build .
# Use a non-root user
USER node
# Expose the port
EXPOSE 3333
# Start the server
CMD [ "dumb-init", "node", "server.js" ]
```

## Building and Running

Now that we have a docker file we are ready to build and run the container.

```sh
docker build -t adonisjs .
```

:::note
Make you sure you have set the `NODE_ENV` into `.env` to production
:::

Once the build is completed you'll be able to run it by running

```sh
docker container run -p 4444:3333 --name adonisapp --env-file .env adonisjs
```

Finally, navigate to [localhost:4444](http://localhost:4444/) to view your newly dockerized Adonis app.

From here you can deploy your images to almost any hosting platform on the market including Kubernetes.