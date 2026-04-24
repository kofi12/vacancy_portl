export class StorageError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = "StorageError";
        this.cause = cause;
    }
}