import {
    NoOwnerException,
    NoNameException,
} from "../exceptions/org_exceptions.ts";

import {
    InvalidDateException,
} from "../exceptions/shared_exceptions.ts";

export class Organization {

    private _id: string;
    private _ownerId: string;
    private _name: string;
    private _createdAt: Date;
    private _updatedAt: Date | null;

    private constructor(
        ownerId: string,
        name: string,
    ) {
        this._id = crypto.randomUUID();
        this._ownerId = ownerId;
        this._name = name;
    }

    get id(): string { return this._id; }
    get ownerId(): string { return this._ownerId; }
    get name(): string { return this._name };
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date | null { return this._updatedAt; }

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
    ): Organization {
        if (!ownerId) throw new NoOwnerException("No owner provided", new Error());
        if (!name) throw new NoNameException("Organization is missing a name", new Error());
        if (!createdAt) throw new InvalidDateException("Invalid date provided", new Error());


        const org = new Organization(
            ownerId,
            name,
        );
        org._createdAt = new Date(Date.now());
        return org
    }

    static reconstitute(
        id: string,
        ownerId: string,
        name: string,
        createdAt: Date,
        updatedAt: Date | null
    ): Organization {
        const org = new Organization(
            ownerId,
            name,
        )

        org._id = id
        org._createdAt = createdAt;
        org._updatedAt = updatedAt;

        return org;
    }
}