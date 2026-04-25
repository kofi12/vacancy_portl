import { Applicant } from '../../../domain/entities/applicant';
import type { ApplicantModel } from '../generated/prisma/models/Applicant';

export class ApplicantMapper {

    static toDomain(
        {
            id,
            rpId,
            name,
            age,
            careNeeds,
            createdAt,
            updatedAt,
        }: ApplicantModel
    ): Applicant {
        return Applicant.reconstitute(
            id,
            rpId,
            name,
            age,
            careNeeds,
            createdAt,
            updatedAt,
        );
    }

    static toPrisma(applicant: Applicant) {
        return {
            id: applicant.id,
            rpId: applicant.rpId,
            name: applicant.name,
            age: applicant.age,
            careNeeds: applicant.careNeeds,
            createdAt: applicant.createdAt,
            updatedAt: applicant.updatedAt ?? undefined,
        };
    }
}