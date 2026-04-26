import type { StoragePort } from '../../application/ports/storage_port';
import { StorageError } from './storage_error';
import { Storage } from '@google-cloud/storage';

export class GcsStorageAdapter implements StoragePort {

    private storage: Storage;
    private bucketName: string;

    constructor(bucketName: string) {
        this.bucketName = bucketName;
        this.storage = new Storage({
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        });
    }

    async upload(key: string, data: Buffer, contentType: string): Promise<void> {
        try {
            await this.storage.bucket(this.bucketName).file(key).save(data, { contentType });
        } catch (e) {
            throw new StorageError(`Failed to upload file: ${key}`, e);
        }
    }
    async getSignedDownloadUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
        try {
            const [url] = await this.storage.bucket(this.bucketName).file(key).getSignedUrl({
                action: "read",
                expires: Date.now() + expiresInSeconds * 1000
            });
            return url
        } catch (e) {
            throw new StorageError(`Failed to generate download URL for: ${key}`, e);
        }
    }
    async delete(key: string): Promise<void> {
        try {
            await this.storage.bucket(this.bucketName).file(key).delete();
        } catch (e) {
            throw new StorageError(`Failed to delete file: ${key}`, e)
        }
    }

}