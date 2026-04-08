import {
    ApplicationDocument,
    ContentType
} from '../../../domain/entities/application_document';
import { TemplateType } from '../../../domain/entities/rcf_form';
import type {
    TemplateType as PrismaTemplateType,
    ContentType as PrismaContentType
} from '../generated/prisma/enums';
import type { ApplicationDocumentModel } from '../generated/prisma/models/ApplicationDocument';

export class ApplicationDocumentMapper {

    static toDomain(
        {
            id,
            applicationId,
            type,
            originalFileName,
            contentType,
            storageKey,
        }: ApplicationDocumentModel
    ) {
        return ApplicationDocument.reconstitute(
            id,
            applicationId,
            type as unknown as TemplateType,
            originalFileName,
            contentType as unknown as ContentType,
            storageKey
        )
    }

    static toPrisma(applicationDocument: ApplicationDocument) {
        return {
            id: applicationDocument.id,
            applicationId: applicationDocument.applicationId,
            type: applicationDocument.type as unknown as PrismaTemplateType,
            originalFileName: applicationDocument.originalFileName,
            contentType: applicationDocument.contentType as unknown as PrismaContentType,
            storageKey: applicationDocument.storageKey,
        }
    }
}
