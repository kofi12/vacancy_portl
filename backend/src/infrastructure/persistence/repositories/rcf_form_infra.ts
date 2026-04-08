import { RcfFormMapper } from '../mappers/rcf_form_mapper';
import { RcfForm } from '../../../domain/entities/rcf_form';
import type { RcfFormRepo } from '../../../domain/repositories/rcf_forms_repo';
import { prisma } from '../prisma/prisma_client';
import { RcfFormNotFoundException } from '../../../domain/exceptions/rcf_form_exceptions';

export class RcfFormInfrastucture implements RcfFormRepo {

    async findAllByRcfId(rcfId: string): Promise<RcfForm[]> {
        const rcfPrismaForms = await prisma.rcfForm.findMany({ where: { rcfId } });
        return rcfPrismaForms.map((r) => RcfFormMapper.toDomain(r));

    }

    async create(entity: RcfForm): Promise<RcfForm> {
        await prisma.rcfForm.create({ data: RcfFormMapper.toPrisma(entity) });
        return entity;
    }

    async findById(id: string): Promise<RcfForm> {
        const rcfForm = await prisma.rcfForm.findUnique({ where: { id } });
        if (!rcfForm) { throw new RcfFormNotFoundException("Rcf Form not found", new Error()) };
        return RcfFormMapper.toDomain(rcfForm);
    }

    async update(entity: RcfForm): Promise<RcfForm> {
        try {
            await prisma.rcfForm.update({
                where: { id: entity.id },
                data: RcfFormMapper.toPrisma(entity),
            });
            return entity;

        } catch (e) {
            throw new RcfFormNotFoundException("Rcf not found", new Error());
        }
    }

    async delete(id: string): Promise<RcfForm> {
        try {
            const deleted = await prisma.rcfForm.delete({ where: { id } });
            return RcfFormMapper.toDomain(deleted);
        } catch (e) {
            throw new RcfFormNotFoundException("Rcf not found", new Error());
        }
    }

}
