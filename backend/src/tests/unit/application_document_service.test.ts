import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplicationDocumentService } from '../../application/services/application_document_service.ts';
import { ApplicationDocument } from '../../domain/entities/application_document.ts';
import { TemplateType, ContentType } from '../../domain/entities/rcf_form.ts';
import type { ApplicationDocumentRepo } from '../../domain/repositories/application_document_repo.ts';
import type { ApplicationRepo } from '../../domain/repositories/application_repo.ts';
import type { StoragePort } from '../../application/ports/storage_port.ts';
import { NotFoundError } from '../../application/exceptions/app_errors.ts';
import { ApplicationNotFoundException } from '../../domain/exceptions/application_exceptions.ts';
import { ApplicationDocumentNotFoundException } from '../../domain/exceptions/application_document_exception.ts';

const mockApplicationDocumentRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findAllByApplicationId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
} as unknown as ApplicationDocumentRepo;

const mockApplicationRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findAllByRcfId: vi.fn(),
    findAllByRpId: vi.fn(),
    findAllByRpIdAndRcfId: vi.fn(),
    findAllByApplicantId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
} as unknown as ApplicationRepo;

const mockStoragePort = {
    upload: vi.fn(),
    getSignedDownloadUrl: vi.fn(),
    delete: vi.fn(),
} as unknown as StoragePort;

const service = new ApplicationDocumentService(mockApplicationDocumentRepo, mockApplicationRepo, mockStoragePort);

const makeDoc = (applicationId = 'app-1') =>
    ApplicationDocument.create(applicationId, TemplateType.INTAKE_FORM, 'intake.pdf', ContentType.PDF, 'app-docs/app-1/uuid');

beforeEach(() => {
    vi.clearAllMocks();
});

describe('ApplicationDocumentService', () => {
    describe('uploadDocument', () => {
        it('creates and returns a document DTO', async () => {
            vi.mocked(mockApplicationRepo.findById).mockResolvedValue({} as any);
            vi.mocked(mockApplicationDocumentRepo.create).mockResolvedValue({} as any);

            const result = await service.uploadDocument({
                applicationId: 'app-1',
                type: TemplateType.INTAKE_FORM,
                originalFileName: 'intake.pdf',
                contentType: ContentType.PDF,
                storageKey: 'app-docs/app-1/uuid',
            });

            expect(mockApplicationDocumentRepo.create).toHaveBeenCalled();
            expect(result.applicationId).toBe('app-1');
            expect(result.type).toBe(TemplateType.INTAKE_FORM);
        });

        it('throws NotFoundError when application does not exist', async () => {
            vi.mocked(mockApplicationRepo.findById).mockRejectedValue(new ApplicationNotFoundException('app-1'));

            await expect(service.uploadDocument({
                applicationId: 'app-1',
                type: TemplateType.INTAKE_FORM,
                originalFileName: 'intake.pdf',
                contentType: ContentType.PDF,
                storageKey: 'key',
            })).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('getDocumentById', () => {
        it('returns the document DTO', async () => {
            const doc = makeDoc();
            vi.mocked(mockApplicationDocumentRepo.findById).mockResolvedValue(doc);

            const result = await service.getDocumentById(doc.id);

            expect(result.id).toBe(doc.id);
            expect(result.originalFileName).toBe('intake.pdf');
        });

        it('throws NotFoundError when document does not exist', async () => {
            vi.mocked(mockApplicationDocumentRepo.findById).mockRejectedValue(
                new ApplicationDocumentNotFoundException('not found', new Error())
            );

            await expect(service.getDocumentById('bad-id')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('getDocumentsByApplicationId', () => {
        it('returns all documents for an application', async () => {
            const docs = [makeDoc(), makeDoc()];
            vi.mocked(mockApplicationRepo.findById).mockResolvedValue({} as any);
            vi.mocked(mockApplicationDocumentRepo.findAllByApplicationId).mockResolvedValue(docs);

            const result = await service.getDocumentsByApplicationId('app-1');

            expect(result).toHaveLength(2);
        });

        it('throws NotFoundError when application does not exist', async () => {
            vi.mocked(mockApplicationRepo.findById).mockRejectedValue(new ApplicationNotFoundException('app-1'));

            await expect(service.getDocumentsByApplicationId('app-1')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('deleteDocument', () => {
        it('deletes and returns the document DTO', async () => {
            const doc = makeDoc();
            vi.mocked(mockApplicationDocumentRepo.findById).mockResolvedValue(doc);
            vi.mocked(mockApplicationDocumentRepo.delete).mockResolvedValue(doc);

            const result = await service.deleteDocument(doc.id);

            expect(result.id).toBe(doc.id);
            expect(mockApplicationDocumentRepo.delete).toHaveBeenCalledWith(doc.id);
        });

        it('throws NotFoundError when document does not exist', async () => {
            vi.mocked(mockApplicationDocumentRepo.findById).mockRejectedValue(
                new ApplicationDocumentNotFoundException('not found', new Error())
            );

            await expect(service.deleteDocument('bad-id')).rejects.toBeInstanceOf(NotFoundError);
        });
    });
});
