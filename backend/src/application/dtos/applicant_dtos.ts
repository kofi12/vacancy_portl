export interface CreateApplicantDto {
    rpId: string;
    name: string;
    dob: string;
    age: number;
    careNeeds: string;
}

export interface UpdateApplicantDto {
    name?: string;
    dob?: string;
    age?: number;
    careNeeds?: string;
}

export interface ApplicantResponseDto {
    id: string;
    rpId: string;
    name: string;
    dob: string;
    age: number;
    careNeeds: string;
    createdAt: string;
    updatedAt: string | null;
}
