export default class ApiError<T> extends Error {
  statusCode: number;
  success: boolean;
  errors: Error[];
  data?: T;
  constructor(
    statusCode: number,
    message: string,
    errors: any[],
    stack: string = "",
    data?: T,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
