export class RcfForms {
    private _id: string;
    private _rcfId: string;
    private _ownerId: string;
    private _fileName: string;
    private _title: string;
    private _formType: TemplateType;
    private _contentType: ContentType;
    private _storageKey: string;

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