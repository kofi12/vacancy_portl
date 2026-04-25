import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RcfFormService } from '../../application/services/rcf_form_service.ts';
import { RcfForm, TemplateType, ContentType } from '../../domain/entities/rcf_form.ts';
import type { RcfFormRepo } from '../../domain/repositories/rcf_form_repo.ts';
import type { RcfRepo } from '../../domain/repositories/rcf_repo.ts';
import { NotFoundError } from '../../application/exceptions/app_errors.ts';
import { RcfFormNotFoundException } from '../../domain/exceptions/rcf_form_exceptions.ts';
import { RcfNotFoundException } from '../../domain/exceptions/rcf_exceptions.ts';

const mockRcfFormRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findAllByRcfId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
} as unknown as RcfFormRepo;

const mockRcfRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findAllByOrgId: vi.fn(),
    findAllActiveWithOpeningsByOrgId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
} as unknown as RcfRepo;

const service = new RcfFormService(mockRcfFormRepo, mockRcfRepo);

const makeForm = (rcfId = 'rcf-1') =>
    RcfForm.create(rcfId, 'intake.pdf', 'Intake Form', TemplateType.INTAKE_FORM, ContentType.PDF, 'rcf-forms/rcf-1/uuid');

beforeEach(() => {
    vi.clearAllMocks();
});

describe('RcfFormService', () => {
    describe('createRcfForm', () => {
        it('creates and returns an RCF form DTO', async () => {
            vi.mocked(mockRcfRepo.findById).mockResolvedValue({} as any);
            vi.mocked(mockRcfFormRepo.create).mockResolvedValue({} as any);

            const result = await service.createRcfForm({
                rcfId: 'rcf-1',
                fileName: 'intake.pdf',
                title: 'Intake Form',
                formType: TemplateType.INTAKE_FORM,
                contentType: ContentType.PDF,
                storageKey: 'rcf-forms/rcf-1/uuid',
            });

            expect(mockRcfFormRepo.create).toHaveBeenCalled();
            expect(result.rcfId).toBe('rcf-1');
            expect(result.formType).toBe(TemplateType.INTAKE_FORM);
        });

        it('throws NotFoundError when RCF does not exist', async () => {
            vi.mocked(mockRcfRepo.findById).mockRejectedValue(new RcfNotFoundException('rcf-1'));

            await expect(service.createRcfForm({
                rcfId: 'rcf-1',
                fileName: 'intake.pdf',
                title: 'Intake Form',
                formType: TemplateType.INTAKE_FORM,
                contentType: ContentType.PDF,
                storageKey: 'key',
            })).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('getRcfFormById', () => {
        it('returns the RCF form DTO', async () => {
            const form = makeForm();
            vi.mocked(mockRcfFormRepo.findById).mockResolvedValue(form);

            const result = await service.getRcfFormById(form.id);

            expect(result.id).toBe(form.id);
            expect(result.title).toBe('Intake Form');
        });

        it('throws NotFoundError when form does not exist', async () => {
            vi.mocked(mockRcfFormRepo.findById).mockRejectedValue(
                new RcfFormNotFoundException('not found', new Error())
            );

            await expect(service.getRcfFormById('bad-id')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('getRcfFormsByRcfId', () => {
        it('returns all forms for an RCF', async () => {
            const forms = [makeForm(), makeForm()];
            vi.mocked(mockRcfRepo.findById).mockResolvedValue({} as any);
            vi.mocked(mockRcfFormRepo.findAllByRcfId).mockResolvedValue(forms);

            const result = await service.getRcfFormsByRcfId('rcf-1');

            expect(result).toHaveLength(2);
        });

        it('throws NotFoundError when RCF does not exist', async () => {
            vi.mocked(mockRcfRepo.findById).mockRejectedValue(new RcfNotFoundException('rcf-1'));

            await expect(service.getRcfFormsByRcfId('rcf-1')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('deleteRcfForm', () => {
        it('deletes and returns the RCF form DTO', async () => {
            const form = makeForm();
            vi.mocked(mockRcfFormRepo.findById).mockResolvedValue(form);
            vi.mocked(mockRcfFormRepo.delete).mockResolvedValue(form);

            const result = await service.deleteRcfForm(form.id);

            expect(result.id).toBe(form.id);
            expect(mockRcfFormRepo.delete).toHaveBeenCalledWith(form.id);
        });

        it('throws NotFoundError when form does not exist', async () => {
            vi.mocked(mockRcfFormRepo.findById).mockRejectedValue(
                new RcfFormNotFoundException('not found', new Error())
            );

            await expect(service.deleteRcfForm('bad-id')).rejects.toBeInstanceOf(NotFoundError);
        });
    });
});
