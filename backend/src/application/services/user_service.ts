import type { UserRepo } from "../../domain/repositories/user_repo.ts";
import { User } from "../../domain/entities/user.ts";
import type {
    CreateUserDto,
    CreateUserFromGoogleDto,
    UpdateUserDto,
    UserResponseDto
} from "../dtos/user_dtos.ts";
import { ApplicationError, AppErrorCode, NotFoundError, UnexpectedError } from "../exceptions/app_errors.ts";
import { UserNotFoundException } from "../../domain/exceptions/user_exceptions.ts";

export class UserService {
    constructor(private readonly userRepo: UserRepo) {}

    async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
        try {
            const user = User.create(dto.role, dto.fullName, dto.email, dto.phone);
            await this.userRepo.create(user);
            return this.toResponseDto(user);
        } catch (e) {
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async createUserFromGoogle(dto: CreateUserFromGoogleDto): Promise<UserResponseDto> {
        try {
            const user = User.createFromGoogle(dto.role, dto.fullName, dto.email, dto.phone, dto.authSubject);
            await this.userRepo.create(user);
            return this.toResponseDto(user);
        } catch (e) {
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getUserById(id: string): Promise<UserResponseDto> {
        try {
            const user = await this.userRepo.findById(id);
            return this.toResponseDto(user);
        } catch (e) {
            if (e instanceof UserNotFoundException) throw new NotFoundError(AppErrorCode.USER_NOT_FOUND, `User ${id} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getUserByEmail(email: string): Promise<UserResponseDto> {
        try {
            const user = await this.userRepo.findByEmail(email);
            return this.toResponseDto(user);
        } catch (e) {
            if (e instanceof UserNotFoundException) throw new NotFoundError(AppErrorCode.USER_NOT_FOUND, `User with email ${email} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async updateUser(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
        try {
            const user = await this.userRepo.findById(id);
            if (dto.fullName) user.fullName = dto.fullName;
            if (dto.email) user.email = dto.email;
            if (dto.phone) user.phone = dto.phone;
            if (dto.title !== undefined) user.title = dto.title ?? null;
            if (dto.organization !== undefined) user.organization = dto.organization ?? null;
            await this.userRepo.update(user);
            return this.toResponseDto(user);
        } catch (e) {
            if (e instanceof UserNotFoundException) throw new NotFoundError(AppErrorCode.USER_NOT_FOUND, `User ${id} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async deleteUser(id: string): Promise<UserResponseDto> {
        try {
            const user = await this.userRepo.findById(id);
            await this.userRepo.delete(id);
            return this.toResponseDto(user);
        } catch (e) {
            if (e instanceof UserNotFoundException) throw new NotFoundError(AppErrorCode.USER_NOT_FOUND, `User ${id} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    private toResponseDto(user: User): UserResponseDto {
        return {
            id: user.id,
            role: user.role,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            title: user.title,
            organization: user.organization,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt?.toISOString() ?? null,
        };
    }
}
