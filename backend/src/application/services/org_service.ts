import type { OrganizationRepo } from "../../domain/repositories/org_repo.ts";
import type { UserRepo } from "../../domain/repositories/user_repo.ts";
import { Organization } from "../../domain/entities/org.ts";
import type { CreateOrgDto, UpdateOrgDto, OrgResponseDto } from "../dtos/org_dtos.ts";
import { ApplicationError, AppErrorCode, NotFoundError, ConflictError, UnexpectedError } from "../exceptions/app_errors.ts";
import { OrganizationNotFoundException } from "../../domain/exceptions/org_exceptions.ts";
import { UserNotFoundException } from "../../domain/exceptions/user_exceptions.ts";

export class OrgService {
    constructor(
        private readonly orgRepo: OrganizationRepo,
        private readonly userRepo: UserRepo,
    ) {}

    async createOrg(dto: CreateOrgDto): Promise<OrgResponseDto> {
        try {
            await this.userRepo.findById(dto.ownerId);
            const existing = await this.orgRepo.findByOwnerId(dto.ownerId).catch(() => null);
            if (existing) throw new ConflictError(AppErrorCode.ORG_ALREADY_EXISTS_FOR_OWNER, `Owner ${dto.ownerId} already has an organization`);

            const org = Organization.create(dto.ownerId, dto.name, new Date());
            await this.orgRepo.create(org);
            return this.toResponseDto(org);
        } catch (e) {
            if (e instanceof UserNotFoundException) throw new NotFoundError(AppErrorCode.USER_NOT_FOUND, `User ${dto.ownerId} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getOrgById(id: string): Promise<OrgResponseDto> {
        try {
            const org = await this.orgRepo.findById(id);
            return this.toResponseDto(org);
        } catch (e) {
            if (e instanceof OrganizationNotFoundException) throw new NotFoundError(AppErrorCode.ORG_NOT_FOUND, `Organization ${id} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getOrgByOwnerId(ownerId: string): Promise<OrgResponseDto> {
        try {
            const org = await this.orgRepo.findByOwnerId(ownerId);
            return this.toResponseDto(org);
        } catch (e) {
            if (e instanceof OrganizationNotFoundException) throw new NotFoundError(AppErrorCode.ORG_NOT_FOUND, `Organization for owner ${ownerId} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async updateOrg(id: string, dto: UpdateOrgDto): Promise<OrgResponseDto> {
        try {
            const org = await this.orgRepo.findById(id);
            if (dto.name) org.name = dto.name;
            await this.orgRepo.update(org);
            return this.toResponseDto(org);
        } catch (e) {
            if (e instanceof OrganizationNotFoundException) throw new NotFoundError(AppErrorCode.ORG_NOT_FOUND, `Organization ${id} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async deleteOrg(id: string): Promise<OrgResponseDto> {
        try {
            const org = await this.orgRepo.findById(id);
            await this.orgRepo.delete(id);
            return this.toResponseDto(org);
        } catch (e) {
            if (e instanceof OrganizationNotFoundException) throw new NotFoundError(AppErrorCode.ORG_NOT_FOUND, `Organization ${id} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    private toResponseDto(org: Organization): OrgResponseDto {
        return {
            id: org.id,
            ownerId: org.ownerId,
            name: org.name,
            createdAt: org.createdAt.toISOString(),
            updatedAt: org.updatedAt?.toISOString() ?? null,
        };
    }
}
