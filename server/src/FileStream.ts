import { Readable } from 'stream';
import type { Socket, Server } from 'socket.io';

export class FileStream extends Readable {
    #registered = false;

    constructor(readonly socket: Socket, readonly sessionID: string) {
        super();
    }

    _read(): void {
        // Register the listener only once
        if (this.#registered) return;

        const handler = ({ chunk, last }: { chunk: Buffer; last: boolean }, respond: () => void) => {
            // Push the data into the stream
            this.push(chunk);

            // Then, notify the client that it can continue with sending the next chunk.
            respond();

            if (last) {
                // Clean up the listener to avoid potential weird memory leaks
                this.socket.off(`upload_chunk_${this.sessionID}`, handler);
                this.emit('end');
            }
        };

        this.socket.on(`upload_chunk_${this.sessionID}`, handler);

        this.#registered = true;
    }
}
