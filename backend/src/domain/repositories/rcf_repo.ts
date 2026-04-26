import type { BaseRepo } from "./base_repo.ts";
import { Rcf } from "../entities/rcf.ts";

export interface RcfRepo extends BaseRepo<Rcf> {
    findAllByOrgId(orgId: string): Promise<Rcf[]>;
    findAllActiveWithOpeningsByOrgId(orgId: string): Promise<Rcf[]>;
    findAllActive(): Promise<Rcf[]>;
}