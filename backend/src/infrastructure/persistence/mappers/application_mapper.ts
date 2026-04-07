import type { ApplicationModel } from '../generated/prisma/models/Application';
import { Application } from '../../../domain/entities/application';

export class ApplicationMapper {

    static toDomain({
        id,
        rcfId,
        applicantId,
        rpId,
        status,
        submittedAt,
        createdAt,
        updatedAt,
    }: ApplicationModel): Application {
        return Application.reconstitute(
            id,
            rcfId,
            applicantId,
            rpId,
            status,
            submittedAt,
            createdAt,
            updatedAt,
        );
    }

    static toPrisma(application: Application) {
        return {
            id: application.id,
            rcfId: application.rcfId,
            applicantId: application.applicantId,
            rpId: application.rpId,
            status: application.status,
            submittedAt: application.submittedAt,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt,
        };
    }
}