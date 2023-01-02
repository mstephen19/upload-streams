import { useState, useCallback, useEffect, FormEventHandler } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { nanoid } from 'nanoid';
import io from 'socket.io-client';
import { AudioUploader, FileDisplay } from './components';
import { chunkFile } from './lib/utils';

import type { Socket } from 'socket.io-client';

const LayoutContainer = styled.main`
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;

const UploadButton = styled.button`
    &:hover:not(:disabled) {
        filter: brightness(1.4);
    }
`;

const UploadForm = styled.form`
    display: flex;
    gap: 10px;
`;

function App() {
    const [file, setFile] = useState<File | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const connection = io('http://localhost:3001');
        setSocket(connection);

        // Be sure to disconnect from the socket once the component
        // has unmounted.
        return () => void connection.disconnect();
    }, []);

    const uploadHandler = useCallback(({ file }: { file: File; duration: number }) => {
        setFile(file);
        toast.success('File added');
    }, []);

    const uploadErrorHandler = useCallback((error: Error) => {
        toast.error(error.message);
    }, []);

    const handleDelete = useCallback(() => {
        setFile(null);
    }, []);

    const handleSubmit: FormEventHandler = useCallback(
        async (e) => {
            e.preventDefault();

            if (!file) return toast.error('File not found');
            if (!socket) return toast.error('Error connecting to upload server');

            // Generate an ID on the client side
            const sessionID = nanoid();

            // Notify the user of any server-side errors when uploading
            // the file.
            const errorHandler = (message: string) => {
                toast.error(`Failed to upload file${message ? `: ${message}` : ''}`);
            };

            socket.on(`upload_error_${sessionID}`, errorHandler);

            // Notify the server that we're ready to start uploading a new file.
            await new Promise((resolve) => {
                socket.emit('begin_upload', { sessionID, fileName: file.name }, resolve);
            });

            // Generate chunks once a time to be safe on memory.
            // That way we don't bloat up the client's memory with a bunch
            // of blob chunks.
            for (const chunkData of chunkFile(file)) {
                // Emit an event to the server containing the chunk data
                // and wait for it to respond back before moving onto the
                // next chunk.
                await new Promise((resolve) => {
                    socket.emit(`upload_chunk_${sessionID}`, chunkData, resolve);
                });
            }

            // Wait for a "success" event to be emitted from the server.
            await new Promise((resolve) => {
                socket.once(`upload_success_${sessionID}`, resolve);
            });

            // Clean up the listener for server-side errors and notify of
            // the successful upload.
            socket.off(`upload_error_${sessionID}`, errorHandler);
            toast.success('File uploaded successfully');
        },
        [socket, file]
    );

    return (
        <LayoutContainer>
            <UploadForm onSubmit={handleSubmit}>
                <AudioUploader onUpload={uploadHandler} onUploadError={uploadErrorHandler} maxDuration={60} />
                <UploadButton name='upload-button' type='submit' disabled={!file}>
                    Upload
                </UploadButton>
            </UploadForm>
            {file && <FileDisplay file={file} onDelete={handleDelete} />}
        </LayoutContainer>
    );
}

export default App;
