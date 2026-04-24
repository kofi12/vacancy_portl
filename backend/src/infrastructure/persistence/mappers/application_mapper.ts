import type { ApplicationModel } from '../generated/prisma/models/Application';
import type { Status as PrismaStatus } from '../generated/prisma/enums.ts';
import { Application, Status } from '../../../domain/entities/application';

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
            status as unknown as Status,
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
            status: application.status as unknown as PrismaStatus,
            submittedAt: application.submittedAt,
            createdAt: application.createdAt,
        };
    }
}