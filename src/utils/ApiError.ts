/**
 * Custom API Error class for handling operational errors
 * @extends Error
 */
class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  stack?: string;

  /**
   * Create an API error
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {boolean} isOperational - Whether this is an operational error
   * @param {string} stack - Error stack trace
   */
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