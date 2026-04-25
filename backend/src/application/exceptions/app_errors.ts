export enum AppErrorCode {
    // 404
    USER_NOT_FOUND = "USER_NOT_FOUND",
    ORG_NOT_FOUND = "ORG_NOT_FOUND",
    RCF_NOT_FOUND = "RCF_NOT_FOUND",
    APPLICANT_NOT_FOUND = "APPLICANT_NOT_FOUND",
    APPLICATION_NOT_FOUND = "APPLICATION_NOT_FOUND",
    APPLICATION_DOCUMENT_NOT_FOUND = "APPLICATION_DOCUMENT_NOT_FOUND",
    RCF_FORM_NOT_FOUND = "RCF_FORM_NOT_FOUND",

    // 409
    ORG_ALREADY_EXISTS_FOR_OWNER = "ORG_ALREADY_EXISTS_FOR_OWNER",
    RCF_NAME_CONFLICT = "RCF_NAME_CONFLICT",

    // 422
    INACTIVE_RCF = "INACTIVE_RCF",
    INVALID_STATUS_TRANSITION = "INVALID_STATUS_TRANSITION",
    DOCUMENTS_INCOMPLETE = "DOCUMENTS_INCOMPLETE",

    // 403
    UNAUTHORIZED_ROLE_CHANGE = "UNAUTHORIZED_ROLE_CHANGE",
    NOT_APPLICANT_OWNER = "NOT_APPLICANT_OWNER",
    NOT_APPLICATION_OWNER = "NOT_APPLICATION_OWNER",

    // 500
    UNEXPECTED_ERROR = "UNEXPECTED_ERROR",

    //AUTH
    AUTH_INVALID_STATE = "AUTH_INVALID_STATE",
    AUTH_INVALID_TOKEN = "AUTH_INVALID_TOKEN",
    AUTH_UNAUTHORIZED = "AUTH_UNAUTHORIZED"
}

export class ApplicationError extends Error {
    code: AppErrorCode
    cause?: unknown

    constructor(code: AppErrorCode, message: string, cause?: unknown) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = this.constructor.name;
    }
}

export class NotFoundError extends ApplicationError { }
export class ConflictError extends ApplicationError { }
export class BusinessRuleError extends ApplicationError { }
export class ForbiddenError extends ApplicationError { }
export class UnexpectedError extends ApplicationError { }
