import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplicationService } from '../../application/services/application_service.ts';
import { Application, Status } from '../../domain/entities/application.ts';
import { Rcf } from '../../domain/entities/rcf.ts';
import { Applicant } from '../../domain/entities/applicant.ts';
import { RcfForm, TemplateType, ContentType } from '../../domain/entities/rcf_form.ts';
import { ApplicationDocument } from '../../domain/entities/application_document.ts';
import type { ApplicationRepo } from '../../domain/repositories/application_repo.ts';
import type { RcfRepo } from '../../domain/repositories/rcf_repo.ts';
import type { ApplicantRepo } from '../../domain/repositories/applicant_repo.ts';
import type { RcfFormRepo } from '../../domain/repositories/rcf_form_repo.ts';
import type { ApplicationDocumentRepo } from '../../domain/repositories/application_document_repo.ts';
import type { UserRepo } from '../../domain/repositories/user_repo.ts';
import { NotFoundError, ForbiddenError, BusinessRuleError } from '../../application/exceptions/app_errors.ts';
import { ApplicationNotFoundException } from '../../domain/exceptions/application_exceptions.ts';
import { RcfNotFoundException } from '../../domain/exceptions/rcf_exceptions.ts';
import { ApplicantNotFoundException } from '../../domain/exceptions/applicant_exceptions.ts';
import { UserNotFoundException } from '../../domain/exceptions/user_exceptions.ts';

const mockApplicationRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findAllByRcfId: vi.fn(),
    findAllByRpId: vi.fn(),
    findAllByRpIdAndRcfId: vi.fn(),
    findAllByApplicantId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
} as unknown as ApplicationRepo;

const mockRcfRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findAllByOrgId: vi.fn(),
    findAllActiveWithOpeningsByOrgId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
} as unknown as RcfRepo;

const mockApplicantRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findAllByRpId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
} as unknown as ApplicantRepo;

const mockRcfFormRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findAllByRcfId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
} as unknown as RcfFormRepo;

const mockApplicationDocumentRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findAllByApplicationId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
} as unknown as ApplicationDocumentRepo;

const mockUserRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByAuthSubject: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
} as unknown as UserRepo;

const service = new ApplicationService(
    mockApplicationRepo,
    mockRcfRepo,
    mockApplicantRepo,
    mockRcfFormRepo,
    mockApplicationDocumentRepo,
    mockUserRepo,
);

