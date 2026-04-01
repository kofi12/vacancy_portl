import type { BaseRepo } from "./base_repo.ts";
import { Organization } from "../entities/org.ts";

export interface OrganizationRepo extends BaseRepo<Organization> {
    findByOwnerId(ownerId: string): Promise<Organization>;
}
