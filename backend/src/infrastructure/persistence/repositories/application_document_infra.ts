import { ApplicationDocument } from '../../../domain/entities/application_document';
import type { ApplicationDocumentRepo } from '../../../domain/repositories/application_document_repo';
import { prisma } from '../prisma/prisma_client';
import { ApplicationDocumentMapper } from '../mappers/application_document_mapper';

export class ApplicationDocumentInfrastructure implements ApplicationDocumentRepo {

    async findAllByApplicationId(applicationId: string): Promise<ApplicationDocument[]> {
        const applicationDocuments = await prisma.applicationDocument.findMany(
            { where: { applicationId } }
        );
        return applicationDocuments.map((r) => ApplicationDocumentMapper.toDomain(r));
    }

    async create(entity: ApplicationDocument): Promise<ApplicationDocument> {
        await prisma.applicationDocument.create(
            { data: ApplicationDocumentMapper.toPrisma(entity) }
        );
        return entity;
    }

    async findById(id: string): Promise<ApplicationDocument> {
        const applicationDocument = await prisma.applicationDocument.findUnique({ where: { id } });
        if (!applicationDocument) {
            throw new Error('Method not implemented.');
        }
        return ApplicationDocumentMapper.toDomain(applicationDocument);
    }

    async update(entity: ApplicationDocument): Promise<ApplicationDocument> {
        try {
            await prisma.applicationDocument.update({
                where: { id: entity.id },
                data: ApplicationDocumentMapper.toPrisma(entity),
            });
            return entity;
        } catch (e) {

            throw new Error('Method not implemented.');
        }
    }

    async delete(id: string): Promise<ApplicationDocument> {
        try {
            const deleted = await prisma.applicationDocument.delete({ where: { id } });
            return ApplicationDocumentMapper.toDomain(deleted);
        } catch (e) {
            throw new Error('Method not implemented.');
        }
    }

}