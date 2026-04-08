import {
    NoOrgException,
    NoNameException,
    NoLicensedBedsException,
    IncorrectOpeningsException
} from '../exceptions/rcf_exceptions';

export class Rcf {

    private _id: string;
    private _orgId: string;
    private _name: string;
    private _licensedBeds: number;
    private _currentOpenings: number;
    private _isActive: boolean;
    private _createdAt: Date;
    private _updatedAt: Date | null;

    private constructor(
        orgId: string,
        name: string,
        licensedBeds: number,
        currentOpenings: number,
        isActive: boolean,
    ) {
        this._id = crypto.randomUUID();
        this._orgId = orgId;
        this._name = name;
        this._licensedBeds = licensedBeds;
        this._currentOpenings = currentOpenings;
        this._isActive = isActive;
        this._createdAt = new Date(Date.now());
    }

    get id(): string { return this._id; }
    get orgId(): string { return this._orgId; }
    get name(): string { return this._name; }
    get licensedBeds(): number { return this._licensedBeds; }
    get currentOpenings(): number { return this._currentOpenings; }
    get isActive(): boolean { return this._isActive; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date | null { return this._updatedAt; }

    set name(value: string) { this._name = value; }
    set licensedBeds(value: number) { this._licensedBeds = value; }
    set currentOpenings(value: number) { this._currentOpenings = value; }
    set isActive(value: boolean) { this._isActive = value; }
    set createdAt(value: Date) { this._createdAt = value; }
    set updatedAt(value: Date) { this._updatedAt = value; }

    static create(
        orgId: string,
        name: string,
        licensedBeds: number,
        currentOpenings: number,
        isActive: boolean,
    ): Rcf {
        if (!orgId) { throw new NoOrgException("Organization missing", new Error()) }
        if (!name) { throw new NoNameException("RCF doesn't have a name", new Error()) }
        if (licensedBeds <= 0) { throw new NoLicensedBedsException("RCF has no licensed beds", new Error()) }
        if ((currentOpenings > licensedBeds) || (currentOpenings < 0)) {
            throw new IncorrectOpeningsException
                (`Current openings are more than the number of licensed beds or
                    less than 0, both are invalid values`, new Error())
        }

        return new Rcf(
            orgId,
            name,
            licensedBeds,
            currentOpenings,
            isActive,
        );
    }

    static reconstitute(
        id: string,
        orgId: string,
        name: string,
        licensedBeds: number,
        currentOpenings: number,
        isActive: boolean,
        createdAt: Date,
        updatedAt: Date | null
    ): Rcf {
        const rcf = new Rcf(
            orgId,
            name,
            licensedBeds,
            currentOpenings,
            isActive,
        );
        rcf._id = id;
        rcf._createdAt = createdAt;
        rcf._updatedAt = updatedAt;

        return rcf;
    }
}