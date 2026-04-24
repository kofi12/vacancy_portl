import type { StoragePort } from '../../application/ports/storage_port';

export class GcsStorageAdapter implements StoragePort {

    upload(key: string, data: Buffer, contentType: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    getSignedDownloadUrl(key: string, expiresInSeconds: number): Promise<string> {
        throw new Error('Method not implemented.');
    }
    delete(key: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

}