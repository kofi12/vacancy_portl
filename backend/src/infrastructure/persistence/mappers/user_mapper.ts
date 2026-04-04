import type { UserModel } from '../generated/prisma/models/User.ts';
import type { Role as PrismaRole } from '../generated/prisma/enums.ts';
import { Role, User } from '../../../domain/entities/user.ts';

export class UserMapper {

    static toDomain(
        {
            id,
            role,
            fullName,
            email,
            phone,
            authProvider,
            authSubject,
            createdAt,
            updatedAt,
        }: UserModel
    ): User {

        return User.reconstitute(
            id,
            role as unknown as Role,
            fullName,
            email,
            phone,
            authProvider,
            authSubject,
            createdAt,
            updatedAt
        );
    }

    static toPrisma(user: User) {

        return {
            id: user.id,
            role: user.role as unknown as PrismaRole,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            authProvider: user.authProvider,
            authSubject: user.authSubject,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }
}