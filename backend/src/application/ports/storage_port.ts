export interface StoragePort {
    upload(key: string, data: Buffer, contentType: string): Promise<void>;
    getSignedDownloadUrl(key: string, expiresInSeconds: number): Promise<string>;
    delete(key: string): Promise<void>;

}