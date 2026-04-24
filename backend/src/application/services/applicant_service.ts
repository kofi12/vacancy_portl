import type { ApplicantRepo } from "../../domain/repositories/applicant_repo.ts";
import type { UserRepo } from "../../domain/repositories/user_repo.ts";
import { Applicant } from "../../domain/entities/applicant.ts";
import type { CreateApplicantDto, UpdateApplicantDto, ApplicantResponseDto } from "../dtos/applicant_dtos.ts";
import { ApplicationError, AppErrorCode, NotFoundError, ForbiddenError, UnexpectedError } from "../exceptions/app_errors.ts";
import { ApplicantNotFoundException } from "../../domain/exceptions/applicant_exceptions.ts";
import { UserNotFoundException } from "../../domain/exceptions/user_exceptions.ts";

export class ApplicantService {
    constructor(
        private readonly applicantRepo: ApplicantRepo,
        private readonly userRepo: UserRepo,
    ) {}

    async createApplicant(dto: CreateApplicantDto): Promise<ApplicantResponseDto> {
        try {
            await this.userRepo.findById(dto.rpId);
            const applicant = Applicant.create(dto.rpId, dto.name);
            await this.applicantRepo.create(applicant);
            return this.toResponseDto(applicant);
        } catch (e) {
            if (e instanceof UserNotFoundException) throw new NotFoundError(AppErrorCode.USER_NOT_FOUND, `User ${dto.rpId} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getApplicantById(id: string): Promise<ApplicantResponseDto> {
        try {
            const applicant = await this.applicantRepo.findById(id);
            return this.toResponseDto(applicant);
        } catch (e) {
            if (e instanceof ApplicantNotFoundException) throw new NotFoundError(AppErrorCode.APPLICANT_NOT_FOUND, `Applicant ${id} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getApplicantsByRpId(rpId: string): Promise<ApplicantResponseDto[]> {
        try {
            await this.userRepo.findById(rpId);
            const applicants = await this.applicantRepo.findAllByRpId(rpId);
            return applicants.map(a => this.toResponseDto(a));
        } catch (e) {
            if (e instanceof UserNotFoundException) throw new NotFoundError(AppErrorCode.USER_NOT_FOUND, `User ${rpId} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async updateApplicant(id: string, requestingRpId: string, dto: UpdateApplicantDto): Promise<ApplicantResponseDto> {
        try {
            const applicant = await this.applicantRepo.findById(id);
            if (applicant.rpId !== requestingRpId)
                throw new ForbiddenError(AppErrorCode.NOT_APPLICANT_OWNER, "You do not own this applicant");
            if (dto.name) applicant.name = dto.name;
            await this.applicantRepo.update(applicant);
            return this.toResponseDto(applicant);
        } catch (e) {
            if (e instanceof ApplicantNotFoundException) throw new NotFoundError(AppErrorCode.APPLICANT_NOT_FOUND, `Applicant ${id} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async deleteApplicant(id: string, requestingRpId: string): Promise<ApplicantResponseDto> {
        try {
            const applicant = await this.applicantRepo.findById(id);
            if (applicant.rpId !== requestingRpId)
                throw new ForbiddenError(AppErrorCode.NOT_APPLICANT_OWNER, "You do not own this applicant");
            await this.applicantRepo.delete(id);
            return this.toResponseDto(applicant);
        } catch (e) {
            if (e instanceof ApplicantNotFoundException) throw new NotFoundError(AppErrorCode.APPLICANT_NOT_FOUND, `Applicant ${id} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    private toResponseDto(applicant: Applicant): ApplicantResponseDto {
        return {
            id: applicant.id,
            rpId: applicant.rpId,
            name: applicant.name,
            createdAt: applicant.createdAt.toISOString(),
            updatedAt: applicant.updatedAt?.toISOString() ?? null,
        };
    }
}
