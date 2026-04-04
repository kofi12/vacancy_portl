import { User } from '../../../domain/entities/user.ts';
import { UserNotFoundException } from '../../../domain/exceptions/user_exceptions.ts';
import { UserMapper } from '../mappers/user_mapper.ts';
import type { UserRepo } from '../../../domain/repositories/user_repo.ts';
import { prisma } from '../prisma/prisma_client.ts';

export class UserInfrastructure implements UserRepo {
    async findByEmail(email: string): Promise<User> {
        // need to access the user table and check for a user that matches the email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new UserNotFoundException("User with this email doesn't exist");
        }
        return UserMapper.toDomain(user);

    }
    async create(entity: User): Promise<User> {

        const prismaUser = UserMapper.toPrisma(entity)
        await prisma.user.create({ data: prismaUser })
        return entity
    }
    async findById(id: string): Promise<User> {

        const user = await prisma.user.findUnique({ where: { id } })
        if (!user) {
            throw new UserNotFoundException("User with this id doesn't exist");
        }
        return UserMapper.toDomain(user);
    }
    async update(entity: User): Promise<User> {
        try {
            await prisma.user.update(
                {
                    where: { id: entity.id },
                    data: UserMapper.toPrisma(entity),
                });
            return entity;
        } catch (e) {
            throw new UserNotFoundException(entity.id);
        }
    }
    async delete(id: string): Promise<User> {
        try {
            const deleted = await prisma.user.delete({ where: { id } });
            return UserMapper.toDomain(deleted);
        } catch (e) {
            throw new UserNotFoundException(id);
        }
    }

}