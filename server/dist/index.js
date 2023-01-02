import { createServer } from 'http';
import { Server } from 'socket.io';
const app = createServer();
const io = new Server(app, {
    cors: {
        origin: /.*/,
        methods: ['GET', 'POST'],
    },
});
io.on('connection', (socket) => {
    console.log(socket.id);
});
app.listen(3001, () => console.log('Upload server running.'));
