import type {
    ApplicationRepo,
    RcfRepo,
    ApplicantRepo,
    RcfFormRepo,
    ApplicationDocumentRepo,
    UserRepo
} from "../../domain/repositories/index.ts";
import { Application } from "../../domain/entities/application.ts";
import type {
    CreateApplicationDto,
    SubmitApplicationDto,
    UpdateApplicationStatusDto,
    ApplicationResponseDto
} from "../dtos/application_dtos.ts";
import { ApplicationError, AppErrorCode, NotFoundError, BusinessRuleError, UnexpectedError, ForbiddenError } from "../exceptions/app_errors.ts";
import { RcfNotFoundException } from "../../domain/exceptions/rcf_exceptions.ts";
import { ApplicantNotFoundException } from "../../domain/exceptions/applicant_exceptions.ts";
import { ApplicationNotFoundException } from "../../domain/exceptions/application_exceptions.ts";
import { Status } from "../../domain/entities/application.ts";
import { UserNotFoundException } from "../../domain/exceptions/user_exceptions.ts";

export class ApplicationService {
    constructor(
        private readonly applicationRepo: ApplicationRepo,
        private readonly rcfRepo: RcfRepo,
        private readonly applicantRepo: ApplicantRepo,
        private readonly rcfFormRepo: RcfFormRepo,
        private readonly applicationDocumentRepo: ApplicationDocumentRepo,
        private readonly userRepo: UserRepo,
    ) { }

