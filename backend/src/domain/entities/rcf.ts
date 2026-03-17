export class Rcf {

    private _id: string;
    private _orgId: string;
    private _name: string;
    private _licensedBeds: number;
    private _currentOpenings: number;
    private _isActive: boolean;
    private _createdAt: Date;
    private _updatedAt: Date;

    constructor(
        orgId: string,
        name: string,
        licensedBeds: number,
        currentOpenings: number,
        isActive: boolean,
        createdAt: Date,
        updatedAt: Date,
    ){
        this._orgId = orgId;
        this._name = name;
        this._licensedBeds = licensedBeds;
        this._currentOpenings = currentOpenings;
        this._isActive = isActive;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    public get id(): string {return this._id;}
    public get orgId(): string {return this._orgId;}
    public get name(): string {return this._name;}
    public set name(value: string) {this._name = value;}
    public get licensedBeds(): number {return this._licensedBeds;}
    public set licensedBeds(value: number) {this._licensedBeds = value;}
    public get currentOpenings(): number {return this._currentOpenings;}
    public set currentOpenings(value: number) {this._currentOpenings = value;}
    public get isActive(): boolean {return this._isActive;}
    public set isActive(value: boolean) {this._isActive = value;}
    public get createdAt(): Date {return this._createdAt;}
    public set createdAt(value: Date) {this._createdAt = value;}
    public get updatedAt(): Date {return this._updatedAt;}
    public set updatedAt(value: Date) {this._updatedAt = value;}

    rcfFactory(
        orgId: string,
        name: string,
        licensedBeds: number,
        currentOpenings: number,
        isActive: boolean,
        createdAt: Date,
        updatedAt: Date,
    ){
        this._orgId = orgId;
        this._name = name;
        this._licensedBeds = licensedBeds;
        this._currentOpenings = currentOpenings;
        this._isActive = isActive;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

}