export class CustomError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorHandler = (statusCode: number, message: string): CustomError => {
    console.log("🚀errHand", statusCode, message);

    return new CustomError(statusCode, message);
};