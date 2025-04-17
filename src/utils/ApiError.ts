class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    stack?: string;

    constructor(statusCode: number, message: string, isOperational: boolean = true, stack: string = "") {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
      if (stack) {
        this.stack = stack;
      }
    }
  }
export default ApiError;