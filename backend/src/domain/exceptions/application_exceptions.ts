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

export class ApplicationNotFoundException extends DomainError {
    constructor(id: string) {
        super(`Application with id ${id} not found`);
    }
}

export class ApplicationUpdateException extends DomainError {
    constructor(id: string, cause: unknown) {
        super(`Failed to update application ${id}`, { cause });
    }
}

export class ApplicationDeleteException extends DomainError {
    constructor(id: string, cause: unknown) {
        super(`Failed to delete application ${id}`, { cause });
    }
}