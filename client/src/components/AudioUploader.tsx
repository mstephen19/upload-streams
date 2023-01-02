import { useCallback, memo } from 'react';
import styled from 'styled-components';

import type { ChangeEventHandler, DragEventHandler } from 'react';

const HiddenInput = styled.input`
    display: none;
`;

const LabelButton = styled.label`
    border: 2px dashed white;
    border-radius: 20px;
    font-weight: bold;
    padding: 10px;
    cursor: pointer;
    transition: all 0.25s;
    &:hover {
        filter: brightness(0.7);
    }
    &:active {
        border-color: grey;
        color: grey;
    }
`;

export type UploaderProps = {
    onUpload?: (data: { file: File; duration: number }) => void;
    onUploadError?: (error: Error) => void;
    maxDuration?: number;
};

export const AudioUploader = memo(({ onUpload, maxDuration, onUploadError }: UploaderProps) => {
    const fileHandler = useCallback(async (file: File) => {
        const url = URL.createObjectURL(file);
        const audio = new Audio(url);

        // * Proof of concept for grabbing the duration of an uploaded audio file.
        const duration = await (new Promise((resolve) => {
            const handler: Parameters<typeof audio['addEventListener']>[1] = () => {
                // Clean up the object URL and the listener
                URL.revokeObjectURL(url);
                audio.removeEventListener('canplaythrough', handler);
            };

            audio.addEventListener('canplaythrough', () => {
                URL.revokeObjectURL(url);
                resolve(audio.duration);
            });
        }) satisfies Promise<number>);

        if (maxDuration && duration > maxDuration) {
            return void onUploadError?.(new Error(`${Math.ceil(duration)}s exceeds the ${maxDuration}s limit`));
        }

        onUpload?.({ file, duration });
    }, []);

    const uploadHandler: ChangeEventHandler<HTMLInputElement> = useCallback(async ({ target }) => {
        if (!target.files?.[0]) return;
        await fileHandler(target.files[0]);
    }, []);

    const handleDrag: DragEventHandler = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop: DragEventHandler = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!e.dataTransfer.files || !e.dataTransfer.files?.[0]) return;
        await fileHandler(e.dataTransfer.files[0]);
    }, []);

    return (
        <>
            <LabelButton htmlFor='upload-audio-file' onDragOver={handleDrag} onDragEnter={handleDrag} onDrop={handleDrop}>
                Browse or drag
            </LabelButton>
            <HiddenInput id='upload-audio-file' type='file' accept='.mp3,.wav' name='upload-audio-file' onChange={uploadHandler} />
        </>
    );
});
