import type { BaseRepo } from "./base_repo.ts";
import { Applicant } from "../entities/applicant.ts";

export interface ApplicantRepo extends BaseRepo<Applicant> {
    findAllByRpId(rpId: string): Promise<Applicant[]>;
}