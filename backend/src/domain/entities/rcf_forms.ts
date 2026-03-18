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
        this._id = rcfId;
        this._ownerId = ownerId;
        this._fileName = fileName;
        this._title = title;
        this._formType = formType;
        this._contentType = contentType;
        this._storageKey = storageKey;
    }

    get id(): string {return this._id;}
    get rcfId(): string {return this._rcfId;}
    get ownerId(): string {return this._ownerId;}
    get fileName(): string {return this._fileName;}
    get title(): string {return this._title;}
    get formType(): TemplateType {return this._formType;}
    get contentType(): ContentType {return this._contentType;}
    get storageKey(): string {return this._storageKey;}

    set fileName(value: string) {this._fileName = value;}
    set title(value: string) {this._title = value;}
    set formType(value: TemplateType) {this._formType = value;}
    set contentType(value: ContentType) {this._contentType = value;}
    set storageKey(value: string) {this._storageKey = value;}

    rcfFormFactory(
        rcfId: string,
        ownerId: string,
        fileName: string,
        title: string,
        formType: TemplateType,
        contentType: ContentType,
        storageKey: string,
    ){
        const rcfForm = new RcfForm(
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