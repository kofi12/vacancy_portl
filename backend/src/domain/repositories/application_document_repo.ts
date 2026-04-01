import type { BaseRepo } from "./base_repo.ts";
import { ApplicationDocument } from "../entities/application_document.ts";

export interface ApplicationDocumentRepo extends BaseRepo<ApplicationDocument> {
    findAllByApplicationId(applicationId: string): Promise<ApplicationDocument[]>;
}