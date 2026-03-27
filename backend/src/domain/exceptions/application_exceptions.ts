import { DomainError } from "./domain_error.ts";

export class NoRpIdException extends DomainError {
    constructor(message: string, error: Error) {
        super(message, error);
    }
}

export class NoStatusException extends DomainError {
    constructor(message: string, error: Error) {
        super(message, error);
    }
}

export class NoSubmittedAtException extends DomainError {
    constructor(message: string, error: Error) {
        super(message, error);
    }
}

export class NoCreatedAtException extends DomainError {
    constructor(message: string, error: Error) {
        super(message, error);
    }
}

export class NoUpdatedAtException extends DomainError {
    constructor(message: string, error: Error) {
        super(message, error);
    }
}