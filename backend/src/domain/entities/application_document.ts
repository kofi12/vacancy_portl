class ApplicationDocument {

    private _id: string;
    private _applicantId: string;
    private _templateId: string;
    private _type: FormType;
    private _originalFileName: string;
    private _contentType: ContentType;
    private _storageKey: string;

    public get id(): string {return this._id;}
    public get applicantId(): string {return this._applicantId;}
    public get templateId(): string {return this._templateId;}
    public get type(): FormType {return this._type;}
    public set type(value: FormType) {this._type = value;}
    public get originalFileName(): string {return this._originalFileName;}
    public set originalFileName(value: string) {this._originalFileName = value;}
    public get contentType(): ContentType {return this._contentType;}
    public set contentType(value: ContentType) {this._contentType = value;}
    public get storageKey(): string {return this._storageKey;}
    public set storageKey(value: string) {this._storageKey = value;}

    constructor(
        applicantId: string,
        templateId: string,
        type: FormType,
        originalFileName: string,
        contentType: ContentType,
        storageKey: string
    ){
        this._applicantId = applicantId;
        this._templateId = templateId;
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