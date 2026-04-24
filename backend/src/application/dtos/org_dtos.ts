export interface CreateOrgDto {
    ownerId: string;
    name: string;
}

export interface UpdateOrgDto {
    name?: string;
}

export interface OrgResponseDto {
    id: string;
    ownerId: string;
    name: string;
    createdAt: string;
    updatedAt: string | null;
}