const makeActiveRcf = () => Rcf.create('org-1', 'Sunrise RCF', '123 Main St', '(555) 000-0000', 10, 5, true);
const makeInactiveRcf = () => Rcf.create('org-1', 'Closed RCF', '456 Elm St', '(555) 111-1111', 10, 0, false);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('ApplicationService', () => {
    describe('createApplication', () => {
        it('creates and returns an application DTO', async () => {
            const applicant = Applicant.create('rp-1', 'John Doe', 72, 'General assisted living');
            const rcf = makeActiveRcf();
            vi.mocked(mockApplicantRepo.findById).mockResolvedValue(applicant);
            vi.mocked(mockRcfRepo.findById).mockResolvedValue(rcf);
            vi.mocked(mockApplicationRepo.create).mockResolvedValue({} as any);

            const result = await service.createApplication({
                rcfId: rcf.id,
                applicantId: applicant.id,
                rpId: 'rp-1',
            });

            expect(mockApplicationRepo.create).toHaveBeenCalled();
            expect(result.rcfId).toBe(rcf.id);
            expect(result.status).toBe(Status.PENDING);
        });

        it('throws NotFoundError when RCF does not exist', async () => {
            vi.mocked(mockApplicantRepo.findById).mockResolvedValue({} as any);
            vi.mocked(mockRcfRepo.findById).mockRejectedValue(new RcfNotFoundException('rcf-1'));

            await expect(service.createApplication({ rcfId: 'rcf-1', applicantId: 'ap-1', rpId: 'rp-1' }))
                .rejects.toBeInstanceOf(NotFoundError);
        });

        it('throws NotFoundError when applicant does not exist', async () => {
            vi.mocked(mockApplicantRepo.findById).mockRejectedValue(new ApplicantNotFoundException('ap-1'));

            await expect(service.createApplication({ rcfId: 'rcf-1', applicantId: 'ap-1', rpId: 'rp-1' }))
                .rejects.toBeInstanceOf(NotFoundError);
        });

        it('throws BusinessRuleError when RCF is inactive', async () => {
            const applicant = Applicant.create('rp-1', 'John Doe', 72, 'General assisted living');
            const rcf = makeInactiveRcf();
            vi.mocked(mockApplicantRepo.findById).mockResolvedValue(applicant);
            vi.mocked(mockRcfRepo.findById).mockResolvedValue(rcf);

            await expect(service.createApplication({ rcfId: rcf.id, applicantId: applicant.id, rpId: 'rp-1' }))
                .rejects.toBeInstanceOf(BusinessRuleError);
        });
    });

    describe('submitApplication', () => {
        it('submits the application when all documents are present', async () => {
            const application = Application.create('rcf-1', 'ap-1', 'rp-1');
            const form = RcfForm.create('rcf-1', 'intake.pdf', 'Intake Form', TemplateType.INTAKE_FORM, ContentType.PDF, 'key/1');
            const doc = ApplicationDocument.create(application.id, TemplateType.INTAKE_FORM, 'intake.pdf', ContentType.PDF, 'key/2');
            vi.mocked(mockApplicationRepo.findById).mockResolvedValue(application);
            vi.mocked(mockRcfFormRepo.findAllByRcfId).mockResolvedValue([form]);
            vi.mocked(mockApplicationDocumentRepo.findAllByApplicationId).mockResolvedValue([doc]);
            vi.mocked(mockApplicationRepo.update).mockResolvedValue(application);

            const result = await service.submitApplication({
                applicationId: application.id,
                requestingRpId: 'rp-1',
            });

            expect(result.status).toBe(Status.SUBMITTED);
            expect(result.submittedAt).not.toBeNull();
        });

        it('throws ForbiddenError when requester does not own the application', async () => {
            const application = Application.create('rcf-1', 'ap-1', 'rp-1');
            vi.mocked(mockApplicationRepo.findById).mockResolvedValue(application);

            await expect(service.submitApplication({ applicationId: application.id, requestingRpId: 'rp-2' }))
                .rejects.toBeInstanceOf(ForbiddenError);
        });

        it('throws BusinessRuleError when application is already submitted', async () => {
            const application = Application.create('rcf-1', 'ap-1', 'rp-1');
            application.status = Status.SUBMITTED;
            vi.mocked(mockApplicationRepo.findById).mockResolvedValue(application);

            await expect(service.submitApplication({ applicationId: application.id, requestingRpId: 'rp-1' }))
                .rejects.toBeInstanceOf(BusinessRuleError);
        });

        it('throws BusinessRuleError when required documents are missing', async () => {
            const application = Application.create('rcf-1', 'ap-1', 'rp-1');
            const form = RcfForm.create('rcf-1', 'intake.pdf', 'Intake Form', TemplateType.INTAKE_FORM, ContentType.PDF, 'key/1');
            vi.mocked(mockApplicationRepo.findById).mockResolvedValue(application);
            vi.mocked(mockRcfFormRepo.findAllByRcfId).mockResolvedValue([form]);
            vi.mocked(mockApplicationDocumentRepo.findAllByApplicationId).mockResolvedValue([]);

            await expect(service.submitApplication({ applicationId: application.id, requestingRpId: 'rp-1' }))
                .rejects.toBeInstanceOf(BusinessRuleError);
        });

        it('throws NotFoundError when application does not exist', async () => {
            vi.mocked(mockApplicationRepo.findById).mockRejectedValue(new ApplicationNotFoundException('bad-id'));

            await expect(service.submitApplication({ applicationId: 'bad-id', requestingRpId: 'rp-1' }))
                .rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('getApplicationById', () => {
        it('returns the application DTO', async () => {
            const application = Application.create('rcf-1', 'ap-1', 'rp-1');
            vi.mocked(mockApplicationRepo.findById).mockResolvedValue(application);

            const result = await service.getApplicationById(application.id);

            expect(result.id).toBe(application.id);
        });

        it('throws NotFoundError when application does not exist', async () => {
            vi.mocked(mockApplicationRepo.findById).mockRejectedValue(new ApplicationNotFoundException('bad-id'));

            await expect(service.getApplicationById('bad-id')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('getApplicationsByRcfId', () => {
        it('returns all applications for an RCF', async () => {
            const apps = [Application.create('rcf-1', 'ap-1', 'rp-1'), Application.create('rcf-1', 'ap-2', 'rp-1')];
            vi.mocked(mockRcfRepo.findById).mockResolvedValue({} as any);
            vi.mocked(mockApplicationRepo.findAllByRcfId).mockResolvedValue(apps);

            const result = await service.getApplicationsByRcfId('rcf-1');

            expect(result).toHaveLength(2);
        });

        it('throws NotFoundError when RCF does not exist', async () => {
            vi.mocked(mockRcfRepo.findById).mockRejectedValue(new RcfNotFoundException('rcf-1'));

            await expect(service.getApplicationsByRcfId('rcf-1')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('getApplicationsByRpId', () => {
        it('returns all applications for an RP', async () => {
            const apps = [Application.create('rcf-1', 'ap-1', 'rp-1')];
            vi.mocked(mockUserRepo.findById).mockResolvedValue({} as any);
            vi.mocked(mockApplicationRepo.findAllByRpId).mockResolvedValue(apps);

            const result = await service.getApplicationsByRpId('rp-1');

            expect(result).toHaveLength(1);
        });

        it('throws NotFoundError when RP does not exist', async () => {
            vi.mocked(mockUserRepo.findById).mockRejectedValue(new UserNotFoundException('rp-1'));

            await expect(service.getApplicationsByRpId('rp-1')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('getApplicationsByApplicantId', () => {
        it('returns all applications for an applicant', async () => {
            const apps = [Application.create('rcf-1', 'ap-1', 'rp-1')];
            vi.mocked(mockApplicantRepo.findById).mockResolvedValue({} as any);
            vi.mocked(mockApplicationRepo.findAllByApplicantId).mockResolvedValue(apps);

            const result = await service.getApplicationsByApplicantId('ap-1');

            expect(result).toHaveLength(1);
        });

        it('throws NotFoundError when applicant does not exist', async () => {
            vi.mocked(mockApplicantRepo.findById).mockRejectedValue(new ApplicantNotFoundException('ap-1'));

            await expect(service.getApplicationsByApplicantId('ap-1')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('getApplicationsByRpIdAndRcfId', () => {
        it('returns all applications for an RP and RCF', async () => {
            const apps = [Application.create('rcf-1', 'ap-1', 'rp-1')];
            vi.mocked(mockUserRepo.findById).mockResolvedValue({} as any);
            vi.mocked(mockRcfRepo.findById).mockResolvedValue({} as any);
            vi.mocked(mockApplicationRepo.findAllByRpIdAndRcfId).mockResolvedValue(apps);

            const result = await service.getApplicationsByRpIdAndRcfId('rp-1', 'rcf-1');

            expect(result).toHaveLength(1);
        });

        it('throws NotFoundError when RP does not exist', async () => {
            vi.mocked(mockUserRepo.findById).mockRejectedValue(new UserNotFoundException('rp-1'));

            await expect(service.getApplicationsByRpIdAndRcfId('rp-1', 'rcf-1')).rejects.toBeInstanceOf(NotFoundError);
        });

        it('throws NotFoundError when RCF does not exist', async () => {
            vi.mocked(mockUserRepo.findById).mockResolvedValue({} as any);
            vi.mocked(mockRcfRepo.findById).mockRejectedValue(new RcfNotFoundException('rcf-1'));

            await expect(service.getApplicationsByRpIdAndRcfId('rp-1', 'rcf-1')).rejects.toBeInstanceOf(NotFoundError);
        });
    });

    describe('deleteApplication', () => {
        it('deletes and returns the application DTO', async () => {
            const application = Application.create('rcf-1', 'ap-1', 'rp-1');
            vi.mocked(mockApplicationRepo.findById).mockResolvedValue(application);
            vi.mocked(mockApplicationRepo.delete).mockResolvedValue(application);

            const result = await service.deleteApplication(application.id, 'rp-1');

            expect(result.id).toBe(application.id);
            expect(mockApplicationRepo.delete).toHaveBeenCalledWith(application.id);
        });

        it('throws ForbiddenError when requester does not own the application', async () => {
            const application = Application.create('rcf-1', 'ap-1', 'rp-1');
            vi.mocked(mockApplicationRepo.findById).mockResolvedValue(application);

            await expect(service.deleteApplication(application.id, 'rp-2'))
                .rejects.toBeInstanceOf(ForbiddenError);
        });

        it('throws NotFoundError when application does not exist', async () => {
            vi.mocked(mockApplicationRepo.findById).mockRejectedValue(new ApplicationNotFoundException('bad-id'));

            await expect(service.deleteApplication('bad-id', 'rp-1')).rejects.toBeInstanceOf(NotFoundError);
        });
    });
});
