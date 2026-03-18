class Application {

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
    ){
        this._id = rfcId;
        this._applicantId = applicantId;
        this._rpId = rpId;
        this._status = status;
        this._submittedAt = submittedAt;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    get id(): string {return this._id;}
    get rcfId(): string {return this._rcfId;}
    get applicantId(): string {return this._applicantId;}
    get rpId(): string {return this._rpId;}
    get status(): Status {return this._status;}
    get submittedAt(): Date {return this._submittedAt;}
    get createdAt(): Date {return this._createdAt;}
    get updatedAt(): Date {return this._updatedAt;}

    set status(value: Status) {this._status = value;}
    set submittedAt(value: Date) {this._submittedAt = value;}
    set createdAt(value: Date) {this._createdAt = value;}
    set updatedAt(value: Date) {this._updatedAt = value;}

    applicationFactory(

        rcfId: string,
        applicantId: string,
        rpId: string,
        status: Status,
        submittedAt: Date,
        createdAt: Date,
        updatedAt: Date,

    ){
        this._rcfId = rcfId;
        this._applicantId = applicantId;
        this._rpId = rpId;
        this._status = status;
        this._submittedAt = submittedAt;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

}

enum Status{
    "SUBMITTED",
    "PENDING"
}