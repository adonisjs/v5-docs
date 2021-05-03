---
summary: Learn how to serve static assets from your AdonisJS application.
---

AdonisJS ships with a static file server to serve the files from a given directory. It is as simple as dropping a file inside the `./public` directory and then accessing it by its filename. For example:

Create a file named `public/style.css` with the following contents.

```css
body {
  background: #f7f7f7;
}
```

And then access it by visiting the [http://localhost:3333/style.css](http://localhost:3333/style.css). You don't have to type the directory name (/public), and the files are accessible directly by their filename.

## Configuration

The config for the static server is stored inside the `config/static.ts` file.

```ts
import { AssetsConfig } from '@ioc:Adonis/Core/Static'

const staticConfig: AssetsConfig = {
  enabled: true,
  dotFiles: 'ignore',
  etag: true,
  lastModified: true,
}

export default staticConfig
```

#### enabled

A toggle switch to enable/disable the static file server.

---

#### dotFiles

The treatment for the dotfiles. The value can be one of the following:

- `'allow'`: No special treatment for dotfiles. Just serve them like any other file.
- `'deny'`: Deny the request with a 403 status code.
- `'ignore'`: Pretend like the dotfile does not exist.

---

#### etag

Whether or not to generate the ETag for the files.

---

#### lastModified

Enable or disable the `Last-Modified` HTTP header. The value for the header relies on the file's last modified value.

## The default directory

Conventionally, we serve the files from the `./public` directory. However, you can choose a different directory by configuring it inside the `.adonisrc.json` file.

```json
// title: .adonisrc.json
{
  "directories": {
    "public": "assets"
  }
}
```

After the above change, The static server will serve the files from the `./assets` directory.

### Notifying assembler about the change

The `@adonisjs/assembler` package compiles your production application and writes the output to the `./build` directory.

During this process, it also copies the files from the `public` directory, and hence, you must notify it about the change within the `.adonisrc.json` file.

```json
// title: .adonisrc.json
{
  "metaFiles": [
    // delete-start
    {
      "pattern": "public/**",
      "reloadServer": false
    },
    // delete-end
    // insert-start
    {
      "pattern": "assets/**",
      "reloadServer": false
    }
    // insert-end
  ]
}
```

## URL conflicts

In case your static file names conflict with a registered route, AdonisJS will give preference to the static file and the route handler will never be called. 

In this scenario, we recommend you to rename the static file or move it inside a sub-folder to avoid the conflict at the first place.

## Additional reading

- [Assets manager](./assets-manager.md)
