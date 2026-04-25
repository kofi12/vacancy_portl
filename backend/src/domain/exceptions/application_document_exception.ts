import { DomainError } from "./domain_error.ts";

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

export class NoTypeException extends DomainError {
    constructor(message: string, e: Error) {
        super(message, e);
    }
}

export class ApplicationDocumentNotFoundException extends DomainError {
    constructor(message: string, cause?: Error) {
        super(message, cause);
    }
}

