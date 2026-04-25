import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../../application/services/user_service.ts';
import { User, Role } from '../../domain/entities/user.ts';
import type { UserRepo } from '../../domain/repositories/user_repo.ts';
import { NotFoundError, UnexpectedError } from '../../application/exceptions/app_errors.ts';
import { UserNotFoundException } from '../../domain/exceptions/user_exceptions.ts';

const mockUserRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByAuthSubject: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
} as unknown as UserRepo;

const service = new UserService(mockUserRepo);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('UserService', () => {
    describe('createUser', () => {
        it('creates and returns a user DTO', async () => {
            vi.mocked(mockUserRepo.create).mockResolvedValue({} as any);

            const result = await service.createUser({
                role: Role.RP,
                fullName: 'Alice Smith',
                email: 'alice@example.com',
                phone: null,
            });

            expect(mockUserRepo.create).toHaveBeenCalled();
            expect(result.fullName).toBe('Alice Smith');
            expect(result.email).toBe('alice@example.com');
            expect(result.role).toBe(Role.RP);
        });

        it('wraps unexpected repo errors in UnexpectedError', async () => {
            vi.mocked(mockUserRepo.create).mockRejectedValue(new Error('db down'));

            await expect(service.createUser({
                role: Role.RP,
                fullName: 'Alice Smith',
                email: 'alice@example.com',
                phone: null,
            })).rejects.toBeInstanceOf(UnexpectedError);
        });
    });

    describe('createUserFromGoogle', () => {
        it('creates and returns a user DTO with google auth fields', async () => {
            vi.mocked(mockUserRepo.create).mockResolvedValue({} as any);

            const result = await service.createUserFromGoogle({
                role: Role.RP,
                fullName: 'Alice Smith',
                email: 'alice@example.com',
                phone: null,
                authSubject: 'google-subject-123',
            });

            expect(mockUserRepo.create).toHaveBeenCalled();
            expect(result.fullName).toBe('Alice Smith');
        });
    });

    describe('getUserById', () => {
        it('returns the user DTO', async () => {
            const user = User.create(Role.RP, 'Alice Smith', 'alice@example.com', null);
            vi.mocked(mockUserRepo.findById).mockResolvedValue(user);

            const result = await service.getUserById(user.id);

            expect(result.id).toBe(user.id);
            expect(result.email).toBe('alice@example.com');
        });

        it('throws NotFoundError when user does not exist', async () => {
            vi.mocked(mockUserRepo.findById).mockRejectedValue(new UserNotFoundException('bad-id'));

            await expect(service.getUserById('bad-id')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('getUserByEmail', () => {
        it('returns the user DTO', async () => {
            const user = User.create(Role.RP, 'Alice Smith', 'alice@example.com', null);
            vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(user);

            const result = await service.getUserByEmail('alice@example.com');

            expect(result.email).toBe('alice@example.com');
        });

        it('throws NotFoundError when email does not exist', async () => {
            vi.mocked(mockUserRepo.findByEmail).mockRejectedValue(
                new UserNotFoundException('alice@example.com')
            );

            await expect(service.getUserByEmail('alice@example.com')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('updateUser', () => {
        it('updates and returns the user DTO', async () => {
            const user = User.create(Role.RP, 'Alice Smith', 'alice@example.com', null);
            vi.mocked(mockUserRepo.findById).mockResolvedValue(user);
            vi.mocked(mockUserRepo.update).mockResolvedValue(user);

            const result = await service.updateUser(user.id, { fullName: 'Alice Jones' });

            expect(result.fullName).toBe('Alice Jones');
            expect(mockUserRepo.update).toHaveBeenCalled();
        });

        it('throws NotFoundError when user does not exist', async () => {
            vi.mocked(mockUserRepo.findById).mockRejectedValue(new UserNotFoundException('bad-id'));

            await expect(service.updateUser('bad-id', { fullName: 'X' })).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('deleteUser', () => {
        it('deletes and returns the user DTO', async () => {
            const user = User.create(Role.RP, 'Alice Smith', 'alice@example.com', null);
            vi.mocked(mockUserRepo.findById).mockResolvedValue(user);
            vi.mocked(mockUserRepo.delete).mockResolvedValue(user);

            const result = await service.deleteUser(user.id);

            expect(result.id).toBe(user.id);
            expect(mockUserRepo.delete).toHaveBeenCalledWith(user.id);
        });

        it('throws NotFoundError when user does not exist', async () => {
            vi.mocked(mockUserRepo.findById).mockRejectedValue(new UserNotFoundException('bad-id'));

            await expect(service.deleteUser('bad-id')).rejects.toBeInstanceOf(NotFoundError);
        });
    });
});
