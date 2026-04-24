import type { TemplateType, ContentType } from "../../domain/entities/rcf_form.ts";

export interface UploadDocumentDto {
    applicationId: string;
    type: TemplateType;
    originalFileName: string;
    contentType: ContentType;
    storageKey: string;
}

export interface ApplicationDocumentResponseDto {
    id: string;
    applicationId: string;
    type: TemplateType;
    originalFileName: string;
    contentType: ContentType;
    storageKey: string;
}
