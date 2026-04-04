import {
    NoRpIdException,
    NoStatusException,
    NoSubmittedAtException,
    NoCreatedAtException,
    NoUpdatedAtException
} from "../exceptions/application_exceptions.ts";
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
    private _submittedAt: Date;
    private _createdAt: Date;
    private _updatedAt: Date;

    constructor(
        rfcId: string,
        applicantId: string,
        rpId: string,
        status: Status,
        submittedAt: Date,
        createdAt: Date,
        updatedAt: Date,
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
    get submittedAt(): Date { return this._submittedAt; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }

    set status(value: Status) { this._status = value; }
    set submittedAt(value: Date) { this._submittedAt = value; }
    set createdAt(value: Date) { this._createdAt = value; }
    set updatedAt(value: Date) { this._updatedAt = value; }

    static create(

        rcfId: string,
        applicantId: string,
        rpId: string,
        status: Status,
        submittedAt: Date,
        createdAt: Date,
        updatedAt: Date,

    ) {
        if (!rcfId) throw new NoRcfIdException("RCF ID is required", new Error());
        if (!applicantId) throw new NoApplicantIdException("Applicant ID is required", new Error());
        if (!rpId) throw new NoRpIdException("RP ID is required", new Error());
        if (!status) throw new NoStatusException("Status is required", new Error());
        if (!submittedAt) throw new NoSubmittedAtException("Submitted at is required", new Error());
        if (!createdAt) throw new NoCreatedAtException("Created at is required", new Error());
        if (!updatedAt) throw new NoUpdatedAtException("Updated at is required", new Error());

        return new Application(
            rcfId,
            applicantId,
            rpId,
            status,
            submittedAt,
            createdAt,
            updatedAt
        );
    }
}

export enum Status {
    SUBMITTED = "SUBMITTED",
    PENDING = "PENDING",
}