---
summary: Access and validate user-uploaded files.
---

AdonisJS provides you a robust and performant API for dealing with file uploads. Not only can you process and store uploaded files locally, but you can also **stream them directly to the cloud services like S3, Cloudinary, or Google cloud storage**.

:::tip
Checkout [Attachment Lite](https://github.com/adonisjs/attachment-lite). An opinionated package to convert any column on your Lucid model to an attachment data type. Making file upload clean and easy.
:::

## Accessing uploaded files
The bodyparser middleware registered inside the `start/kernel.ts` file automatically processes all the files for `multipart/form-data` requests.

You can access the files using the `request.file` method. The method accepts the field name and returns an instance of the [File](https://github.com/adonisjs/bodyparser/blob/develop/src/Multipart/File.ts) class, or `null` if no file was uploaded.

```ts
import Route from '@ioc:Adonis/Core/Route'
import Application from '@ioc:Adonis/Core/Application'

Route.post('posts', async ({ request }) => {
  const coverImage = request.file('cover_image')

  if (coverImage) {
    await coverImage.move(Application.tmpPath('uploads'))
  }
})
```

When accepting multiple files from the same input, you can use the `request.files` method (the plural form) to return an array of the file instances.

```ts
import Route from '@ioc:Adonis/Core/Route'
import Application from '@ioc:Adonis/Core/Application'

Route.post('gallery', async ({ request }) => {
  const images = request.files('images')

  for (let image of images) {
    await image.move(Application.tmpPath('uploads'))
  }
})
```

## Validating files

You can also validate the file by specifying the rules for the file extension and the file size, and AdonisJS will perform the validations implicitly.

:::note

We attempt to detect the file extension using the file [magic number](<https://en.wikipedia.org/wiki/Magic_number_(programming)#Magic_numbers_in_files>) and fallback to the filename extension when unable to detect it using the magic number.

:::

```ts
const coverImage = request.file('cover_image', {
  size: '2mb',
  extnames: ['jpg', 'png', 'gif'],
})

if (!coverImage) {
  return
}

if (!coverImage.isValid) {
  return coverImage.errors
}

await coverImage.move(Application.tmpPath('uploads'))
```

## Validating files using the validator

You can also use the [validator](../validator/introduction.md) to validate the user uploaded files alongside the rest of the form.

The `schema.file` method validates the input to be a valid file, along with any custom validation rules provided for the file size and the extension.

If the file validation fails, you can access the error message alongside the form errors. Otherwise, you can access the file instance and move it to the desired location.

```ts
import Route from '@ioc:Adonis/Core/Route'
import { schema } from '@ioc:Adonis/Core/Validator'
import Application from '@ioc:Adonis/Core/Application'

Route.post('posts', async ({ request }) => {
  const postSchema = schema.create({
    cover_image: schema.file({
      size: '2mb',
      extnames: ['jpg', 'gif', 'png'],
    }),
  })

  const payload = await request.validate({ schema: postSchema })

  await payload.cover_image.move(Application.tmpPath('uploads'))
})
```

## Saving files
You can save user-uploaded files using the `moveToDisk` method. It uses AdonisJS [Drive](../digging-deeper/drive.md) under the hood to save files.

```ts
const coverImage = request.file('cover_image', {
  size: '2mb',
  extnames: ['jpg', 'png', 'gif'],
})!

// highlight-start
await coverImage.moveToDisk('./')

// Get the name of the saved file; to store it in your database, for example.
const fileName = coverImage.fileName;
// highlight-end
```

The `moveToDisk` method accepts the following arguments.

- `storagePath`: A relative path to the disk root.
- `options`: An object of options accepted by the [Drive.put](../digging-deeper/drive.md#put) method. Additionally, you can pass the file name property.
- `disk`: Define the disk name to use for saving the file. If not defined, we will use the default disk.

## Serving uploaded files
We recommend using Drive to save user uploaded files and then use the [Drive.getUrl](../digging-deeper/drive.md#geturl) to serve public files and [Drive.getSignedUrl](../digging-deeper/drive.md#getsignedurl) to serve private files.

## File properties/methods

Following is the list of properties on the [File](https://github.com/adonisjs/bodyparser/blob/develop/src/Multipart/File.ts) class.

### fieldName

Reference to the input file name.

```ts
file.fieldName
```

---

### clientName

The uploaded file name. It is usually the name of the file on the user's computer.

```ts
file.clientName
```

---

### size

The file size is in bytes. The file size is only available when the file stream has been consumed.

```ts
file.size
```

---

### headers

The HTTP headers associated with the file

```ts
file.headers
```

---

### tmpPath

The path of the file inside the computer `/tmp` directory. It is available only when the files are processed by the bodyparser middleware and not during direct uploads.

```ts
file.tmpPath
```

---

### filePath

The file's absolute path. Available after the `move` operation.

```ts
file.filePath
```

---

### fileName

The file's relative name. Available after the `move` operation.

```ts
file.fileName
```

---

### type

The file [mime type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types). Available after the file stream has been consumed

```ts
file.type
```

---

### subtype

The subtype from the file mime type. Available after the file stream has been consumed.

```ts
file.subtype
```

---

### extname

The file extension. Available after the file stream has been consumed.

```ts
file.extname
```

---

### state

The file processing state. It is one of the following.

- `idle`: The file stream is idle and is not flowing.
- `streaming`: The file is streaming the contents.
- `consumed`: The file stream has been consumed.
- `moved`: The file has been moved using the `file.move` method.

```ts
if (file.state === 'consumed') {
  console.log(file.type)
}
```

---

### isValid

Find if the file has passed the validation or not.

```ts
if (!file.isValid) {
  return file.errors
}
```

---

### hasErrors

The `hasErrors` property is the opposite of the `isValid` property.

```ts
if (file.hasErrors) {
  return file.errors
}
```

---

### validated

Find if the file has been validated or not. Call `file.validate()` to valid it.

```ts
if (!file.validated) {
  file.validate()
}
```

---

### errors

An array of validation errors

```ts
if (file.hasErrors) {
  return file.errors
}
```

---

### sizeLimit

Reference to the `size` validation option.

---

### allowedExtensions

Reference to the `extnames` validation option.

---

### validate

Validate the file against the pre-defined validation options. AdonisJS implicitly calls this method when you access the file using the `request.file(s)` method.

---

### move
Move the file to a given location on the filesystem. The method accepts an absolute to the destination directory and options object to rename the file.

```ts
await file.move(Application.tmpPath('uploads'), {
  name: 'renamed-file-name.jpg',
  overwrite: true, // overwrite in case of conflict
})
```

---

### moveToDisk
Move file using Drive. The methods accept the following arguments:

- `storagePath`: A relative path to the disk root.
- `options`: An object of options accepted by the [Drive.put](../digging-deeper/drive.md#put) method. Additionally, you have to pass the file name property
- `disk`: Define the disk name to use for saving the file. If not defined, we will use the default disk.

```ts
await file.moveToDisk('./', {
  name: 'renamed-file-name.jpg',
  contentType: 'image/jpg'
}, 's3')
```

---

### toJSON

Get the JSON object representation of the file instance.

```ts
const json = file.toJSON()
```

## Additional reading

- Step by step tutorial on file uploads
- Direct file uploads
