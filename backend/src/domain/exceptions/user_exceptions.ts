import { DomainError } from "./domain_error.ts";

export class NoNameException extends DomainError {
    constructor(message: string, cause: Error) {
        super(message, cause);
    }
}

export class NoEmailException extends DomainError {
    constructor(message: string, cause: Error) {
        super(message, cause);
    }
}

export class InvalidEmailException extends DomainError {
    constructor(message: string, cause: Error) {
        super(message, cause);
    }
}

export class NoAuthProviderException extends DomainError {
    constructor(message: string, cause: Error) {
        super(message, cause);
    }
}

export class NoAuthSubjectException extends DomainError {
    constructor(message: string, cause: Error) {
        super(message, cause);
    }
}

export class InvalidRoleException extends DomainError {
    constructor(message: string, cause: Error) {
        super(message, cause);
    }
}

export class UserNotFoundException extends DomainError {
    constructor(identifier: string) {
        super(`User not found: ${identifier}`);
    }
}