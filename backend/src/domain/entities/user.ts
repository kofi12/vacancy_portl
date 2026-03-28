import {
    NoNameException,
    NoEmailException,
    InvalidEmailException,
    NoAuthProviderException,
    NoAuthSubjectException,
    InvalidRoleException,
} from "../exceptions/user_exceptions.ts";

export class User {

    private _id: string;
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
    ) {
        this._id = crypto.randomUUID();
        this._role = role;
        this._fullName = fullName;
        this._email = email;
        this._phone = phone;
        this._authProvider = authProvider;
        this._authSubject = authSubject;
        this._createdAt = new Date(Date.now());
    }

    //getters
    get id(): string { return this._id; }
    get role(): Role { return this._role; }
    get fullName(): string { return this._fullName; }
    get email(): string { return this._email; }
    get phone(): string | null { return this._phone; }
    get authProvider(): string | null { return this._authProvider; }
    get authSubject(): string | null { return this._authSubject; }
    get created_at(): Date { return this._createdAt; }
    get updated_at(): Date | null { return this._updatedAt; }

    //setters
    set role(role: Role) { this._role = role; }
    set fullName(fullName: string) { this._fullName = fullName; }
    set email(email: string) { this._email = email; }
    set phone(phone: string) { this._phone = phone; }
    set authProvider(authProvider: string) { this._authProvider = authProvider; }
    set authSubject(authSubject: string) { this._authSubject = authSubject; }
    set updatedAt(time: Date) {
        time = new Date(Date.now());
        this._updatedAt = time;
    }

    static create(
        role: Role,
        fullName: string,
        email: string,
        phone: string | null,
    ): User {

        if (!fullName) throw new NoNameException("Full name is required", new Error());
        if (!email) throw new NoEmailException("Email is required", new Error());
        if (!role) throw new InvalidRoleException("Role is required", new Error());

        return new User(
            role,
            fullName,
            email,
            phone,
            null,
            null,
        );
    }

    static createFromGoogle(
        role: Role,
        fullName: string,
        email: string,
        phone: string | null,
        authSubject: string,
    ): User {
        if (!fullName) throw new NoNameException("Full name is required", new Error());
        if (!email) throw new NoEmailException("Email is required", new Error());
        if (!role) throw new InvalidRoleException("Role is required", new Error());
        if (!authSubject) throw new NoAuthSubjectException("Auth subject is required", new Error());

        return new User(
            role,
            fullName,
            email,
            phone,
            "google",
            authSubject,
        );
    }
}

enum Role {
    "owner",
    "rp",
    "admin"
}
