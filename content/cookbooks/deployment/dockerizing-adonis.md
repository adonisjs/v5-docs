---
datetime: 2021-12-15
author: hlozancic
avatarUrl: https://avatars.githubusercontent.com/u/10560710?v=4
summary: Learn how to utilize docker for development and deployment of Adonis apps
---

In this guide you will learn how to use Docker with Adonis. You will be able to use this logic to develop, debug and deploy Adonis apps using docker.
Also, we will cover how to crate docker-compose.yml file that will also set up Redis and PostgreSQL services.

You can utilize same docker-compose.yml file to spin up and develop/deploy your next Adonis project in matter of minutes!

:::note
This guide assumes you have basic understanding of Docker and you know how to build or start Docker images.
:::

## Creating Dockerfile

We will use [Docker multistage build](https://docs.docker.com/develop/develop-images/multistage-build/) because it's a best practice to keep your Docker image small and able to cache build steps better.

So, let's start with first stage...

### First stage - Base

First stage will be our _base_ layer which will later on be used for other steps.

```Dockerfile
ARG NODE_IMAGE=node:16.13.1-alpine

FROM $NODE_IMAGE AS base
RUN apk --no-cache add dumb-init
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp
```

We are setting `ARG NODE_IMAGE` because later on, with this way, you can simply change your Node.js version when building new images from Dockerfile.
Also, we are installing [dumb-init](https://github.com/Yelp/dumb-init) because Docker creates processes as PID 1, and they must inherently handle process signals to function properly. 
Dumb-init is lightweight init system which will properly spawn Node.js runtime process with signals support.

Also, we are changing user to `node` because Docker defaults to running the process in the container as the root user, which is not recommended.

:::note
If you want to know more about Docker best practices for Node.js, I strongly recommend this [Synk cheatsheet](https://snyk.io/wp-content/uploads/10-best-practices-to-containerize-Node.js-web-applications-with-Docker.pdf)
:::

### Second stage - dependencies

Our second stage will be used to install all dependencies, so we can build our app in later stages.

```Dockerfile
FROM base AS dependencies
COPY --chown=node:node ./package*.json ./
RUN npm ci
COPY --chown=node:node . .
```

Take note that we are only using `COPY` to copy package.json and package-lock.json files in this stage.
This way Docker will be able to completely cache this stage if package.json or package-lock.json had no changes.
This is great practice, especially if you use some kind of CI/CD in your development environment, because it will drastically lower CI/CD deployment times. We often change code, but our dependencies stay the same.

### Third stage - build

We have everything to start our build phase! This very simple and self-explanatory stage.

```dockerfile
FROM dependencies AS build
RUN node ace build --production
```

### Fourth stage - production

Finally, we can create our last stage.

```dockerfile
FROM base AS production
ENV NODE_ENV=production
ENV PORT=$PORT
ENV HOST=0.0.0.0
COPY --chown=node:node ./package*.json ./
RUN npm ci --production
COPY --chown=node:node --from=build /home/node/app/build .
EXPOSE $PORT
CMD [ "dumb-init", "node", "server.js" ]
```

We are making this stage from base stage to keep our image as small as possible.
Here we will install only `--production` dependencies and then copy our build assets `--from=build` stage that we run before.
This stage is made as production environment on purpose. You will see why later on when we explain how to use same Dockerfile for development.

Finally, we will start `node server.js` process but through `dumb-init` init system to properly spawn Node.js runtime process with signals support.

### All stages combined

We can now combine all the stages explained above and save our file to root of our Adonis project.

```dockerfile
// title: Dockerfile
ARG NODE_IMAGE=node:16.13.1-alpine

FROM $NODE_IMAGE AS base
RUN apk --no-cache add dumb-init
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp

FROM base AS dependencies
COPY --chown=node:node ./package*.json ./
RUN npm ci
COPY --chown=node:node . .

FROM dependencies AS build
RUN node ace build --production

FROM base AS production
ENV NODE_ENV=production
ENV PORT=$PORT
ENV HOST=0.0.0.0
COPY --chown=node:node ./package*.json ./
RUN npm ci --production
COPY --chown=node:node --from=build /home/node/app/build .
EXPOSE $PORT
CMD [ "dumb-init", "node", "server.js" ]
```

## Creating .dockerignore

To keep our Docker image small, it's always good practice to create .dockerignore file.

```gitignore
// title: .dockerignore
# Adonis default .gitignore ignores
node_modules
build
coverage
.vscode
.DS_STORE
.env
tmp

# Additional .gitignore ignores (any custom file you wish)
.idea

# Additional good to have ignores for dockerignore
Dockerfile*
docker-compose*
.dockerignore
*.md
.git
.gitignore
```

Now we are ready to build and/or deploy our Docker image!


## Creating docker-compose.yml

:::note
This step is not needed if you only wanted to create dockerized Adonis app.
:::

docker-compose.yml is a powerful configuration file. 
In this guide I will show you how you can utilize image that we just created to spin up development environment while working locally.

You will not need to install any services that your app uses, such as postgreSQL or redis, everything will run inside Docker environment.

:::note
docker-compose.yml can also be used as great way to spin up your app with all needed services in production too!
:::

```yaml
// title: docker-compose.yml
version: '3.8'

services:
  adonis_app:
    container_name: adonis_app
    restart: always
    build:
      context: .
      target: dependencies
    ports:
      - ${PORT}:${PORT}
      - 9229:9229
    env_file:
      - .env
    volumes:
      - ./:/home/node/app
      # Uncomment the below line if you developing on MacOS
      #- /home/node/app/node_modules
    command: dumb-init node ace serve --watch --node-args="--inspect=0.0.0.0"
```

If you only need docker-compose.yml to play with your Adonis app locally, this will be enough.
Notice that we are exposing `${PORT}` and `9229` port. This is because we will use this .yml to be able to debug our Node.js process (9229 is default debug port of Node.js).

:::note
If you're using encore you need to make sure that host and port from encore are correctly set, and you're exposing encore's port. An easy way of doing it is by simple changing ports and the command.

ports: 
  - ${PORT}:${PORT}
  - 9229:9229
  - 8080:8080

command: dumb-init node ace serve --watch --encore-args="--host ${HOST} --port 8080"
:::

Also, notice one more important thing: `target: dependencies`. This is where multistage Docker builds shine. We are using same Dockerfile for our development environment and we can use same file for production.
In this way, Docker will build everything until (and including) second stage. This is great because we don't need build and production stage while developing our app!

Finally, you can see that we are defining command in docker-compose.yml on last line. 
This is because we will build our image until `dependencies` stage. Also, we are running Adonis in `--watch` mode with Node.js inspector so we will be able to attach to this process and debug it through Docker!

## Adding PostgreSQL and Redis to our docker-compose.yml

App without database and/or some caching/session store mechanism is not a real app :)
Let's see how our docker-compose.yml can be changed to spin up necessary services to make real-world app.

```yaml
// title: docker-compose.yml
version: '3.8'

services:
  postgres:
    container_name: postgres
    image: postgres:13
    volumes:
      - postgres_volume:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - 5432:5432

  redis:
    container_name: redis
    image: redis:6-alpine
    volumes:
      - redis_volume:/data
    ports:
      - 6379:6379

  adonis_app:
    container_name: adonis_app
    restart: always
    depends_on:
      - postgres
      - redis
    build:
      context: .
      target: dependencies
    ports:
      - ${PORT}:${PORT}
      - 9229:9229
    env_file:
      - .env
    environment:
      - PG_HOST=postgres
      - REDIS_HOST=redis
    volumes:
      - ./:/home/node/app
    command: dumb-init node ace serve --watch --node-args="--inspect=0.0.0.0"

volumes:
  postgres_volume:
  redis_volume:
```

We added `potgres` and `redis` and made their data persistent using [Docker volumes](https://docs.docker.com/storage/volumes/).
Also, we made them as dependencies of our `adonis_app` service.

Good trick in this docker-compose.yml is the way how we extended our `.env` file using `environment` to add `PG_HOST` and `REDIS_HOST` inside it.
Adonis app will directly connect to this services!

:::note
We assume you installed @adonisjs/redis and @adonisjs/lucid with pg.
You can freely adapt this docker-compose.yml to your liking... Remove redis if you are not using it etc.
:::


And, that's it! By simply running `docker compose up` we have entire dev environment ready!


## Tips and tricks

### Automatically set-up default database for our app inside postgres service

We added `postgres` service. But, we would need to create database inside this Docker service to start our Adonis app migrations.
As we are lazy developers, we are able to make this boring process happen automatically for us :)

Let's create dockerConfig folder inside our root directory to place files that docker-compose.yml will use and create:

```sql
// title: dockerConfig/postgres-dev-init.sql
CREATE USER adonis with encrypted password 'adonis';
CREATE DATABASE adonis_app;
GRANT ALL PRIVILEGES ON DATABASE adonis_app TO adonis;
```

This sql script will create user `adonis` with all privileges on database `adonis_app` with password `adonis` for us.
Now, let's make this script run automatically only on first spin-up of postgres service.

Let's edit our docker-compose.yml and add this file to `/docker-entrypoint-initdb.d/init.sql`. This path will be run by postgres on init. 
```yaml
// title:
services:
  postgres:
    container_name: postgres
    image: postgres:13
    volumes:
      - postgres_volume:/var/lib/postgresql/data
      - ./dockerConfig/postgres-dev-init.sql:/docker-entrypoint-initdb.d/init.sql # will setup dev database adonis_app for us
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - 5432:5432
```

That's it! By using this, you don't even need to connect to Dockerized postgres service to set up your initial database.

:::note
Don't forget to update your .env file of adonis app to utilize this database.

PG_USER=adonis</br>
PG_PASSWORD=adonis</br>
PG_DB_NAME=adonis_app
:::

### Simplify Docker attach to redis/postgres/adonis_app service

Sometimes you want to do advanced actions on redis/postgres through shell (for example check all keys inside your redis-cli).
To simplify process of attaching to our docker-compose.yml services we can add `package.json` scripts as shortcuts for this.

Let's modify our `package.json` scripts a bit:

```json
// title: package.json
"scripts": {
  "dockerAttach": "docker exec -it adonis_app /bin/sh",
  "dockerAttachRedis": "docker exec -it redis /bin/sh",
  "dockerAttachPostgres": "docker exec -it postgres /bin/sh",
}
```

Now, simply by typing `npm run dockerAttachRedis` we will be connected to `redis` service inside our Docker environment.
We can simply type `redis-cli` now and play with redis instance that we conteinerized.
