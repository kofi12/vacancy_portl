import type { RcfFormRepo } from "../../domain/repositories/rcf_form_repo.ts";
import type { RcfRepo } from "../../domain/repositories/rcf_repo.ts";
import { RcfForm } from "../../domain/entities/rcf_form.ts";
import type { CreateRcfFormDto, RcfFormResponseDto } from "../dtos/rcf_form_dtos.ts";
import { ApplicationError, AppErrorCode, NotFoundError, UnexpectedError } from "../exceptions/app_errors.ts";
import { RcfFormNotFoundException } from "../../domain/exceptions/rcf_form_exceptions.ts";
import { RcfNotFoundException } from "../../domain/exceptions/rcf_exceptions.ts";

export class RcfFormService {
    constructor(
        private readonly rcfFormRepo: RcfFormRepo,
        private readonly rcfRepo: RcfRepo,
    ) {}

    async createRcfForm(dto: CreateRcfFormDto): Promise<RcfFormResponseDto> {
        try {
            await this.rcfRepo.findById(dto.rcfId);
            const form = RcfForm.create(dto.rcfId, dto.fileName, dto.title, dto.formType, dto.contentType, dto.storageKey);
            await this.rcfFormRepo.create(form);
            return this.toResponseDto(form);
        } catch (e) {
            if (e instanceof RcfNotFoundException) throw new NotFoundError(AppErrorCode.RCF_NOT_FOUND, `RCF ${dto.rcfId} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getRcfFormById(id: string): Promise<RcfFormResponseDto> {
        try {
            const form = await this.rcfFormRepo.findById(id);
            return this.toResponseDto(form);
        } catch (e) {
            if (e instanceof RcfFormNotFoundException) throw new NotFoundError(AppErrorCode.RCF_FORM_NOT_FOUND, `RCF form ${id} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async getRcfFormsByRcfId(rcfId: string): Promise<RcfFormResponseDto[]> {
        try {
            await this.rcfRepo.findById(rcfId);
            const forms = await this.rcfFormRepo.findAllByRcfId(rcfId);
            return forms.map(f => this.toResponseDto(f));
        } catch (e) {
            if (e instanceof RcfNotFoundException) throw new NotFoundError(AppErrorCode.RCF_NOT_FOUND, `RCF ${rcfId} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    async deleteRcfForm(id: string): Promise<RcfFormResponseDto> {
        try {
            const form = await this.rcfFormRepo.findById(id);
            await this.rcfFormRepo.delete(id);
            return this.toResponseDto(form);
        } catch (e) {
            if (e instanceof RcfFormNotFoundException) throw new NotFoundError(AppErrorCode.RCF_FORM_NOT_FOUND, `RCF form ${id} not found`, e);
            if (e instanceof ApplicationError) throw e;
            throw new UnexpectedError(AppErrorCode.UNEXPECTED_ERROR, "Unexpected error", e);
        }
    }

    private toResponseDto(form: RcfForm): RcfFormResponseDto {
        return {
            id: form.id,
            rcfId: form.rcfId,
            fileName: form.fileName,
            title: form.title,
            formType: form.formType,
            contentType: form.contentType,
            storageKey: form.storageKey,
        };
    }
}
