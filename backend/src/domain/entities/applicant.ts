import {
    NoRpIdException,
    NoNameException,
} from "../exceptions/applicant_exceptions.ts";

export class Applicant {
    private _id: string;
    private _rpId: string;
    private _name: string;
    private _createdAt: Date;
    private _updatedAt: Date | null;

    private constructor(
        rpId: string,
        name: string,
    ) {
        this._id = crypto.randomUUID();
        this._rpId = rpId;
        this._name = name;
        this._createdAt = new Date(Date.now());
    }

    //getters
    get id(): string { return this._id; }
    get rpId(): string { return this._rpId; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date | null { return this._updatedAt; }

    //setters
    set rpId(rpId: string) { this._rpId = rpId; }
    set updatedAt(time: Date) {
        time = new Date(Date.now());
        this._updatedAt = time;
    }

    static create(
        rpId: string,
        name: string,
    ): Applicant {

        if (!rpId) throw new NoRpIdException("RP ID is required", new Error());
        if (!name) throw new NoNameException("Name is required", new Error());

        return new Applicant(rpId, name);
    }
}