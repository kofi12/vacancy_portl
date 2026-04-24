import type { ApplicationDocumentRepo } from "../../domain/repositories/application_document_repo.ts";
import type { ApplicationRepo } from "../../domain/repositories/application_repo.ts";
import { ApplicationDocument } from "../../domain/entities/application_document.ts";
import type { UploadDocumentDto, ApplicationDocumentResponseDto } from "../dtos/application_document_dtos.ts";
import { ApplicationError, AppErrorCode, NotFoundError, UnexpectedError } from "../exceptions/app_errors.ts";
import { ApplicationNotFoundException } from "../../domain/exceptions/application_exceptions.ts";

export class ApplicationDocumentService {
    constructor(
        private readonly applicationDocumentRepo: ApplicationDocumentRepo,
        private readonly applicationRepo: ApplicationRepo,
    ) {}

    async uploadDocument(dto: UploadDocumentDto): Promise<ApplicationDocumentResponseDto> {
        try {
            await this.applicationRepo.findById(dto.applicationId);
            const doc = ApplicationDocument.create(dto.applicationId, dto.type, dto.originalFileName, dto.contentType, dto.storageKey);
            await this.applicationDocumentRepo.create(doc);
            return this.toResponseDto(doc);
        } catch (e) {
            if (e instanceof ApplicationNotFoundException) throw new NotFoundError(AppErrorCode.APPLICATION_NOT_FOUND, `Application ${dto.applicationId} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getDocumentById(id: string): Promise<ApplicationDocumentResponseDto> {
        try {
            const doc = await this.applicationDocumentRepo.findById(id);
            return this.toResponseDto(doc);
        } catch (e) {
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getDocumentsByApplicationId(applicationId: string): Promise<ApplicationDocumentResponseDto[]> {
        try {
            await this.applicationRepo.findById(applicationId);
            const docs = await this.applicationDocumentRepo.findAllByApplicationId(applicationId);
            return docs.map(d => this.toResponseDto(d));
        } catch (e) {
            if (e instanceof ApplicationNotFoundException) throw new NotFoundError(AppErrorCode.APPLICATION_NOT_FOUND, `Application ${applicationId} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async deleteDocument(id: string): Promise<ApplicationDocumentResponseDto> {
        try {
            const doc = await this.applicationDocumentRepo.findById(id);
            await this.applicationDocumentRepo.delete(id);
            return this.toResponseDto(doc);
        } catch (e) {
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    private toResponseDto(doc: ApplicationDocument): ApplicationDocumentResponseDto {
        return {
            id: doc.id,
            applicationId: doc.applicationId,
            type: doc.type,
            originalFileName: doc.originalFileName,
            contentType: doc.contentType,
            storageKey: doc.storageKey,
        };
    }
}
