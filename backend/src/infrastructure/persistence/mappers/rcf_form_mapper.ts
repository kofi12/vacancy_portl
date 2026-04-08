import { RcfForm, TemplateType, ContentType } from '../../../domain/entities/rcf_form';
import type { RcfFormModel } from '../generated/prisma/models/RcfForm';
import type { TemplateType as PrismaTemplateType, ContentType as PrismaContentType } from '../generated/prisma/enums';


export class RcfFormMapper {

    static toDomain({
        id,
        rcfId,
        fileName,
        title,
        formType,
        contentType,
        storageKey
    }: RcfFormModel): RcfForm {
        return RcfForm.reconstitute(
            id,
            rcfId,
            fileName,
            title,
            formType as unknown as TemplateType,
            contentType as unknown as ContentType,
            storageKey,
        )
    }

    static toPrisma(rcfForm: RcfForm) {
        return {
            id: rcfForm.id,
            rcfId: rcfForm.rcfId,
            fileName: rcfForm.fileName,
            title: rcfForm.title,
            formType: rcfForm.formType as unknown as PrismaTemplateType,
            contentType: rcfForm.contentType as unknown as PrismaContentType,
            storageKey: rcfForm.storageKey,
        }
    }
}
