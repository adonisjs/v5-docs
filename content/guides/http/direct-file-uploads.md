Direct file uploads allow you to stream the incoming multipart streams to a cloud service like Amazon S3 or Cloudinary without processing them on your server. The flow looks as follows:

- The user uploads the file.
- The request comes to your server.
- Instead of parsing the request and reading data from it, you pipe the stream to an external cloud service.

Since you pipe the stream directly, your AdonisJS application does not have to allocate any additional memory or CPU computation to parse and persist the data on a disk.

## When not to use direct file uploads?
As you will notice later in this guide, direct file uploads are complex as you deal with the streams directly.

We recommend sticking to [standard file uploads](./file-uploads.md) if your application does not deal with big file uploads. Do remember, sometimes writing the simpler code wins over small performance gains.

## Usage
The first step is to **disable the autoprocessing** of files inside the `config/bodyparser.ts` file. Once autoprocessing is disabled, the bodyparser middleware will forward the multipart stream to your controller so that you can process it manually.

You can disable the autoprocessing for the entire application by setting the `autoProcess` property to `false`.

```ts
multipart: {
  autoProcess: false
}
```

Or, you can disable it for selected routes by adding their route pattern to the `processManually` array.

```ts
processManually: ['/drive']
```

### Handling the multipart stream
You can handle the multipart stream inside your controller as follows:

```ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class DriveController {
  public async store({ request }: HttpContextContract) {
    // highlight-start
    request.multipart.onFile('input_field_name', {}, (part) => {
      someSdk.uploadStream(part)
    })

    await request.multipart.process()
    // highlight-end
  }
}
```

- The `request.multipart.process()` starts processing the multipart stream.
- The `request.multipart.onFile` method allows you to process the stream for a given file input by defining a callback.
- The callback method receives the stream instance (`part`) as the first argument. You can write this stream to any destination you want.

### Access the processed stream file
Once the stream for a given file has been processed **(successfully or with errors)**, you can access it using the `request.file` method. For example:

```ts
request.multipart.onFile('input_field_name', {}, (part) => {
  someSdk.uploadStream(part)
})

await request.multipart.process()

const file = request.input('input_field_name')
if (file.hasErrors) {
  return file.errors
}
```

### Validating the stream
You can also validate the stream as it is written to a destination by reporting every chunk to a helper function passed as the second argument to the `onFile` callback.

```ts
request.multipart.onFile(
  'input_field_name',
  // highlight-start
  {
    extnames: ['pdf', 'jpg', 'png', 'doc', 'xls'],
    size: '200mb',  
  },
  // highlight-end
  (part, reportChunk) => {
    // highlight-start
    part.pause()
    part.on('data', reportChunk)
    // highlight-end
    someSdk.uploadStream(part)
  })
```

- First, you have to define the validation rules for the `extname` and the `size`.
- Next, use the `reportChunk` method and report every chunk to an internal helper function. 
- The `reportChunk` method will monitor the stream as it flows and emits an error if any validation rules are unmet.
- As soon as an error is emitted by the `reportChunk` method on the readable stream, the writable stream (your SDK) will/should abort the upload process.

#### Have you noticed the `part.pause` statement?
You have to [pause the stream](https://nodejs.org/api/stream.html#stream_event_data) before defining the `part.on('data')` event listener. Otherwise, the stream will start flowing data before your SDK is ready to consume it. 

### Error handling
Any errors that occurred within the `onFile` callback are added to the file instance, and you can access them as follows.

```ts
request.multipart.onFile('input_field_name', {}, (part) => {
  throw new Error('blow up the stream')
})

await request.multipart.process()

const file = request.input('input_field_name')
console.log(file.errors) // will contain the "blow up the stream"
```

### Attach meta-data to the processed stream
You can attach meta-data to the processed stream file returning an object from the `onFile` callback. For example, it can be an object holding the URL of the file uploaded to a cloud service.

```ts
request.multipart.onFile('input_field_name', {}, (part, reportChunk) => {
  part.pause()
  part.on('data', reportChunk)

  // highlight-start
  const url = await someSdk.uploadStream(part)
  return { url }
  // highlight-end
})
```

The `url` will be available on the `file.meta` property.

```ts
await request.multipart.process()

const file = request.input('input_field_name')
// highlight-start
console.log(file.meta) // { url: '...' }
// highlight-end
```

## Caveats
When working with the stream directly, you cannot access the form input fields before processing the entire stream. This is because the form fields and files are both parts of a single stream, and hence they are available only when the stream is processed.

:::caption{for="error"}
Form field may not be available during stream processing
:::

```ts
request.multipart.onFile('input_field_name', {}, (part) => {
  // highlight-start
  // May or may not be available, based upon the position of field
  // in the stream
  request.input('some_field')
  // highlight-end
})

await request.multipart.process()
```

:::caption{for="success"}
Access the form field after the stream has been processed
:::

```ts
request.multipart.onFile('input_field_name', {}, (part) => {
})

await request.multipart.process()

// highlight-start
// Access after the process method
request.input('some_field')
// highlight-end
```

## How is it different from AWS direct uploads?
AWS [allows direct file uploads](https://aws.amazon.com/blogs/compute/uploading-to-amazon-s3-directly-from-a-web-or-mobile-application/) directly from the browser, without even hitting your server.

AdonisJS direct uploads are an alternative to AWS direct uploads, but both approaches have their upsides and downsides, as listed below.

### AWS direct uploads

- Processed directly from the browser.
- Requires an additional HTTP request to generate an authentication signature.
- Uses the client [file.type](https://developer.mozilla.org/en-US/docs/Web/API/File/type) property to detect the file content type. This can be easily spoofed.
- Needs a bucket policy to validate the file type and size.
- File uploads are generally faster and require zero computation on your server.

### AdonisJS direct uploads

- Processed from the server.
- Uses the file [magic number](<https://en.wikipedia.org/wiki/Magic_number_(programming)#Magic_numbers_in_files>) to detect the content type of the file on the server.
- Use the standard server-side validations.
- Even though the files are directly streamed, your server still has to fulfill the request.
