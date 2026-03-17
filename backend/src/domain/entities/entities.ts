
export type Organization = {
    id: string;
    name: string;
    createdAt: Date;
}

enum Role {
    "owner",
    "rp",
    "admin"
}

export type User = {
    id: string;
    role: Role;
    org_id: string;
    full_name: string;
    email: string;
    phone: string | null;
    auth_provider: string | null;
    auth_subject: string | null;
    createdAt: Date
}

export type RCF = {
    id: string;
    org_id: string;
    name: string;
    licensed_beds: number;
    current_openings: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

