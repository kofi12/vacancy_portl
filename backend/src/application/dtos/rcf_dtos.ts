export interface CreateRcfDto {
    orgId: string;
    name: string;
    licensedBeds: number;
    currentOpenings: number;
    isActive: boolean;
}

export interface UpdateRcfDto {
    name?: string;
    licensedBeds?: number;
    currentOpenings?: number;
    isActive?: boolean;
}

export interface RcfResponseDto {
    id: string;
    orgId: string;
    name: string;
    licensedBeds: number;
    currentOpenings: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
}
