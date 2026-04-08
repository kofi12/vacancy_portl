import { Organization } from '../../../domain/entities/org';
import type { OrganizationRepo } from '../../../domain/repositories/org_repo';
import { OrganizationMapper } from '../mappers/org_mapper';
import { prisma } from '../prisma/prisma_client';
import { OrganizationNotFoundException } from '../../../domain/exceptions/org_exceptions';

export class OrganizationInfrastructure implements OrganizationRepo {

    async create(entity: Organization): Promise<Organization> {
        const prismaOrg = OrganizationMapper.toPrisma(entity);
        await prisma.organization.create({ data: prismaOrg });
        return entity;
    }

    async findById(id: string): Promise<Organization> {
        const org = await prisma.organization.findUnique({ where: { id } });
        if (!org) {
            throw new OrganizationNotFoundException(id);
        }
        return OrganizationMapper.toDomain(org);
    }

    async update(entity: Organization): Promise<Organization> {
        try {
            await prisma.organization.update({
                where: { id: entity.id },
                data: OrganizationMapper.toPrisma(entity),
            });
            return entity;
        } catch (e) {
            throw new OrganizationNotFoundException(entity.id);
        }
    }

    async delete(id: string): Promise<Organization> {
        try {
            const deleted = await prisma.organization.delete({ where: { id } });
            return OrganizationMapper.toDomain(deleted);
        } catch (e) {
            throw new OrganizationNotFoundException(id);
        }
    }

    async findByOwnerId(ownerId: string): Promise<Organization> {

        const org = await prisma.organization.findUnique({
            where: { ownerId }
        });

        if (!org) {
            throw new OrganizationNotFoundException(ownerId);
        }
        return OrganizationMapper.toDomain(org);
    }
}