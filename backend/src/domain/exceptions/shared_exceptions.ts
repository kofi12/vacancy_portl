import { DomainError } from "./domain_error.ts";

export class NoRcfIdException extends DomainError {
    constructor(message: string, cause: Error) {
        super(message, cause);
    }
}

export class NoApplicantIdException extends DomainError {
    constructor(message: string, cause: Error) {
        super(message, cause);
    }
}

export class NoStorageKeyException extends DomainError {
    constructor(message: string, cause: Error) {
        super(message, cause);
    }
}

export class InvalidFormTypeException extends DomainError {
    constructor(message: string, cause: Error) {
        super(message, cause);
    }
}

export class InvalidContentTypeException extends DomainError {
    constructor(message: string, cause: Error) {
        super(message, cause);
    }
}

export class InvalidDateException extends DomainError {
    constructor(message: string, e: Error) {
        super(message, e);
    }
}
