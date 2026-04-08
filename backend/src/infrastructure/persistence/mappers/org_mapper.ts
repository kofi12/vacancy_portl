import type { OrganizationModel } from '../generated/prisma/models/Organization';
import { Organization } from '../../../domain/entities/org';

export class OrganizationMapper {

    static toDomain(
        { id, ownerId, name, createdAt, updatedAt }: OrganizationModel
    ): Organization {
        return Organization.reconstitute(
            id,
            ownerId,
            name,
            createdAt,
            updatedAt
        );
    }
    static toPrisma(org: Organization) {

        return {
            id: org.id,
            ownerId: org.ownerId,
            name: org.name,
        };
    }
}