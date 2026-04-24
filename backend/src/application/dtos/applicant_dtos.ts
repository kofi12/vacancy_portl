export interface CreateApplicantDto {
    rpId: string;
    name: string;
}

export interface UpdateApplicantDto {
    name?: string;
}

export interface ApplicantResponseDto {
    id: string;
    rpId: string;
    name: string;
    createdAt: string;
    updatedAt: string | null;
}
