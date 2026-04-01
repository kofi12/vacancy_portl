import {
    NoApplicationIdException,
    NoContentTypeException,
    NoOriginalFileNameException,
    NoTypeException,
} from "../exceptions/application_document_exception.ts";
import {
    NoStorageKeyException,
    InvalidFormTypeException,
    InvalidContentTypeException,
} from "../exceptions/shared_exceptions.ts";

export class ApplicationDocument {

    private _id: string;
    private _applicationId: string;
    private _type: FormType;
    private _originalFileName: string;
    private _contentType: ContentType;
    private _storageKey: string;

    get id(): string { return this._id; }
    get applicationId(): string { return this._applicationId; }
    get type(): FormType { return this._type; }
    get originalFileName(): string { return this._originalFileName; }
    get contentType(): ContentType { return this._contentType; }
    get storageKey(): string { return this._storageKey; }

    set type(value: FormType) {
        if (!(value in FormType)) throw new InvalidFormTypeException("Invalid form type", new Error());
        this._type = value;
    }
    set originalFileName(value: string) {
        if (!value) throw new NoOriginalFileNameException("Original file name is required", new Error());
        this._originalFileName = value;
    }
    set contentType(value: ContentType) {
        if (!Object.values(ContentType).includes(value)) throw new InvalidContentTypeException("Invalid content type", new Error());
        this._contentType = value;
    }
    set storageKey(value: string) {
        if (!value) throw new NoStorageKeyException("Storage key is required", new Error());
        this._storageKey = value;
    }

    private constructor(
        applicationId: string,
        type: FormType,
        originalFileName: string,
        contentType: ContentType,
        storageKey: string
    ) {
        this._id = crypto.randomUUID();
        this._applicationId = applicationId;
        this._type = type;
        this._originalFileName = originalFileName;
        this._contentType = contentType;
        this._storageKey = storageKey;
    }

    static create(
        applicationId: string,
        type: FormType,
        originalFileName: string,
        contentType: ContentType,
        storageKey: string,
    ) {
        if (!applicationId) throw new NoApplicationIdException("Application ID is required", new Error());
        if (type === undefined || type === null) throw new NoTypeException("Type is required", new Error());
        if (!originalFileName) throw new NoOriginalFileNameException("Original file name is required", new Error());
        if (!contentType) throw new NoContentTypeException("Content type is required", new Error());
        if (!storageKey) throw new NoStorageKeyException("Storage key is required", new Error());
        if (!(type in FormType)) throw new InvalidFormTypeException("Invalid form type", new Error());
        if (!Object.values(ContentType).includes(contentType)) throw new InvalidContentTypeException("Invalid content type", new Error());

        return new ApplicationDocument(
            applicationId,
            type,
            originalFileName,
            contentType,
            storageKey
        );
    }
}

enum FormType {
    "INTAKE",
    "SCHEDULE_20",
    "CUSTOM",
}

enum ContentType {
    "PDF" = 'application/pdf',
    "JSON" = 'application/json',
    "ZIP" = 'application/zip',
    "MULTIPART" = 'multipart/form-data'
}