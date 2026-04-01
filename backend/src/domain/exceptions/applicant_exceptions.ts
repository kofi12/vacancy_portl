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