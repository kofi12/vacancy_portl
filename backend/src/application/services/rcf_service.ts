import type { RcfRepo } from "../../domain/repositories/rcf_repo.ts";
import type { OrganizationRepo } from "../../domain/repositories/org_repo.ts";
import { Rcf } from "../../domain/entities/rcf.ts";
import type { CreateRcfDto, UpdateRcfDto, RcfResponseDto } from "../dtos/rcf_dtos.ts";
import { ApplicationError, AppErrorCode, NotFoundError, ConflictError, UnexpectedError } from "../exceptions/app_errors.ts";
import { RcfNotFoundException } from "../../domain/exceptions/rcf_exceptions.ts";
import { OrganizationNotFoundException } from "../../domain/exceptions/org_exceptions.ts";

export class RcfService {
    constructor(
        private readonly rcfRepo: RcfRepo,
        private readonly orgRepo: OrganizationRepo,
    ) {}

    async createRcf(dto: CreateRcfDto): Promise<RcfResponseDto> {
        try {
            await this.orgRepo.findById(dto.orgId);
            const existing = await this.rcfRepo.findAllByOrgId(dto.orgId);
            if (existing.some(r => r.name === dto.name))
                throw new ConflictError(AppErrorCode.RCF_NAME_CONFLICT, `RCF with name "${dto.name}" already exists in this organization`);

            const rcf = Rcf.create(dto.orgId, dto.name, dto.licensedBeds, dto.currentOpenings, dto.isActive);
            await this.rcfRepo.create(rcf);
            return this.toResponseDto(rcf);
        } catch (e) {
            if (e instanceof OrganizationNotFoundException) throw new NotFoundError(AppErrorCode.ORG_NOT_FOUND, `Organization ${dto.orgId} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getRcfById(id: string): Promise<RcfResponseDto> {
        try {
            const rcf = await this.rcfRepo.findById(id);
            return this.toResponseDto(rcf);
        } catch (e) {
            if (e instanceof RcfNotFoundException) throw new NotFoundError(AppErrorCode.RCF_NOT_FOUND, `RCF ${id} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getRcfsByOrgId(orgId: string): Promise<RcfResponseDto[]> {
        try {
            await this.orgRepo.findById(orgId);
            const rcfs = await this.rcfRepo.findAllByOrgId(orgId);
            return rcfs.map(r => this.toResponseDto(r));
        } catch (e) {
            if (e instanceof OrganizationNotFoundException) throw new NotFoundError(AppErrorCode.ORG_NOT_FOUND, `Organization ${orgId} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getActiveRcfsWithOpeningsByOrgId(orgId: string): Promise<RcfResponseDto[]> {
        try {
            await this.orgRepo.findById(orgId);
            const rcfs = await this.rcfRepo.findAllActiveWithOpeningsByOrgId(orgId);
            return rcfs.map(r => this.toResponseDto(r));
        } catch (e) {
            if (e instanceof OrganizationNotFoundException) throw new NotFoundError(AppErrorCode.ORG_NOT_FOUND, `Organization ${orgId} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async updateRcf(id: string, dto: UpdateRcfDto): Promise<RcfResponseDto> {
        try {
            const rcf = await this.rcfRepo.findById(id);

            if (dto.name && dto.name !== rcf.name) {
                const existing = await this.rcfRepo.findAllByOrgId(rcf.orgId);
                if (existing.some(r => r.name === dto.name && r.id !== id))
                    throw new ConflictError(AppErrorCode.RCF_NAME_CONFLICT, `RCF with name "${dto.name}" already exists in this organization`);
                rcf.name = dto.name;
            }
            if (dto.licensedBeds !== undefined) rcf.licensedBeds = dto.licensedBeds;
            if (dto.currentOpenings !== undefined) rcf.currentOpenings = dto.currentOpenings;
            if (dto.isActive !== undefined) rcf.isActive = dto.isActive;

            await this.rcfRepo.update(rcf);
            return this.toResponseDto(rcf);
        } catch (e) {
            if (e instanceof RcfNotFoundException) throw new NotFoundError(AppErrorCode.RCF_NOT_FOUND, `RCF ${id} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async deleteRcf(id: string): Promise<RcfResponseDto> {
        try {
            const rcf = await this.rcfRepo.findById(id);
            await this.rcfRepo.delete(id);
            return this.toResponseDto(rcf);
        } catch (e) {
            if (e instanceof RcfNotFoundException) throw new NotFoundError(AppErrorCode.RCF_NOT_FOUND, `RCF ${id} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    private toResponseDto(rcf: Rcf): RcfResponseDto {
        return {
            id: rcf.id,
            orgId: rcf.orgId,
            name: rcf.name,
            licensedBeds: rcf.licensedBeds,
            currentOpenings: rcf.currentOpenings,
            isActive: rcf.isActive,
            createdAt: rcf.createdAt.toISOString(),
            updatedAt: rcf.updatedAt?.toISOString() ?? null,
        };
    }
}
