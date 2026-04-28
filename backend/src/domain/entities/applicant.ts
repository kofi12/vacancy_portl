import {
    NoRpIdException,
    NoNameException,
    NoAgeException,
    NoCareNeedsException,
} from "../exceptions/applicant_exceptions.ts";

export class Applicant {
    protected _id: string;
    private _rpId: string;
    private _name: string;
    private _dob: string;
    private _age: number;
    private _careNeeds: string;
    protected _createdAt: Date;
    private _updatedAt: Date | null;

    private constructor(
        rpId: string,
        name: string,
        dob: string,
        age: number,
        careNeeds: string,
    ) {
        this._id = crypto.randomUUID();
        this._rpId = rpId;
        this._name = name;
        this._dob = dob;
        this._age = age;
        this._careNeeds = careNeeds;
        this._createdAt = new Date(Date.now());
    }

    get id(): string { return this._id; }
    get rpId(): string { return this._rpId; }
    get name(): string { return this._name; }
    get dob(): string { return this._dob; }
    get age(): number { return this._age; }
    get careNeeds(): string { return this._careNeeds; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date | null { return this._updatedAt; }

    set rpId(rpId: string) { this._rpId = rpId; }
    set name(name: string) { this._name = name; }
    set dob(dob: string) { this._dob = dob; }
    set age(age: number) { this._age = age; }
    set careNeeds(careNeeds: string) { this._careNeeds = careNeeds; }
    set updatedAt(time: Date) {
        time = new Date(Date.now());
        this._updatedAt = time;
    }

    static create(
        rpId: string,
        name: string,
        dob: string,
        age: number,
        careNeeds: string,
    ): Applicant {

        if (!rpId) throw new NoRpIdException("RP ID is required", new Error());
        if (!name) throw new NoNameException("Name is required", new Error());
        if (!age || age <= 0) throw new NoAgeException("A valid age is required", new Error());
        if (!careNeeds) throw new NoCareNeedsException("Care needs description is required", new Error());

        return new Applicant(rpId, name, dob, age, careNeeds);
    }

    static reconstitute(
        id: string,
        rpId: string,
        name: string,
        dob: string,
        age: number,
        careNeeds: string,
        createdAt: Date,
        updatedAt: Date | null
    ): Applicant {

        const applicant = new Applicant(rpId, name, dob, age, careNeeds);
        applicant._id = id;
        applicant._createdAt = createdAt;
        applicant._updatedAt = updatedAt;

        return applicant;
    }
}
