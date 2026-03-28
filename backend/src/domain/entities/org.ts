import {
    NoOwnerException,
    NoNameException,
} from "../exceptions/org_exceptions.ts";

import {
    InvalidDateException,
} from "../exceptions/shared_exceptions.ts";

export class Organization {

    private _orgId: string;
    private _ownerId: string;
    private _name: string;
    private _createdAt: Date;
    private _updatedAt: Date;

    constructor(
        ownerId: string,
        name: string,
        createdAt: Date,
    ) {
        this._orgId = crypto.randomUUID();
        this._ownerId = ownerId;
        this._name = name;
        this._createdAt = createdAt;
    }

    get orgId(): string { return this._orgId; }
    get ownerId(): string { return this._ownerId; }
    get name(): string { return this._name };
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }

    set name(name: string) { this._name = name; }

    set updatedAt(time: Date) {
        time = new Date(Date.now());
        this._updatedAt = time;
    }

    hasOwner(): boolean {
        return this._ownerId != null;
    }

    static create(
        ownerId: string,
        name: string,
        createdAt: Date,
    ) {
        if (!ownerId) throw new NoOwnerException("No owner provided", new Error());
        if (!name) throw new NoNameException("Organization is missing a name", new Error());
        if (!createdAt) throw new InvalidDateException("Invalid date provided", new Error());



        return new Organization(
            ownerId,
            name,
            createdAt,

        )
    }
}