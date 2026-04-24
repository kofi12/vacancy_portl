import type { Status } from "../../domain/entities/application.ts";

export interface CreateApplicationDto {
    rcfId: string;
    applicantId: string;
    rpId: string;
}

export interface SubmitApplicationDto {
    applicationId: string;
    requestingRpId: string;
}

export interface ApplicationResponseDto {
    id: string;
    rcfId: string;
    applicantId: string;
    rpId: string;
    status: Status;
    submittedAt: string | null;
    createdAt: string;
    updatedAt: string | null;
}
