export class User{

    private _id: string;
    private _orgId: string;
    private _role: Role;
    private _fullName: string;
    private _email: string;
    private _phone: string | null;
    private _authProvider: string | null;
    private _authSubject: string | null;
    private _createdAt: Date;
    private _updatedAt: Date | null;

    constructor(
        role: Role,
        fullName: string,
        email: string,
        phone: string | null,
        authProvider: string | null,
        authSubject: string | null,
        createdAt: Date,
        updatedAt: Date | null,
    ){
        this._role = role;
        this._fullName = fullName;
        this._email = email;
        this._phone = phone;
        this._authProvider = authProvider;
        this._authSubject = authSubject;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    //getters
    get id(): string {return this._id;}
    get orgId(): string {return this._orgId;}
    get role(): Role {return this._role;}
    get fullName(): string {return this._fullName;}
    get email(): string {return this._email;}
    get phone(): string | null {return this._phone;}
    get authProvider(): string | null {return this._authProvider;}
    get authSubject(): string | null {return this._authSubject;}
    get created_at(): Date {return this._createdAt;}

    //setters
    set role(role: Role){this._role = role;}
    set fullName(fullName: string){this._fullName = fullName;}
    set email(email: string){this._email = email;}
    set phone(phone: string) {this._phone = phone;}
    set authProvider(authProvider: string){this._authProvider = authProvider;}
    set authSubject(authSubject: string){this._authSubject = authSubject;}
    set createdAt(time: Date){
        time = new Date();
        this._createdAt = time;
    }

    user_factory(
        role: Role,
        fullName: string,
        email: string,
        phone: string | null,
        authProvider: string | null,
        authSubject: string | null,
        createdAt: Date,
        updateAt: Date,
    ): User {
        return new User(role,
            fullName,
            email,
            phone,
            authProvider,
            authSubject,
            createdAt,
            updateAt,
        );
    }
}

enum Role {
    "owner",
    "rp",
    "admin"
}