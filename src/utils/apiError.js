export class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);

    this.success = false;
    this.statusCode = statusCode;
    this.errors = errors;
  }
}