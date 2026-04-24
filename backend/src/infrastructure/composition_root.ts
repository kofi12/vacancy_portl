import { UserInfrastructure } from "./persistence/repositories/user_infra.ts";
import { OrganizationInfrastructure } from "./persistence/repositories/org_infra.ts";
import { RcfInfrastructure } from "./persistence/repositories/rcf_infra.ts";
import { ApplicantInfrastructure } from "./persistence/repositories/applicant_infra.ts";
import { ApplicationInfrastructure } from "./persistence/repositories/application_infra.ts";
import { RcfFormInfrastucture } from "./persistence/repositories/rcf_form_infra.ts";
import { ApplicationDocumentInfrastructure } from "./persistence/repositories/application_document_infra.ts";
import { GcsStorageAdapter } from "./storage/gcs_storage_adapter.ts";
import { UserService } from "../application/services/user_service.ts";
import { OrgService } from "../application/services/org_service.ts";
import { RcfService } from "../application/services/rcf_service.ts";
import { ApplicantService } from "../application/services/applicant_service.ts";
import { ApplicationService } from "../application/services/application_service.ts";
import { RcfFormService } from "../application/services/rcf_form_service.ts";
import { ApplicationDocumentService } from "../application/services/application_document_service.ts";

// Repos
const userRepo = new UserInfrastructure();
const orgRepo = new OrganizationInfrastructure();
const rcfRepo = new RcfInfrastructure();
const applicantRepo = new ApplicantInfrastructure();
const applicationRepo = new ApplicationInfrastructure();
const rcfFormRepo = new RcfFormInfrastucture();
const applicationDocumentRepo = new ApplicationDocumentInfrastructure();

// Storage
export const storageAdapter = new GcsStorageAdapter(process.env.BUCKET_NAME!);

// Services
export const userService = new UserService(userRepo);
export const orgService = new OrgService(orgRepo, userRepo);
export const rcfService = new RcfService(rcfRepo, orgRepo);
export const applicantService = new ApplicantService(applicantRepo, userRepo);
export const applicationService = new ApplicationService(
    applicationRepo,
    rcfRepo,
    applicantRepo,
    rcfFormRepo,
    applicationDocumentRepo,
    userRepo,
);
export const rcfFormService = new RcfFormService(rcfFormRepo, rcfRepo);
export const applicationDocumentService = new ApplicationDocumentService(applicationDocumentRepo, applicationRepo);
