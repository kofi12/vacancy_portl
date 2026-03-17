export class Organization {

    private readonly _orgId!: string;
    private readonly _ownerId!: string;
    private _name!: string;
    private _createdAt!: Date;
    private _updatedAt!: Date;

    constructor(
        ownerId: string,
        name: string,
        createdAt: Date,
    ){
        this._ownerId = ownerId;
        this._name = name;
        this._createdAt = createdAt;
    }

    get orgId(): string{return this._orgId;}
    get ownerId(): string{return this._ownerId;}
    get name(): string{return this._name};
    get createdAt(): Date{return this._createdAt;}
    get updatedAt(): Date{return this._updatedAt;}
    set name(name: string){this._name=name;}

    set createdAt(time: Date){
        time = new Date();
        this._createdAt = time;
    }

    set updatedAt(time: Date){
        time = new Date();
        this._updatedAt = time;
    }

    has_owner(): boolean{
        return this._ownerId != null;
    }

    org_factory(
        ownerId: string,
        name: string,
        createdAt: Date,
    ){
        const org: Organization = new Organization(
            ownerId,
            name,
            createdAt,
        )
        return org;
    }
}