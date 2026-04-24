import type { Role } from "../../domain/entities/user";

export interface CreateUserDto {
    role: Role;
    fullName: string;
    email: string;
    phone: string | null;
}

export interface CreateUserFromGoogleDto {
    role: Role;
    fullName: string;
    email: string;
    phone: string | null;
    authSubject: string;
}

export interface UpdateUserDto {
    fullName?: string;
    email?: string;
    phone?: string;
}

export interface UserResponseDto {
    id: string;
    role: Role;
    fullName: string;
    email: string;
    phone: string | null;
    createdAt: string;
    updatedAt: string | null;
}