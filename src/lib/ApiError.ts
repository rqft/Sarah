export class ApiError {
  public raw: discord.ApiError;
  constructor(raw: discord.ApiError) {
    this.raw = raw;
  }
  get code() {
    return this.raw.code;
  }
  get message() {
    return this.raw.message;
  }
  get msg() {
    return this.message;
  }
  get endpoint() {
    return this.raw.endpoint;
  }
  get method() {
    return this.httpMethod;
  }
  get httpMethod() {
    return this.raw.httpMethod;
  }
  get httpStatus() {
    return this.raw.httpStatus;
  }
  get status() {
    return this.status;
  }
  get httpStatusText() {
    return this.raw.httpStatusText;
  }
  get statusText() {
    return this.httpStatusText;
  }
  get stack() {
    return this.raw.stack;
  }
  get stacks() {
    return this.stack.split("\n");
  }
}
ApiError.prototype.raw.stack;
