import type { Request, Response, NextFunction } from "express";
import type { Logger } from "pino";

// ---- Application error hierarchy ----

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const msg = id ? `${resource} with id "${id}" not found` : `${resource} not found`;
    super(msg, 404);
  }
}

export class ValidationError extends AppError {
  public readonly details: unknown;

  constructor(message: string, details?: unknown) {
    super(message, 400);
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

// ---- Error handler middleware ----

export function errorHandler(logger: Logger) {
  return (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof AppError) {
      if (err.statusCode >= 500) {
        logger.error({ err, statusCode: err.statusCode }, err.message);
      } else {
        logger.warn({ err, statusCode: err.statusCode }, err.message);
      }

      const body: Record<string, unknown> = { error: err.message };

      if (err instanceof ValidationError && err.details) {
        body["details"] = err.details;
      }

      res.status(err.statusCode).json(body);
      return;
    }

    // Unexpected errors
    logger.error({ err }, "Unhandled error");
    res.status(500).json({ error: "Internal server error" });
  };
}