    async createApplication(dto: CreateApplicationDto): Promise<ApplicationResponseDto> {
        try {
            await this.applicantRepo.findById(dto.applicantId);
            const rcf = await this.rcfRepo.findById(dto.rcfId);
            if (!rcf.isActive) throw new BusinessRuleError(AppErrorCode.INACTIVE_RCF, "RCF is not accepting applications");

            const application = Application.create(dto.rcfId, dto.applicantId, dto.rpId);
            await this.applicationRepo.create(application);
            return this.toResponseDto(application);
        } catch (e) {
            if (e instanceof RcfNotFoundException) throw new NotFoundError(AppErrorCode.RCF_NOT_FOUND, `RCF ${dto.rcfId} not found`, e);
            if (e instanceof ApplicantNotFoundException) throw new NotFoundError(AppErrorCode.APPLICANT_NOT_FOUND, `Applicant ${dto.applicantId} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async submitApplication(dto: SubmitApplicationDto): Promise<ApplicationResponseDto> {
        try {
            const application = await this.applicationRepo.findById(dto.applicationId);

            if (application.rpId !== dto.requestingRpId)
                throw new ForbiddenError(AppErrorCode.NOT_APPLICATION_OWNER, "You do not own this application");

            if (application.status !== Status.SUBMITTED)
                throw new BusinessRuleError(AppErrorCode.INVALID_STATUS_TRANSITION, "Application is already submitted");

            const requiredForms = await this.rcfFormRepo.findAllByRcfId(application.rcfId);
            const uploadedDocs = await this.applicationDocumentRepo.findAllByApplicationId(application.id);
            const uploadedTypes = new Set(uploadedDocs.map(doc => doc.type));
            for (const form of requiredForms) {
                if (!uploadedTypes.has(form.formType))
                    throw new BusinessRuleError(AppErrorCode.DOCUMENTS_INCOMPLETE, `Missing document for form type: ${form.formType}`);
            }

            await this.applicationRepo.update(application);
            return this.toResponseDto(application);
        } catch (e) {
            if (e instanceof ApplicationNotFoundException) throw new NotFoundError(AppErrorCode.APPLICATION_NOT_FOUND, "Application not found", e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async updateApplicationStatus(dto: UpdateApplicationStatusDto): Promise<ApplicationResponseDto> {
        try {
            const application = await this.applicationRepo.findById(dto.applicationId);

            const terminal = [Status.ACCEPTED, Status.DECLINED];
            if (terminal.includes(application.status))
                throw new BusinessRuleError(AppErrorCode.INVALID_STATUS_TRANSITION, `Application is already ${application.status.toLowerCase()}`);

            if (dto.status === Status.DECLINED && !dto.declineReason)
                throw new BusinessRuleError(AppErrorCode.INVALID_STATUS_TRANSITION, "A decline reason is required");

            application.status = dto.status;
            application.declineReason = dto.declineReason ?? null;
            await this.applicationRepo.update(application);
            return this.toResponseDto(application);
        } catch (e) {
            if (e instanceof ApplicationNotFoundException) throw new NotFoundError(AppErrorCode.APPLICATION_NOT_FOUND, "Application not found", e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getApplicationById(id: string): Promise<ApplicationResponseDto> {
        try {
            const application = await this.applicationRepo.findById(id);
            return this.toResponseDto(application);
        } catch (e) {
            if (e instanceof ApplicationNotFoundException) throw new NotFoundError(AppErrorCode.APPLICATION_NOT_FOUND, "Application not found", e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getApplicationsByRcfId(rcfId: string): Promise<ApplicationResponseDto[]> {
        try {
            await this.rcfRepo.findById(rcfId);
            const applications = await this.applicationRepo.findAllByRcfId(rcfId);
            return applications.map(a => this.toResponseDto(a));
        } catch (e) {
            if (e instanceof RcfNotFoundException) throw new NotFoundError(AppErrorCode.RCF_NOT_FOUND, `RCF ${rcfId} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getApplicationsByRpId(rpId: string): Promise<ApplicationResponseDto[]> {
        try {
            await this.userRepo.findById(rpId);
            const applications = await this.applicationRepo.findAllByRpId(rpId);
            return applications.map(a => this.toResponseDto(a));
        } catch (e) {
            if (e instanceof UserNotFoundException) throw new NotFoundError(AppErrorCode.USER_NOT_FOUND, `User ${rpId} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getApplicationsByApplicantId(applicantId: string): Promise<ApplicationResponseDto[]> {
        try {
            await this.applicantRepo.findById(applicantId);
            const applications = await this.applicationRepo.findAllByApplicantId(applicantId);
            return applications.map(a => this.toResponseDto(a));
        } catch (e) {
            if (e instanceof ApplicantNotFoundException) throw new NotFoundError(AppErrorCode.APPLICANT_NOT_FOUND, `Applicant ${applicantId} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getApplicationsByRpIdAndRcfId(rpId: string, rcfId: string): Promise<ApplicationResponseDto[]> {
        try {
            await this.userRepo.findById(rpId);
            await this.rcfRepo.findById(rcfId);
            const applications = await this.applicationRepo.findAllByRpIdAndRcfId(rpId, rcfId);
            return applications.map(a => this.toResponseDto(a));
        } catch (e) {
            if (e instanceof RcfNotFoundException) throw new NotFoundError(AppErrorCode.RCF_NOT_FOUND, `RCF ${rcfId} not found`, e);
            if (e instanceof UserNotFoundException) throw new NotFoundError(AppErrorCode.USER_NOT_FOUND, `User ${rpId} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async deleteApplication(id: string, requestingRpId: string): Promise<ApplicationResponseDto> {
        try {
            const application = await this.applicationRepo.findById(id);
            if (application.rpId !== requestingRpId)
                throw new ForbiddenError(AppErrorCode.NOT_APPLICATION_OWNER, "You do not own this application");
            await this.applicationRepo.delete(id);
            return this.toResponseDto(application);
        } catch (e) {
            if (e instanceof ApplicationNotFoundException) throw new NotFoundError(AppErrorCode.APPLICATION_NOT_FOUND, `Application ${id} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    private toResponseDto(application: Application): ApplicationResponseDto {
        return {
            id: application.id,
            rcfId: application.rcfId,
            applicantId: application.applicantId,
            rpId: application.rpId,
            status: application.status,
            declineReason: application.declineReason,
            submittedAt: application.submittedAt?.toISOString() ?? null,
            createdAt: application.createdAt.toISOString(),
            updatedAt: application.updatedAt?.toISOString() ?? null,
        };
    }
}
