import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RcfService } from '../../application/services/rcf_service.ts';
import { Rcf } from '../../domain/entities/rcf.ts';
import { Organization } from '../../domain/entities/org.ts';
import type { RcfRepo } from '../../domain/repositories/rcf_repo.ts';
import type { OrganizationRepo } from '../../domain/repositories/org_repo.ts';
import { NotFoundError, ConflictError, UnexpectedError } from '../../application/exceptions/app_errors.ts';
import { RcfNotFoundException } from '../../domain/exceptions/rcf_exceptions.ts';
import { OrganizationNotFoundException } from '../../domain/exceptions/org_exceptions.ts';

const mockRcfRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findAllByOrgId: vi.fn(),
    findAllActiveWithOpeningsByOrgId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
} as unknown as RcfRepo;

const mockOrgRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findByOwnerId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
} as unknown as OrganizationRepo;

const service = new RcfService(mockRcfRepo, mockOrgRepo);

const makeRcf = (orgId = 'org-1', name = 'Sunrise RCF') =>
    Rcf.create(orgId, name, 10, 5, true);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('RcfService', () => {
    describe('createRcf', () => {
        it('creates and returns an RCF DTO', async () => {
            vi.mocked(mockOrgRepo.findById).mockResolvedValue({} as any);
            vi.mocked(mockRcfRepo.findAllByOrgId).mockResolvedValue([]);
            vi.mocked(mockRcfRepo.create).mockResolvedValue({} as any);

            const result = await service.createRcf({
                orgId: 'org-1',
                name: 'Sunrise RCF',
                licensedBeds: 10,
                currentOpenings: 5,
                isActive: true,
            });

            expect(mockRcfRepo.create).toHaveBeenCalled();
            expect(result.name).toBe('Sunrise RCF');
            expect(result.licensedBeds).toBe(10);
        });

        it('throws NotFoundError when org does not exist', async () => {
            vi.mocked(mockOrgRepo.findById).mockRejectedValue(new OrganizationNotFoundException('org-1'));

            await expect(service.createRcf({
                orgId: 'org-1', name: 'RCF', licensedBeds: 10, currentOpenings: 5, isActive: true,
            })).rejects.toBeInstanceOf(NotFoundError);
        });

        it('throws ConflictError when an RCF with the same name exists in the org', async () => {
            const existing = makeRcf('org-1', 'Sunrise RCF');
            vi.mocked(mockOrgRepo.findById).mockResolvedValue({} as any);
            vi.mocked(mockRcfRepo.findAllByOrgId).mockResolvedValue([existing]);

            await expect(service.createRcf({
                orgId: 'org-1', name: 'Sunrise RCF', licensedBeds: 10, currentOpenings: 5, isActive: true,
            })).rejects.toBeInstanceOf(ConflictError);
        });
    });

    describe('getRcfById', () => {
        it('returns the RCF DTO', async () => {
            const rcf = makeRcf();
            vi.mocked(mockRcfRepo.findById).mockResolvedValue(rcf);

            const result = await service.getRcfById(rcf.id);

            expect(result.id).toBe(rcf.id);
            expect(result.name).toBe('Sunrise RCF');
        });

        it('throws NotFoundError when RCF does not exist', async () => {
            vi.mocked(mockRcfRepo.findById).mockRejectedValue(new RcfNotFoundException('bad-id'));

            await expect(service.getRcfById('bad-id')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('getRcfsByOrgId', () => {
        it('returns all RCFs for an org', async () => {
            const rcfs = [makeRcf(), makeRcf('org-1', 'Sunset RCF')];
            vi.mocked(mockOrgRepo.findById).mockResolvedValue({} as any);
            vi.mocked(mockRcfRepo.findAllByOrgId).mockResolvedValue(rcfs);

            const result = await service.getRcfsByOrgId('org-1');

            expect(result).toHaveLength(2);
        });

        it('throws NotFoundError when org does not exist', async () => {
            vi.mocked(mockOrgRepo.findById).mockRejectedValue(new OrganizationNotFoundException('org-1'));

            await expect(service.getRcfsByOrgId('org-1')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('getActiveRcfsWithOpeningsByOrgId', () => {
        it('returns active RCFs with openings', async () => {
            const rcf = makeRcf();
            vi.mocked(mockOrgRepo.findById).mockResolvedValue({} as any);
            vi.mocked(mockRcfRepo.findAllActiveWithOpeningsByOrgId).mockResolvedValue([rcf]);

            const result = await service.getActiveRcfsWithOpeningsByOrgId('org-1');

            expect(result).toHaveLength(1);
            expect(result[0].isActive).toBe(true);
        });

        it('throws NotFoundError when org does not exist', async () => {
            vi.mocked(mockOrgRepo.findById).mockRejectedValue(new OrganizationNotFoundException('org-1'));

            await expect(service.getActiveRcfsWithOpeningsByOrgId('org-1')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('updateRcf', () => {
        it('updates and returns the RCF DTO', async () => {
            const rcf = makeRcf();
            vi.mocked(mockRcfRepo.findById).mockResolvedValue(rcf);
            vi.mocked(mockRcfRepo.findAllByOrgId).mockResolvedValue([rcf]);
            vi.mocked(mockRcfRepo.update).mockResolvedValue(rcf);

            const result = await service.updateRcf(rcf.id, { currentOpenings: 3 });

            expect(result.currentOpenings).toBe(3);
            expect(mockRcfRepo.update).toHaveBeenCalled();
        });

        it('throws ConflictError when renaming to a name already taken in the org', async () => {
            const rcf = makeRcf('org-1', 'Sunrise RCF');
            const other = makeRcf('org-1', 'Sunset RCF');
            vi.mocked(mockRcfRepo.findById).mockResolvedValue(rcf);
            vi.mocked(mockRcfRepo.findAllByOrgId).mockResolvedValue([rcf, other]);

            await expect(service.updateRcf(rcf.id, { name: 'Sunset RCF' }))
                .rejects.toBeInstanceOf(ConflictError);
        });

        it('throws NotFoundError when RCF does not exist', async () => {
            vi.mocked(mockRcfRepo.findById).mockRejectedValue(new RcfNotFoundException('bad-id'));

            await expect(service.updateRcf('bad-id', { name: 'X' })).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('deleteRcf', () => {
        it('deletes and returns the RCF DTO', async () => {
            const rcf = makeRcf();
            vi.mocked(mockRcfRepo.findById).mockResolvedValue(rcf);
            vi.mocked(mockRcfRepo.delete).mockResolvedValue(rcf);

            const result = await service.deleteRcf(rcf.id);

            expect(result.id).toBe(rcf.id);
            expect(mockRcfRepo.delete).toHaveBeenCalledWith(rcf.id);
        });

        it('throws NotFoundError when RCF does not exist', async () => {
            vi.mocked(mockRcfRepo.findById).mockRejectedValue(new RcfNotFoundException('bad-id'));

            await expect(service.deleteRcf('bad-id')).rejects.toBeInstanceOf(NotFoundError);
        });
    });
});
