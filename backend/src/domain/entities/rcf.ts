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

    get id(): string {return this._id;}
    get orgId(): string {return this._orgId;}
    get name(): string {return this._name;}
    get licensedBeds(): number {return this._licensedBeds;}
    get currentOpenings(): number {return this._currentOpenings;}
    get isActive(): boolean {return this._isActive;}
    get createdAt(): Date {return this._createdAt;}
    get updatedAt(): Date {return this._updatedAt;}

    set name(value: string) {this._name = value;}
    set licensedBeds(value: number) {this._licensedBeds = value;}
    set currentOpenings(value: number) {this._currentOpenings = value;}
    set isActive(value: boolean) {this._isActive = value;}
    set createdAt(value: Date) {this._createdAt = value;}
    set updatedAt(value: Date) {this._updatedAt = value;}

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