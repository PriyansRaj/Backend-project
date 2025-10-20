export class ApiError extends Error {
  constructor(status_code, message = 'Something went wrong', errors = []) {
    super(message);
    this.status_code = status_code;
    this.errors = errors;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = this.constructor.name;
    this.success = false;
  }
}
