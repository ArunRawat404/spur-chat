export class ApplicationError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}

export class ValidationError extends ApplicationError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class LLMError extends ApplicationError {
    constructor(message: string) {
        super(message, 503);
    }
}