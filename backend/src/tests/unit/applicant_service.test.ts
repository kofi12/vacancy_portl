import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplicantService } from '../../application/services/applicant_service.ts';
import { Applicant } from '../../domain/entities/applicant.ts';
import type { ApplicantRepo } from '../../domain/repositories/applicant_repo.ts';
import type { UserRepo } from '../../domain/repositories/user_repo.ts';
import { NotFoundError, ForbiddenError } from '../../application/exceptions/app_errors.ts';
import { ApplicantNotFoundException } from '../../domain/exceptions/applicant_exceptions.ts';
import { UserNotFoundException } from '../../domain/exceptions/user_exceptions.ts';

const mockApplicantRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findAllByRpId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
} as unknown as ApplicantRepo;

const mockUserRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByAuthSubject: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
} as unknown as UserRepo;

const service = new ApplicantService(mockApplicantRepo, mockUserRepo);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('ApplicantService', () => {
    describe('createApplicant', () => {
        it('creates and returns an applicant', async () => {
            vi.mocked(mockUserRepo.findById).mockResolvedValue({} as any);
            vi.mocked(mockApplicantRepo.create).mockResolvedValue({} as any);

            const result = await service.createApplicant({ rpId: 'rp-1', name: 'John Doe', age: 72, careNeeds: 'General assisted living' });

            expect(mockUserRepo.findById).toHaveBeenCalledWith('rp-1');
            expect(mockApplicantRepo.create).toHaveBeenCalled();
            expect(result.rpId).toBe('rp-1');
            expect(result.name).toBe('John Doe');
        });

        it('throws NotFoundError when the RP does not exist', async () => {
            vi.mocked(mockUserRepo.findById).mockRejectedValue(new UserNotFoundException('rp-1'));

            await expect(service.createApplicant({ rpId: 'rp-1', name: 'John Doe', age: 72, careNeeds: 'General assisted living' }))
                .rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('getApplicantById', () => {
        it('returns the applicant DTO', async () => {
            const applicant = Applicant.create('rp-1', 'Jane Doe', 68, 'Memory care support');
            vi.mocked(mockApplicantRepo.findById).mockResolvedValue(applicant);

            const result = await service.getApplicantById(applicant.id);

            expect(result.id).toBe(applicant.id);
            expect(result.name).toBe('Jane Doe');
        });

        it('throws NotFoundError when applicant does not exist', async () => {
            vi.mocked(mockApplicantRepo.findById).mockRejectedValue(
                new ApplicantNotFoundException('not found')
            );

            await expect(service.getApplicantById('bad-id')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('updateApplicant', () => {
        it('updates and returns the applicant', async () => {
            const applicant = Applicant.create('rp-1', 'Old Name', 75, 'Mobility assistance');
            vi.mocked(mockApplicantRepo.findById).mockResolvedValue(applicant);
            vi.mocked(mockApplicantRepo.update).mockResolvedValue(applicant);

            const result = await service.updateApplicant(applicant.id, 'rp-1', { name: 'New Name' });

            expect(result.name).toBe('New Name');
            expect(mockApplicantRepo.update).toHaveBeenCalled();
        });

        it('throws ForbiddenError when requester is not the owner', async () => {
            const applicant = Applicant.create('rp-1', 'John Doe', 72, 'General assisted living');
            vi.mocked(mockApplicantRepo.findById).mockResolvedValue(applicant);

            await expect(service.updateApplicant(applicant.id, 'rp-2', { name: 'Hacked' }))
                .rejects.toBeInstanceOf(ForbiddenError);
        });
    });

    describe('deleteApplicant', () => {
        it('deletes and returns the applicant DTO', async () => {
            const applicant = Applicant.create('rp-1', 'John Doe', 72, 'General assisted living');
            vi.mocked(mockApplicantRepo.findById).mockResolvedValue(applicant);
            vi.mocked(mockApplicantRepo.delete).mockResolvedValue(applicant);

            const result = await service.deleteApplicant(applicant.id, 'rp-1');

            expect(result.id).toBe(applicant.id);
            expect(mockApplicantRepo.delete).toHaveBeenCalledWith(applicant.id);
        });

        it('throws ForbiddenError when requester is not the owner', async () => {
            const applicant = Applicant.create('rp-1', 'John Doe', 72, 'General assisted living');
            vi.mocked(mockApplicantRepo.findById).mockResolvedValue(applicant);

            await expect(service.deleteApplicant(applicant.id, 'rp-2'))
                .rejects.toBeInstanceOf(ForbiddenError);
        });
    });
});
