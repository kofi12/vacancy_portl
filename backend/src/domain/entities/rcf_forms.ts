import {
    NoRcfIdException,
    NoOwnerIdException,
    NoFileNameException,
    NoTitleException,
    InvalidFormTypeException,
    InvalidContentTypeException,
    NoStorageKeyException
} from "../exceptions/rcf_form_exceptions.ts";

export class RcfForm {
    private _id: string;
    private _rcfId: string;
    private _ownerId: string;
    private _fileName: string;
    private _title: string;
    private _formType: TemplateType;
    private _contentType: ContentType;
    private _storageKey: string;

    constructor(
        rcfId: string,
        ownerId: string,
        fileName: string,
        title: string,
        formType: TemplateType,
        contentType: ContentType,
        storageKey: string,
    ) {
        this._id = crypto.randomUUID();
        this._rcfId = rcfId;
        this._ownerId = ownerId;
        this._fileName = fileName;
        this._title = title;
        this._formType = formType;
        this._contentType = contentType;
        this._storageKey = storageKey;
    }

    get id(): string { return this._id; }
    get rcfId(): string { return this._rcfId; }
    get ownerId(): string { return this._ownerId; }
    get fileName(): string { return this._fileName; }
    get title(): string { return this._title; }
    get formType(): TemplateType { return this._formType; }
    get contentType(): ContentType { return this._contentType; }
    get storageKey(): string { return this._storageKey; }

    set fileName(value: string) { this._fileName = value; }
    set title(value: string) { this._title = value; }
    set formType(value: TemplateType) { this._formType = value; }
    set contentType(value: ContentType) { this._contentType = value; }
    set storageKey(value: string) { this._storageKey = value; }

    static create(
        rcfId: string,
        ownerId: string,
        fileName: string,
        title: string,
        formType: TemplateType,
        contentType: ContentType,
        storageKey: string,
    ) {
        if (!rcfId) throw new NoRcfIdException("RCF ID is required", new Error());
        if (!ownerId) throw new NoOwnerIdException("Owner ID is required", new Error());
        if (!fileName) throw new NoFileNameException("File name is required", new Error());
        if (!title) throw new NoTitleException("Title is required", new Error());
        if (!(formType in TemplateType)) throw new InvalidFormTypeException("Form type is required", new Error());
        // fix content type validation below
        if (!(contentType in ContentType)) throw new InvalidContentTypeException("Content type is required", new Error());
        if (!storageKey) throw new NoStorageKeyException("Storage key is required", new Error());

        return new RcfForm(
            rcfId,
            ownerId,
            fileName,
            title,
            formType,
            contentType,
            storageKey,
        )
    }
}

enum TemplateType {
    "INTAKE_FORM",
    "SCHEDULE_20",
    "CUSTOM",
}

enum ContentType {
    "PDF" = 'application/pdf',
    "JSON" = 'application/json',
    "ZIP" = 'application/zip',
    "MULTIPART" = 'multipart/form-data'
}