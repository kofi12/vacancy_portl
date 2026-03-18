class ApplicationDocument {

    private _id: string;
    private _applicantId: string;
    private _applicationId: string;
    private _type: FormType;
    private _originalFileName: string;
    private _contentType: ContentType;
    private _storageKey: string;

    get id(): string {return this._id;}
    get applicantId(): string {return this._applicantId;}
    get applicationId(): string {return this._applicationId;}
    get type(): FormType {return this._type;}
    get originalFileName(): string {return this._originalFileName;}
    get contentType(): ContentType {return this._contentType;}
    get storageKey(): string {return this._storageKey;}

    set type(value: FormType) {this._type = value;}
    set originalFileName(value: string) {this._originalFileName = value;}
    set contentType(value: ContentType) {this._contentType = value;}
    set storageKey(value: string) {this._storageKey = value;}

    constructor(
        applicantId: string,
        applicationId: string,
        type: FormType,
        originalFileName: string,
        contentType: ContentType,
        storageKey: string
    ){
        this._applicantId = applicantId;
        this._applicationId = applicationId;
        this._type = type;
        this._originalFileName = originalFileName;
        this._contentType = contentType;
        this._storageKey = storageKey;
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