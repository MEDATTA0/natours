class AppError extends Error {
  /**
   * Create a new error that is going to send to the client
   * @param {String} message
   * @param {Number} statusCode
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
