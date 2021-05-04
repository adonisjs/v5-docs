---
summary: Access and validate user-uploaded files.
---

AdonisJS provides you a robust and performant API for dealing with file uploads. Not only can you process and store uploaded files locally, but you can also **stream them directly to the cloud services like S3, Cloudinary, or Google cloud storage**.

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

When accepting multiple files from the same input, you can use the `request.files` method (the plural form), and it will return an array of the file instances.

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

if (!coverImage.isValid()) {
  return coverImage.errors
}

await coverImage.move(Application.tmpPath('uploads'))
```

## Validating files using the validator

You can also use the [validator](../validator/introduction.md) to validate the user uploaded files alongside the rest of the form.

The `schema.file` method validates the input to be a valid file, along with any custom validation rules provided for the file size and the extension.

If the file validation fails, you can access the error message alongside the rest of the form errors. Otherwise, you can access the file instance and move it to the desired location.

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

## Renaming files

It is always recommended to rename the user uploaded files during the `move` operation. The renamed file name can be anything suitable for your app, or you can use the `cuid` helper method to create random file names.

```ts
import { cuid } from '@ioc:Adonis/Core/Helpers'

const coverImage = request.file('cover_image', {
  size: '2mb',
  extnames: ['jpg', 'png', 'gif'],
})

if (!coverImage) {
  return
}

// highlight-start
const fileName = `${cuid()}.${coverImage.extname}`

await coverImage.move(Application.tmpPath('uploads'), {
  name: fileName,
})
// highlight-end
```

In case of renamed filename conflicts, you can decide whether to overwrite the existing file by defining the `overwrite` option.

```ts
await coverImage.move(Application.tmpPath('uploads'), {
  name: fileName,
  overwrite: true,
})
```

## Serving uploaded files

The API for the file uploads only focuses on handling user uploaded files and not saving and serving them. However, the following is the simplest way to serve the files from a local disk.

The `response.attachment` method streams the file to the client or returns a `404` status code when the file is missing.

```ts
import Route from '@ioc:Adonis/Core/Route'
import Application from '@ioc:Adonis/Core/Application'

Route.get('uploads/:filename', async ({ params, response }) => {
  return response.attachment(
    Application.tmpPath('uploads', params.filename)
  )
})
```

You can also rename files during download by specifying the name as the second argument.

```ts
response.attachment(
  Application.tmpPath('uploads', params.filename),
  're-named.jpg'
)
```

## Moving files to the cloud storage
You can move files to the cloud storage services like S3, Digital ocean or Cloudinary using their official SDKs.

You can access the temporary path to the upload file using the `file.tmpPath` property.

:::note

The `file.move` method moves the file locally from its `tmpPath` to the given location. This method cannot be used when moving files to a cloud service.

:::

```ts
const coverImage = request.file('cover_image', {
  size: '2mb',
  extnames: ['jpg', 'png', 'gif'],
})

const fileName = `${cuid()}.${coverImage.extname}`

// highlight-start
await s3.upload({
  Key: fileName,
  Bucket: 's3-bucket-name',
  Body: fs.createReadStream(coverImage.tmpPath) // 👈
})
// highlight-end
```

## File properties

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

The file size in bytes. It is only available when the file stream has been consumed.

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

### toJSON

Get the JSON object representation of the file instance.

```ts
const json = file.toJSON()
```

## Additional reading

- Step by step tutorial on file uploads
- Direct file uploads
