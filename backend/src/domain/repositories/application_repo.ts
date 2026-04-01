import type { BaseRepo } from "./base_repo.ts";
import { Application } from "../entities/application.ts";

export interface ApplicationRepo extends BaseRepo<Application> {
    findAllByRcfId(rcfId: string): Promise<Application[]>;
    findAllByRpId(rpId: string): Promise<Application[]>;
    findAllByRpIdAndRcfId(rpId: string, rcfId: string): Promise<Application[]>;
    findAllByApplicantId(applicantId: string): Promise<Application[]>;
}