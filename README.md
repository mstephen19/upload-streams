# Upload streams

This is a mini passion project showing how data can be streamed in chunks from the client to the server using a websocket implementation instead of the standard REST way of doing things.

## Workflow

The workflow demonstrated by this app goes as follows:

1. Client chooses a file from their filesystem and clicks **Upload**
2. A unique **Session ID** is generated, then sent to the server with the **begin_upload** event. A response from the server is awaited before moving onto the next step.
3. While the client waits, the server prepares a stream that will listen for events named **upload_chunk_{SESSION-ID}**. Then, a response is sent to the client acknowledging that the server is now ready to start receiving data.
4. The client sends each chunk of the file by emitting the **upload_chunk_{SESSION-ID}** event. It waits for the server to acknowledge that the chunk has been processed before sending the next one.
5. Once the server has received the last chunk, it emits the **upload_success_{SESSION-ID}** to the client and the **File uploaded successfully** message is displayed to the user.

## Run it

Ensure that you have [Docker](https://www.docker.com/) installed and that the Docker daemon is running on your machine. Then, within the project's directory, run the following command:

```shell
docker compose up --build -d
```

You can then view the UI by visiting [http://localhost:3000](http://localhost:3000). All uploaded files will be reflected within the **server/audio/** directory.

## License

Copyright (c) 2023 Matt Stephens

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
