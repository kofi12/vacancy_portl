import { DomainError } from "./domain_error.ts";

export class NoRpIdException extends DomainError {
    constructor(message: string, error: Error) {
        super(message, error);
    }
}

export class NoNameException extends DomainError {
    constructor(message: string, error: Error) {
        super(message, error);
    }
}

export class NoAgeException extends DomainError {
    constructor(message: string, error: Error) {
        super(message, error);
    }
}

export class NoCareNeedsException extends DomainError {
    constructor(message: string, error: Error) {
        super(message, error);
    }
}

export class ApplicantNotFoundException extends DomainError {
    constructor(message: string, error?: Error) {
        super(message, error);
    }
}

export class ApplicantUpdateException extends DomainError {
    constructor(message: string, error?: Error) {
        super(message, error);
    }
}

export class ApplicantDeleteException extends DomainError {
    constructor(message: string, error?: Error) {
        super(message, error);
    }
}