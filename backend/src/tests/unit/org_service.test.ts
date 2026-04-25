import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrgService } from '../../application/services/org_service.ts';
import { Organization } from '../../domain/entities/org.ts';
import { User, Role } from '../../domain/entities/user.ts';
import type { OrganizationRepo } from '../../domain/repositories/org_repo.ts';
import type { UserRepo } from '../../domain/repositories/user_repo.ts';
import { NotFoundError, ConflictError } from '../../application/exceptions/app_errors.ts';
import { OrganizationNotFoundException } from '../../domain/exceptions/org_exceptions.ts';
import { UserNotFoundException } from '../../domain/exceptions/user_exceptions.ts';

const mockOrgRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findByOwnerId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
} as unknown as OrganizationRepo;

const mockUserRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByAuthSubject: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
} as unknown as UserRepo;

const service = new OrgService(mockOrgRepo, mockUserRepo);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('OrgService', () => {
    describe('createOrg', () => {
        it('creates and returns an org DTO', async () => {
            const owner = User.create(Role.OWNER, 'Bob', 'bob@example.com', null);
            vi.mocked(mockUserRepo.findById).mockResolvedValue(owner);
            vi.mocked(mockOrgRepo.findByOwnerId).mockRejectedValue(new OrganizationNotFoundException('none'));
            vi.mocked(mockOrgRepo.create).mockResolvedValue({} as any);

            const result = await service.createOrg({ ownerId: owner.id, name: 'Sunny Acres' });

            expect(mockOrgRepo.create).toHaveBeenCalled();
            expect(result.name).toBe('Sunny Acres');
            expect(result.ownerId).toBe(owner.id);
        });

        it('throws NotFoundError when owner does not exist', async () => {
            vi.mocked(mockUserRepo.findById).mockRejectedValue(new UserNotFoundException('bad-id'));

            await expect(service.createOrg({ ownerId: 'bad-id', name: 'Org' }))
                .rejects.toBeInstanceOf(NotFoundError);
        });

        it('throws ConflictError when owner already has an org', async () => {
            const owner = User.create(Role.OWNER, 'Bob', 'bob@example.com', null);
            const existing = Organization.create(owner.id, 'Existing Org', new Date());
            vi.mocked(mockUserRepo.findById).mockResolvedValue(owner);
            vi.mocked(mockOrgRepo.findByOwnerId).mockResolvedValue(existing);

            await expect(service.createOrg({ ownerId: owner.id, name: 'New Org' }))
                .rejects.toBeInstanceOf(ConflictError);
        });
    });

    describe('getOrgById', () => {
        it('returns the org DTO', async () => {
            const org = Organization.create('owner-1', 'Sunny Acres', new Date());
            vi.mocked(mockOrgRepo.findById).mockResolvedValue(org);

            const result = await service.getOrgById(org.id);

            expect(result.id).toBe(org.id);
            expect(result.name).toBe('Sunny Acres');
        });

        it('throws NotFoundError when org does not exist', async () => {
            vi.mocked(mockOrgRepo.findById).mockRejectedValue(new OrganizationNotFoundException('bad-id'));

            await expect(service.getOrgById('bad-id')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('getOrgByOwnerId', () => {
        it('returns the org DTO', async () => {
            const org = Organization.create('owner-1', 'Sunny Acres', new Date());
            vi.mocked(mockOrgRepo.findByOwnerId).mockResolvedValue(org);

            const result = await service.getOrgByOwnerId('owner-1');

            expect(result.ownerId).toBe('owner-1');
        });

        it('throws NotFoundError when no org exists for owner', async () => {
            vi.mocked(mockOrgRepo.findByOwnerId).mockRejectedValue(
                new OrganizationNotFoundException('owner-1')
            );

            await expect(service.getOrgByOwnerId('owner-1')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('updateOrg', () => {
        it('updates and returns the org DTO', async () => {
            const org = Organization.create('owner-1', 'Old Name', new Date());
            vi.mocked(mockOrgRepo.findById).mockResolvedValue(org);
            vi.mocked(mockOrgRepo.update).mockResolvedValue(org);

            const result = await service.updateOrg(org.id, { name: 'New Name' });

            expect(result.name).toBe('New Name');
            expect(mockOrgRepo.update).toHaveBeenCalled();
        });

        it('throws NotFoundError when org does not exist', async () => {
            vi.mocked(mockOrgRepo.findById).mockRejectedValue(new OrganizationNotFoundException('bad-id'));

            await expect(service.updateOrg('bad-id', { name: 'X' })).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('deleteOrg', () => {
        it('deletes and returns the org DTO', async () => {
            const org = Organization.create('owner-1', 'Sunny Acres', new Date());
            vi.mocked(mockOrgRepo.findById).mockResolvedValue(org);
            vi.mocked(mockOrgRepo.delete).mockResolvedValue(org);

            const result = await service.deleteOrg(org.id);

            expect(result.id).toBe(org.id);
            expect(mockOrgRepo.delete).toHaveBeenCalledWith(org.id);
        });

        it('throws NotFoundError when org does not exist', async () => {
            vi.mocked(mockOrgRepo.findById).mockRejectedValue(new OrganizationNotFoundException('bad-id'));

            await expect(service.deleteOrg('bad-id')).rejects.toBeInstanceOf(NotFoundError);
        });
    });
});
