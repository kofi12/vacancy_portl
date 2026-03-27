export class Applicant {
    private _id: string;
    private _rpId: string;
    private _applicationId?: string;
    private _name: string;
    private _createdAt: Date;
    private _updatedAt: Date | null;

    constructor(
        rpId: string,
        name: string,
        applicationId?: string,
    ) {
        this._id = crypto.randomUUID();
        this._rpId = rpId;
        this._applicationId = applicationId;
        this._name = name;
    }

    //getters
    get id(): string { return this._id; }
    get rpId(): string { return this._rpId; }
    get applicationId(): string | undefined { return this._applicationId; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date | null { return this._updatedAt; }

    //setters
    set rpId(rpId: string) { this._rpId = rpId; }
    set applicationId(applicationId: string) { this._applicationId = applicationId; }
    set updatedAt(updatedAt: Date | null) { this._updatedAt = updatedAt; }

    static create(
        rpId: string,
        name: string,
        applicationId?: string,
    ): Applicant {
        return new Applicant(
            rpId,
            name,
            applicationId,
        );
    }
}