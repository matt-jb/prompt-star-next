export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message);
  }
}
