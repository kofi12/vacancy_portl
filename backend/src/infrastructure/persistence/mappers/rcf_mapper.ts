import type { RcfModel } from '../generated/prisma/models/Rcf';
import { Rcf } from '../../../domain/entities/rcf';

export class RcfMapper {

    static toDomain(
        {
            id,
            orgId,
            name,
            address,
            phone,
            licensedBeds,
            currentOpenings,
            isActive,
            createdAt,
            updatedAt
        }: RcfModel
    ): Rcf {
        return Rcf.reconstitute(
            id,
            orgId,
            name,
            address,
            phone,
            licensedBeds,
            currentOpenings,
            isActive,
            createdAt,
            updatedAt
        )
    }
    static toPrisma(rcf: Rcf) {

        return {
            id: rcf.id,
            orgId: rcf.orgId,
            name: rcf.name,
            address: rcf.address,
            phone: rcf.phone,
            licensedBeds: rcf.licensedBeds,
            currentOpenings: rcf.currentOpenings,
            isActive: rcf.isActive,
            createdAt: rcf.createdAt,
            updatedAt: rcf.updatedAt ?? undefined
        };
    }
}