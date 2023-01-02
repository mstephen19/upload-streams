import { createServer } from 'http';
import { Server } from 'socket.io';
import { FileStream } from './FileStream.js';
import { createWriteStream } from 'fs';

const app = createServer();

const io = new Server(app, {
    cors: {
        origin: /.*/,
        methods: ['GET', 'POST'],
    },
});

io.on('connect', (socket) => {
    console.log(socket.id, 'connected');

    socket.on('begin_upload', ({ sessionID, fileName }: { sessionID: string; fileName: string }, respond: () => void) => {
        // Prepare a readable stream that wraps the chunk events from the
        const readable = new FileStream(socket, sessionID);
        try {
            // ! Here, we are writing to the filesystem; however the
            // ! created "FileStream" could just as easily be sent
            // ! to an AWS bucket for example.
            const writable = createWriteStream(`./audio/${fileName}`);

            readable.pipe(writable);

            writable.once('close', () => {
                io.to(socket.id).emit(`upload_success_${sessionID}`);
            });

            // Let the client know we are ready to start receiving chunks.
            respond();
        } catch (error) {
            // Clean up the stream.
            readable.destroy();
            // Notify the client of the error.
            io.to(socket.id).emit(`upload_error_${sessionID}`, (error as Error)?.message);
        }
    });

    socket.on('disconnect', () => {
        console.log(socket.id, 'disconnected');
    });
});

app.listen(3001, () => console.log('Upload server running.'));
