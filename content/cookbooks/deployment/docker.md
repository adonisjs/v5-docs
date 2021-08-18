---
datetime: 2021-08-18
author: Anth Rogan
avatarUrl: https://res.cloudinary.com/dcxwnq8xz/image/upload/v1629287996/30973884_c6w9sp.jpg
summary: Cookbook to deploy AdonisJS application to a Docker Image & Container
---

This guide covers the steps for deploying an AdonisJS application to a [Docker Image](https://www.docker.com/).

:::note
This guide assumes you have a reasonably basic understanding of how Docker images and containers are built and deployed.
:::

Deploying AdonisJS to a docker image isn't much different from deploying a simple NodeJS application to a docker image, however it has a few extra steps due to its build step. All this means is you need to navigate around the work directory a little bit more.

You can build your project for production by running the following ace command. Learn more about the [TypeScript build process](../../guides/fundamentals/typescript-build-process.md)

```sh
node ace build --production

# OR use the npm script
npm run build
```

## Creating your Dockerfile

:::note
In the interest of simplicity this guide will only cover how to create a `Dockerfile` and not a `docker-compose.yaml` file.
:::

- In the root folder of your project create a `Dockerfile`
- In the root folder also create a `.dockerignore` file
- Add `node_modules` to the `.dockerignore` file as well as any other folders/files you don't want as part of the deployment
- Open your empty `Dockerfile` and paste the following inside of it

```dockerfile
// title: Dockerfile
# Pick the latest Node LTS version
FROM node:14

# Make a working directory for your app in the image
WORKDIR /home/node

# Move your files to the image
COPY . .

# Install build dependencies
RUN yarn

# Build the application
RUN yarn build
```

Now that you have the first stage of your image in terms of building it, you need to sort out running your app. Now is also a good time to copy your `.env` to your build folder, especially if you are building with CI/CD tools like Azure Dev or CircleCI and you are keeping your `.env` files in secure areas of the toolset.

```dockerfile
// title: Dockerfile
# Pick the latest Node LTS version
FROM node:14

# Make a working directory for your app in the image
WORKDIR /home/node

# Move your files to the image
COPY . .

# Install build dependencies
RUN yarn

# Build the application
RUN yarn build

# Open our build folder
WORKDIR /home/node/build

# Copy your .env file - This could be any name env file e.g. someFile.env
COPY .env .

# install production dependencies
RUN yarn install --production

#Expose the port
EXPOSE 3333

# If you have renamed your .env file make sure to set its environment path
# ENV ENV_PATH someFile.env

# Set your node environment
ENV NODE_ENV=production

# list your files and run the server
CMD ls && node server.js 
```

You should now have a finished `Dockerfile` ready to build your applications image.

:::note
Listing out the build folders is really simple but really useful when building docker files, especially when your build process complexity increases.
:::

## Building and Running

Now that we have a docker file we are ready to build and run the container.

```bash
docker build -t adonisapp .
```

Once the build is completed you'll be able to run it by running

```bash
docker run -p 4444:3333 adonisapp
```

Your console should show something similar to the below
```cmd
// title: Console Output
ace
ace-manifest.json
app
commands
config
contracts
env.js
env.js.map
node_modules
package.json
providers
server.js
server.js.map
start
tsconfig.tsbuildinfo
yarn.lock
{"level":30,"time":1629303482826,"pid":9,"hostname":"40554be5b928","name":"hello-world","msg":"started server on 0.0.0.0:3333"}
```

Finally, navigate to [localhost:4444](http://localhost:4444/) to view your newly dockerized Adonis app.

From here you can deploy your images to almost any hosting platform on the market including Kubernetes.
