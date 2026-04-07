import { RcfForm } from '../../../domain/entities/rcf_form';
import type { RcfFormModel } from '../generated/prisma/models/RcfForm';
import type { TemplateType, ContentType } from '../generated/prisma/enums';


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
            formType,
            contentType,
            storageKey,
        )
    }

    static toPrisma(rcfForm: RcfForm) {
        return {
            id: rcfForm.id,
            rcfId: rcfForm.rcfId,
            fileName: rcfForm.fileName,
            title: rcfForm.title,
            formType: rcfForm.formType,
            contentType: rcfForm.contentType,
            storageKey: rcfForm.storageKey,
        }
    }
}