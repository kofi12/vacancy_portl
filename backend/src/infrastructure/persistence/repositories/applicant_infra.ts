import { Applicant } from '../../../domain/entities/applicant';
import { prisma } from '../prisma/prisma_client';
import type { ApplicantRepo } from '../../../domain/repositories/applicant_repo';
import { ApplicantMapper } from '../mappers/applicant_mapper';
import { 
    ApplicantNotFoundException, 
    ApplicantUpdateException, 
    ApplicantDeleteException 
} from '../../../domain/exceptions/applicant_exceptions';

export class ApplicantInfrastructure implements ApplicantRepo {
    
    async findAllByRpId(rpId: string): Promise<Applicant[]> {
        const applicants = await prisma.applicant.findMany({where: {rpId}});
        return applicants.map((r) => ApplicantMapper.toDomain(r));
    }
    
    async create(entity: Applicant): Promise<Applicant> {
        await prisma.applicant.create({
            data: ApplicantMapper.toPrisma(entity),
        });
        return entity;
    }
    
    async findById(id: string): Promise<Applicant> {
        const applicant = await prisma.applicant.findUnique({where: {id}});
        if (!applicant) {
            throw new ApplicantNotFoundException(`Applicant with id ${id} not found`);
        }
        return ApplicantMapper.toDomain(applicant);
    }
    
    async update(entity: Applicant): Promise<Applicant> {
        try {
            await prisma.applicant.update({
                where: {id: entity.id},
                data: ApplicantMapper.toPrisma(entity),
            });
            return entity;
        } catch (e) {
            const error = e instanceof Error ? e : new Error(String(e));
            throw new ApplicantUpdateException(`Failed to update applicant: ${error.message}`, error);
        }
    }
    
    async delete(id: string): Promise<Applicant> {
        try {
            const deleted = await prisma.applicant.delete({where: {id}});
            return ApplicantMapper.toDomain(deleted);
        } catch (e) {
            const error = e instanceof Error ? e : new Error(String(e));
            throw new ApplicantDeleteException(`Failed to delete applicant: ${error.message}`, error);
        }    
    }
    
}
