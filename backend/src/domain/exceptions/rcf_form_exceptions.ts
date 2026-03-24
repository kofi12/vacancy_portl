import { DomainError } from "./domain_error.ts";

export class NoRcfIdException extends DomainError {
    constructor(message: string, cause: Error) {
        super(message, cause);
    }
}

export class NoOwnerIdException extends DomainError {
    constructor(message: string, cause: Error) {
        super(message, cause);
    }
}

export class NoFileNameException extends DomainError {
    constructor(message: string, cause: Error) {
        super(message, cause);
    }
}

export class NoTitleException extends DomainError {
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

export class NoStorageKeyException extends DomainError {
    constructor(message: string, cause: Error) {
        super(message, cause);
    }
}
