import { UPLOAD_CHUNK_SIZE } from './constants';

// 1234567890
// 0, 3 -> 123
// 3, 6 ->  456
// 6, 9 -> 789
// 9, 12 -> 0

export function* chunkFile(file: File) {
    const last = Math.ceil(file.size / UPLOAD_CHUNK_SIZE);
    let start = 0;

    for (let i = 0; i <= Math.ceil(file.size / UPLOAD_CHUNK_SIZE); i++) {
        yield { chunk: file.slice(start, start + UPLOAD_CHUNK_SIZE), last: i === last };
        start += UPLOAD_CHUNK_SIZE;
    }
}
