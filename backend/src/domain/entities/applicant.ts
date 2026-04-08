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
    get name(): string { return this._name; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date | null { return this._updatedAt; }

    //setters
    set rpId(rpId: string) { this._rpId = rpId; }
    set name(name: string) { this._name = name; }
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

    static reconstitute(
        id: string,
        rpId: string,
        name: string,
        createdAt: Date,
        updatedAt: Date | null
    ): Applicant {

        const applicant = new Applicant(
            rpId,
            name,
        )
        applicant._id = id;
        applicant._createdAt = createdAt;
        applicant._updatedAt = updatedAt;

        return applicant;
    }
}