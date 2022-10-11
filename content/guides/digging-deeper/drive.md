AdonisJS Drive is an abstraction on top of cloud storage services, such as: **Amazon S3**, **DigitalOcean Spaces**, and **Google Cloud Storage**.

The Drive comes pre-bundled with the framework's core, and hence no extra installation steps are required (except for drivers). You can use Drive as follows:

```ts
import Drive from '@ioc:Adonis/Core/Drive'

// Write a file
await Drive.put(filePath, stringOrBuffer)
await Drive.putStream(filePath, readableStream)

// Read a file
const contents = await Drive.get(filePath)
const readableStream = await Drive.getStream(filePath)

// Find if a file exists
if (await Drive.exists(filePath)) {
  await Drive.get(filePath)
}
```

## Goals & design limitations
The primary goal of Drive is to provide a consistent API that works across all the storage providers. So, for example, you can use the **local file system** during development and switch to **S3** in production without changing a single line of code.

To guarantee a consistent API, Drive cannot work with the specifics of a given storage service.

For example, you cannot create symlinks using Drive since [symlinks](https://en.wikipedia.org/wiki/Symbolic_link) are a Unix-based file systems concept and cannot be replicated with S3 or GCS.

Similarly, the proprietary features of a cloud service that cannot be replicated across drivers are also not supported.

## Use cases
The Drive is NOT a replacement for managing your website static assets like CSS, JavaScript, or the images/icons you use to design your website/web app.

The primary use case for Drive is to help you quickly manage user-uploaded files. These can be user avatars, blog post cover images, or any other runtime managed documents.

## Configuration

The configuration for Drive is stored inside the `config/drive.ts` file. Inside this file, you can define multiple disks using the same/different drivers.

Feel free to create the config file (if missing) using the [config stub](https://github.com/adonisjs/core/blob/master/templates/config/drive.txt).

```ts
// title: config/drive.ts
import { driveConfig } from '@adonisjs/core/build/config'

export default driveConfig({
  disk: Env.get('DRIVE_DISK'),

  disks: {
    local: {
      driver: 'local',
      visibility: 'public',
      root: Application.tmpPath('uploads'),
      basePath: '/uploads',
      serveFiles: true,
    },

    s3: {
      driver: 's3',
      visibility: 'public',
      key: Env.get('S3_KEY'),
      secret: Env.get('S3_SECRET'),
      region: Env.get('S3_REGION'),
      bucket: Env.get('S3_BUCKET'),
      endpoint: Env.get('S3_ENDPOINT'),
      
      // For minio to work
      // forcePathStyle: true,
    },
  },
})
```

#### disk
The `disk` property represents the default disk to use for file system operations. Usually, you will define the disk as an environment variable to use different disks for local development and production.

---

#### disks
The `disks` object defines the disks you want to use throughout your application. Each disk must specify the driver it wants to use.

## Drivers
Following is the list of the official drivers.

### Local driver

The `local` driver is pre-bundled into the framework core. It uses the local file system for reading/writing files.

You must configure the root directory for the local driver inside the config file. The path can be anywhere on your computer (even outside the project root will work). 

```ts
local: {
  driver: 'local',
  // highlight-start
  root: Application.tmpPath('uploads'),
  // highlight-end
},
```

To mimic the behavior of Cloud services, the local driver can also serve files when a `basePath` is defined, and the `serveFiles` option is enabled.

:::note

Ensure you do not define any other routes in your application using the same prefix as the `basePath`.

:::

```ts
local: {
  basePath: '/uploads',
  serveFiles: true,
}
```

Once configured, the `Drive.getUrl` method will generate the URL to download the file. The URLs are relative to the current domain.

```ts
await Drive.getUrl('avatar.jpg')

// Returns
// /uploads/avatar.jpg
```

```ts
await Drive.getSignedUrl('avatar.jpg')

// Returns
// /uploads/avatar.jpg?signature=eyJtZXNzYWdlIjoiL3YxL3VzZXJzIn0.CGHY99jESI-AxPFBu1lE26TXjCASfC83XTyu58NivFw
```

---

### S3 driver

The `s3` driver makes use of Amazon S3 cloud storage for reading/writing files. You will have to install the driver separately.

Make sure to follow the `configure` command instructions to set up the driver correctly. You can also read the same instructions [here](https://github.com/adonisjs/drive-s3/blob/master/instructions.md).

```sh
npm i @adonisjs/drive-s3
```

```sh
node ace configure @adonisjs/drive-s3
```

You can also use the `s3` driver with S3-compatible services like [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/) and [MinIO](https://min.io/). 

When using a different service, you will have to define the bucket endpoint as well.

```ts
{
  driver: 's3',
  endpoint: Env.get('S3_ENDPOINT')
}
```

---

### GCS driver

The `gcs` driver makes use of Google Cloud Storage for reading/writing files. You will have to install the driver separately.

Make sure to follow the `configure` command instructions to set up the driver correctly. You can also read the same instructions [here](https://github.com/adonisjs/drive-gcs/blob/master/instructions.md).

```sh
npm i @adonisjs/drive-gcs
```

```sh
node ace configure @adonisjs/drive-gcs
```

Make sure to set the `usingUniformAcl` option to true if you use GCS [uniform ACL](https://cloud.google.com/storage/docs/uniform-bucket-level-access).

## Files visibility
Drive allows you to save files with either `public` or `private` visibility. The public files are accessible using the file URL, whereas the private files can either be read on the server or accessed using a signed URL.

You can configure visibility for the entire disk by defining the `visibility` option in the config file.

```ts
{
  disks: {
    local: {
      driver: 'local',
      // highlight-start
      visibility: 'private'
      // highlight-end
      // ... rest of the config
    }
  }
}
```

The `s3` and the `gcs` drivers also allow you to define visibility for individual files. However, we recommend using a separate bucket for public and private files for the following reasons.

- When using a separate bucket, you can configure a CDN on the entire bucket to serve public files.
- You get better cross-compatibility with the `local` file driver since the local driver does not allow file-level visibility control.

Regardless of the driver's use, you cannot access the `private` files with just the file URL. Instead, you need to create a signed URL or use the `Drive.get` method to access the file.

```ts
// ✅ Works
const contents = await Drive.get(filePath)

// ❌ Cannot access private files with a URL
const url = await Drive.getUrl(filePath)

// ✅ Can be accessed using a signed url
const signedUrl = await Drive.getSignedUrl(filePath)
```

## Writing files
You can create/update files using one of the following methods. If a file already exists, it will be updated.

### put

The `put` method accepts the file name as the first argument and the file content (either string or buffer) as the second argument.

```ts
import Drive from '@ioc:Adonis/Core/Drive'

await Drive.put(filePath, contents)
```

You can also define the file metadata using the third argument.

```ts
await Drive.put(filePath, contents, {
  visibility: 'public',
  contentType: 'image/png'
})
```

Following is the list of available options.

| Option | Description        |
|--------|--------------------|
| `visibility` | The file visibility | 
| `contentType` | The file content type | 
| `contentLanguage` | The file language. Used to set the **content-language** header when downloading the file | 
| `contentEncoding` | The file contents encoding. Used to set the **content-encoding** header when downloading the file | 
| `contentDisposition` | Value for the **content-disposition** response header | 
| `cacheControl` | Value for the **cache-control** response header. GCS driver ignores this option, as the underlying SDK does not allow configuring it. | 

### putStream

The `putStream` method accepts the content as a readable stream. The options are the same as the `put` method.

```ts
import Drive from '@ioc:Adonis/Core/Drive'

await Drive.putStream(filePath, readableStream)
```

---

### BodyParser `moveToDisk`
You can move the user uploaded files to a given disk using the `file.moveToDisk` method.

The method accepts the following arguments.

- The file location (without the filename).
- The metadata options. Same as the `put` method.
- Optionally, a disk name. When not defined, the default disk is used.

```ts
import Drive from '@ioc:Adonis/Core/Drive'
import Route from '@ioc:Adonis/Core/Route'

Route.post('posts', async ({ request }) => {
  const coverImage = request.file('cover_image')

  // highlight-start
  // Written to the "images" directory
  await coverImage.moveToDisk('images')

  // Written to the "root" directory
  await coverImage.moveToDisk('./')
  // highlight-end
})
```

The `moveToDisk` method renames the user's uploaded file to a unique/random file name. However, you can also define the filename manually.

```ts
await coverImage.moveToDisk('images', {
  name: `${user.id}.${coverImage.extname}`
})
```

Finally, you can also define a custom disk name as the third argument.

```ts
await coverImage.moveToDisk('images', {}, 's3')
```

## Reading files
You can read files using the `Drive.get` or the `Drive.getStream` methods. Both the methods will raise an exception when the file is missing.

### get
The `get` method returns the file contents as a buffer. You can convert it to a string by calling the `toString` method.

```ts
import Drive from '@ioc:Adonis/Core/Drive'

const contents = await Drive.get('filePath')
contents.toString()

// Custom encoding
contents.toString('ascii')
```

---

### getStream
The `getStream` method returns an instance of the [readable stream](https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#stream_class_stream_readable).

```ts
const readableStream = await Drive.getStream('filePath')
response.stream(readableStream)
```

## Generating URLs
You can generate a URL to a file path using the `Drive.getUrl` or the `Drive.getSignedUrl` methods.

In the case of cloud storage providers, the generated URL points to the cloud service. Whereas, in the case of the `local` driver, the URL points to your AdonisJS application.

The `local` driver registers a route implicitly when the `serveFiles` option is set to true inside the config file. Also, a `basePath` is required and must be unique across the registered disks.

```ts
{
  local: {
    driver: 'local',
    // highlight-start
    serveFiles: true,
    basePath: '/uploads'
    // highlight-end
  }
}
```

### getUrl
Returns a URL to download a given file. An exception is raised if the file is missing. Only the `public` files can be viewed using the URL returned by the `getUrl` method.

```ts
const url = await Drive.getUrl('filePath')
```

---

### getSignedUrl
The `getSignedUrl` method returns a URL to download a given file with its signature. You can only download the file as long as the signature is valid.

You can also define the duration after which the signature expires, and the URL becomes invalid.

```ts
const url = await Drive.getSignedUrl('filePath')

// With expiry
const url = await Drive.getSignedUrl('filePath', {
  expiresIn: '30mins'
})
```

Finally, you can also define the following response content headers as the second argument.

```ts
const url = await Drive.getSignedUrl('filePath', {
  contentType: 'application/json',
  contentDisposition: 'attachment',
})
```

Following is the list of available options.

| Option | Description        |
|--------|--------------------|
| `contentType` | Value for the **content-type** response header. | 
| `contentLanguage` | Value for the **content-language** response header. Ignored by the GCS driver | 
| `contentEncoding` | Value for the **content-encoding** response header. Ignored by the GCS driver | 
| `contentDisposition` | Value for the **content-disposition** response header |
| `cacheControl` | Value for the **cache-control** response header. Ignored by the GCS driver. |

## Downloading files
The recommended approach to download files is to use the file URL generated using the `Drive.getUrl` method. However, you can also download files manually from a custom route. 

Following is a simplified example of streaming files. [Here's](https://github.com/adonisjs/drive/blob/develop/src/LocalFileServer/index.ts#L62-L187) a more robust implementation.

```ts
import { extname } from 'path'
import Route from '@ioc:Adonis/Core/Route'
import Drive from '@ioc:Adonis/Core/Drive'

Route.get('/uploads/*', async ({ request, response }) => {
  const location = request.param('*').join('/')

  const { size } = await Drive.getStats(location)

  response.type(extname(location))
  response.header('content-length', size)

  return response.stream(await Drive.getStream(location))
})
```
 
## Deleting files
You can delete the file using the `Drive.delete` method. NO exception is raised when the file is missing.

```ts
await Drive.delete('avatar.jpg')
```

## Copying & moving files
You can copy and move files using the following methods. The metadata options are the same as the `put` method.

For cloud services, the operations are performed within the same bucket. So, for example, if you want to copy a file from the local disk, then you must use the [put](#put) or the [putStream](#put-stream) methods.

```ts
await Drive.copy(source, destination, metadataOptions)
await Drive.move(source, destination, metadataOptions)
```

## Switching between disks
You can switch between disks using the `Drive.use` method.

```ts
// Reference to the S3 disk
const s3 = Drive.use('s3')

await s3.put(filePath, stringOrBuffer)
```

## Switching bucket at runtime
When using the `s3` and the `gcs` drivers, you can switch the bucket at runtime using the bucket method.

```ts
Drive
  .use('s3')
  // highlight-start
  .bucket('bucketName')
  // highlight-end
  .put(filePath, stringOrBuffer)
```

## Adding a custom driver
The Drive exposes the API to add your custom drivers. Every driver must adhere to the [DriverContract](https://github.com/adonisjs/drive/blob/develop/adonis-typings/drive.ts#L53-L134).

:::note

You can also use the official [S3](https://github.com/adonisjs/drive-s3) or [GCS](https://github.com/adonisjs/drive-gcs) drivers as a reference for creating your own driver.

:::

```ts
interface DriverContract {
  name: string
  
  exists(location: string): Promise<boolean>
  
  get(location: string): Promise<Buffer>
  
  getStream(location: string): Promise<NodeJS.ReadableStream>
  
  getVisibility(location: string): Promise<Visibility>
  
  getStats(location: string): Promise<DriveFileStats>
  
  getSignedUrl(
    location: string,
    options?: ContentHeaders & { expiresIn?: string | number }
  ): Promise<string>
  
  getUrl(location: string): Promise<string>
  
  put(
    location: string,
    contents: Buffer | string,
    options?: WriteOptions
  ): Promise<void>
  
  putStream(
    location: string,
    contents: NodeJS.ReadableStream,
    options?: WriteOptions
  ): Promise<void>

  setVisibility(location: string, visibility: Visibility): Promise<void>

  delete(location: string): Promise<void>

  copy(
    source: string,
    destination: string,
    options?: WriteOptions
  ): Promise<void>

  move(
    source: string,
    destination: string,
    options?: WriteOptions
  ): Promise<void>
}
```

#### exists
Return a boolean to indicate if the file exists or not. The driver should not raise an exception when the file is missing and instead return false.

---

#### get
Return the file contents as a buffer. The driver should raise an exception when the file is missing.

---

#### getStream
Return the file contents as a readable stream. The driver should raise an exception when the file is missing.

---

#### getVisibility
Return the file visibility. If the driver doesn't support file-level visibility, it should return the disk visibility from the config.

---

#### getStats
Return the file metadata. The response object must include the following properties.

```ts
{
  size: number
  modified: Date
  isFile: boolean
  etag?: string // Optional
}
```

---

#### getSignedUrl
Return a signed URL to download the file. If possible, the signed URL can accept the response content headers when generating the URL.

---

#### getUrl
Return a static URL to the file. No need to check if the file exists or not. Instead, return 404 at the time of serving the file.

---

#### put
Create/update a file from raw contents (string or buffer). You must create the required directories as well.

---

#### putStream
Create/update a file from a readable stream. You must create the required directories as well.

---

#### setVisibility
Update the file visibility. If the driver doesn't support file-level visibility, then it should just ignore the request.

---

#### delete
Delete the file. The driver should not raise an exception when the file is missing.

---

#### copy
Copy the file from one location to another. The copy operation should copy the metadata of the file as well. For example: In S3, it requires an additional request to copy the file ACL.

---

#### move
Move the file from one location to another. The move operation should copy the metadata of the file as well.

---

### Extending from outside in
Anytime you are extending the core of the framework. It is better to assume that you do not have access to the application code and its dependencies. In other words, write your extensions as if you are writing a third-party package and use dependency injection to rely on other dependencies.

For demonstration purposes, let's create a dummy driver with no implementation.

```sh
mkdir providers/DummyDriver
touch providers/DummyDriver/index.ts
```

Open the `DummyDriver/index.ts` file and paste the following contents inside it.

```ts
import type {
  Visibility,
  WriteOptions,
  ContentHeaders,
  DriveFileStats,
  DriverContract,
} from '@ioc:Adonis/Core/Drive'

export interface DummyDriverContract extends DriverContract {
  name: 'dummy' // Driver name
}

export type DummyDriverConfig = {
  driver: 'dummy' // Driver name
  // .. other config options
}

export class DummyDriver implements DummyDriverContract {
  // implementation goes here
}
```

Next, you must register the driver with the Drive module. You must do it inside the boot method of a service provider. Open the pre-existing `providers/AppProvider.ts` file and paste the following code inside it.

```ts
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public async boot() {
    const { DummyDriver } = await import('./DummyDriver')
    const Drive = this.app.container.use('Adonis/Core/Drive')

    Drive.extend('dummy', (_drive, _diskName, config) => {
      return new DummyDriver(config)
    })
  }
}
```

###  Informing TypeScript about the new driver
Before someone can reference this driver within the `config/drive.ts` file. You will have to inform TypeScript static compiler about its existence. 

If you are creating a package, then you can write the following code inside your package main file, otherwise you can write it inside the `contracts/drive.ts` file.

```ts
import {
  DummyDriverConfig,
  DummyDriverContract
} from '../providers/DummyDriver'

declare module '@ioc:Adonis/Core/Drive' {
  interface DriversList {
    dummy: {
      config: DummyDriverConfig,
      implementation: DummyDriverContract
    }
  }
}
```

## Using the driver
Alright, we are now ready to use the driver. Let's start by defining the config for a new disk inside the `config/drive.ts` file.

```ts
{
  disks: {
    myDummyDisk: {
      driver: 'dummy',
      // ... rest of the config
    }
  }
}
```

And use it as follows.

```ts
import Drive from '@ioc:Adonis/Core/Drive'

await Drive.use('myDummyDisk').put(filePath, contents)
```
