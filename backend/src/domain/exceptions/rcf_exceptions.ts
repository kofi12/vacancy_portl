import { DomainError } from "./domain_error.ts";

export class NoOrgException extends DomainError {
    constructor(message: string, e: Error) {
        super(message, e);
    }
}

export class NoNameException extends DomainError {
    constructor(message: string, e: Error) {
        super(message, e);
    }
}

export class NoLicensedBedsException extends DomainError {
    constructor(message: string, e: Error) {
        super(message, e);
    }
}

export class IncorrectOpeningsException extends DomainError {
    constructor(message: string, e: Error) {
        super(message, e);
    }
}

export class RcfNotFoundException extends DomainError {
    constructor(identifier: string) {
        super(`RCF not found: ${identifier}`);
    }
}
