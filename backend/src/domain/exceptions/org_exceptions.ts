import { DomainError } from "./domain_error.ts";

export class NoOwnerException extends DomainError {
    constructor(message: string, e: Error) {
        super(message, e);
    }
}

export class NoNameException extends DomainError {
    constructor(message: string, e: Error) {
        super(message, e);
    }
}

export class OrganizationNotFoundException extends DomainError {
    constructor(identifier: string) {
        super(`Organization not found: ${identifier}`);
    }
}
