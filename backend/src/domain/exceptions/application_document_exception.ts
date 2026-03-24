import { DomainError } from "./domain_error.ts";

export class NoApplicantIdException extends DomainError {
    constructor(message: string, e: Error) {
        super(message, e);
    }
}

export class NoApplicationIdException extends DomainError {
    constructor(message: string, e: Error) {
        super(message, e);
    }
}

export class NoContentTypeException extends DomainError {
    constructor(message: string, e: Error) {
        super(message, e);
    }
}

export class NoOriginalFileNameException extends DomainError {
    constructor(message: string, e: Error) {
        super(message, e);
    }
}

export class NoStorageKeyException extends DomainError {
    constructor(message: string, e: Error) {
        super(message, e);
    }
}

export class NoTypeException extends DomainError {
    constructor(message: string, e: Error) {
        super(message, e);
    }
}

export class InvalidFormTypeException extends DomainError {
    constructor(message: string, e: Error) {
        super(message, e);
    }
}

export class InvalidContentTypeException extends DomainError {
    constructor(message: string, e: Error) {
        super(message, e);
    }
}