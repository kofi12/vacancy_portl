import type { TemplateType, ContentType } from "../../domain/entities/rcf_form.ts";

export interface CreateRcfFormDto {
    rcfId: string;
    fileName: string;
    title: string;
    formType: TemplateType;
    contentType: ContentType;
    storageKey: string;
}

export interface RcfFormResponseDto {
    id: string;
    rcfId: string;
    fileName: string;
    title: string;
    formType: TemplateType;
    contentType: ContentType;
    storageKey: string;
}
