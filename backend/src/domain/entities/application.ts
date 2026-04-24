import { NoRpIdException } from "../exceptions/application_exceptions.ts";
import {
    NoRcfIdException,
    NoApplicantIdException
} from "../exceptions/shared_exceptions.ts";

export class Application {

    private _id: string;
    private _rcfId: string;
    private _applicantId: string;
    private _rpId: string;
    private _status: Status;
    private _submittedAt: Date | null;
    private _createdAt: Date;
    private _updatedAt: Date | null;

    private constructor(
        rfcId: string,
        applicantId: string,
        rpId: string,
        status: Status,
        submittedAt: Date | null,
        createdAt: Date,
        updatedAt: Date | null,
    ) {
        this._id = crypto.randomUUID();
        this._rcfId = rfcId;
        this._applicantId = applicantId;
        this._rpId = rpId;
        this._status = status;
        this._submittedAt = submittedAt;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    get id(): string { return this._id; }
    get rcfId(): string { return this._rcfId; }
    get applicantId(): string { return this._applicantId; }
    get rpId(): string { return this._rpId; }
    get status(): Status { return this._status; }
    get submittedAt(): Date | null { return this._submittedAt; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date | null { return this._updatedAt; }

    set status(value: Status) { this._status = value; }
    set submittedAt(value: Date | null) { this._submittedAt = value; }
    set createdAt(value: Date) { this._createdAt = value; }
    set updatedAt(value: Date | null) { this._updatedAt = value; }

    static create(
        rcfId: string,
        applicantId: string,
        rpId: string,
    ) {
        if (!rcfId) throw new NoRcfIdException("RCF ID is required", new Error());
        if (!applicantId) throw new NoApplicantIdException("Applicant ID is required", new Error());
        if (!rpId) throw new NoRpIdException("RP ID is required", new Error());

        return new Application(
            rcfId,
            applicantId,
            rpId,
            Status.PENDING,
            null,
            new Date(),
            null,
        );
    }

    static reconstitute(
        id: string,
        rcfId: string,
        applicantId: string,
        rpId: string,
        status: Status,
        submittedAt: Date | null,
        createdAt: Date,
        updatedAt: Date | null,
    ) {
        const application = new Application(
            rcfId,
            applicantId,
            rpId,
            status,
            submittedAt,
            createdAt,
            updatedAt,
        );

        application._id = id;
        application._submittedAt = submittedAt;
        application._createdAt = createdAt;
        application.updatedAt = updatedAt;

        return application;
    }
}

export enum Status {
    SUBMITTED = "SUBMITTED",
    PENDING = "PENDING",
}
