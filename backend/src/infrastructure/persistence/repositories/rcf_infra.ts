import { Rcf } from '../../../domain/entities/rcf';
import type { RcfRepo } from '../../../domain/repositories/rcf_repo';
import { RcfNotFoundException } from '../../../domain/exceptions/rcf_exceptions';
import { RcfMapper } from '../mappers/rcf_mapper';
import { prisma } from '../prisma/prisma_client';

export class RcfInfrastructure implements RcfRepo {

    async findAllByOrgId(orgId: string): Promise<Rcf[]> {
        const prismaRcfs = await prisma.rcf.findMany({ where: { orgId } });
        return prismaRcfs.map((r) => RcfMapper.toDomain(r));
    }

    async findAllActiveWithOpeningsByOrgId(orgId: string): Promise<Rcf[]> {
        const prismaRcfs = await prisma.rcf.findMany({
            where: {
                orgId,
                currentOpenings: { gt: 0 },
            },
        });
        return prismaRcfs.map((r) => RcfMapper.toDomain(r));
    }

    async create(entity: Rcf): Promise<Rcf> {
        const prismaRcf = RcfMapper.toPrisma(entity);
        await prisma.rcf.create({ data: prismaRcf })
        return entity;
    }

    async findById(id: string): Promise<Rcf> {
        const rcf = await prisma.rcf.findUnique({ where: { id } });
        if (!rcf) {
            throw new RcfNotFoundException(id);
        }
        return RcfMapper.toDomain(rcf);
    }

    async update(entity: Rcf): Promise<Rcf> {
        try {
            await prisma.rcf.update({
                where: { id: entity.id },
                data: RcfMapper.toPrisma(entity),
            })
        } catch (e) {
            throw new RcfNotFoundException("Rcf does not exist");
        }
        return entity;
    }

    async delete(id: string): Promise<Rcf> {
        try {
            const deleted = await prisma.rcf.delete({ where: { id } });
            return RcfMapper.toDomain(deleted);
        } catch {
            throw new RcfNotFoundException("Rcf doesn't exist");
        }
    }
}