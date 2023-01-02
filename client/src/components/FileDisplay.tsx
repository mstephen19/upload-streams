import { useCallback, memo } from 'react';
import styled from 'styled-components';

const FileDisplayBox = styled.div`
    display: flex;
    justify-content: center;
    gap: 5px;
    padding: 5px;
    align-items: center;
`;

const DeleteButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    background: red;
    height: 20px;
    width: 20px;
    padding: 0px;
    text-align: center;
    transition: all 0.25s;
    &:hover {
        filter: brightness(0.7);
    }
`;

type FileDisplayProps = {
    file: File;
    onDelete?: (file: File) => void;
};

export const FileDisplay = memo(({ file, onDelete }: FileDisplayProps) => {
    const handleDelete = useCallback(() => void onDelete?.(file), []);

    return (
        <FileDisplayBox>
            <DeleteButton onClick={handleDelete}>x</DeleteButton>
            <span>{file.name}</span>
        </FileDisplayBox>
    );
});
