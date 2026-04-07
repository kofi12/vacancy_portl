import { ApplicationMapper } from '../mappers/application_mapper';
import { Application } from '../../../domain/entities/application';
import { prisma } from '../prisma/prisma_client';
import type { ApplicationRepo } from '../../../domain/repositories/application_repo';

export class ApplicationInfrastructure implements ApplicationRepo {
    async findAllByRcfId(rcfId: string): Promise<Application[]> {
        const applications = await prisma.application.findMany({ where: { rcfId } });
        return applications.map((r) => ApplicationMapper.toDomain(r))
    }
    async findAllByRpId(rpId: string): Promise<Application[]> {
        const applications = await prisma.application.findMany({ where: { rpId } });
        return applications.map((r) => ApplicationMapper.toDomain(r))
    }
    async findAllByRpIdAndRcfId(rpId: string, rcfId: string): Promise<Application[]> {

        //TODO: How to search via 2 keys
        const applications = await prisma.application.findMany({ where: { rcfId }, });
        return applications.map((r) => ApplicationMapper.toDomain(r))
    }
    async findAllByApplicantId(applicantId: string): Promise<Application[]> {
        const applications = await prisma.application.findMany({ where: { applicantId } });
        return applications.map((r) => ApplicationMapper.toDomain(r))
    }
    async create(entity: Application): Promise<Application> {
        await prisma.application.create({ data: ApplicationMapper.toPrisma(entity) });
        return entity;
    }
    async findById(id: string): Promise<Application> {
        const application = await prisma.application.findUnique({ where: { id } });
        if (!application) { throw new Error("Error") };
        return ApplicationMapper.toDomain(application);
    }
    async update(entity: Application): Promise<Application> {
        try {
            await prisma.application.update({
                where: { id: entity.id },
                data: ApplicationMapper.toPrisma(entity)
            });
            return entity;
        } catch (e) {

            throw new Error('Method not implemented.');
        }
    }
    async delete(id: string): Promise<Application> {
        try {
            const deleted = await prisma.application.delete({ where: { id } });
            return ApplicationMapper.toDomain(deleted);
        } catch (e) {
            throw new Error('Method not implemented.');
        }
    }

}
