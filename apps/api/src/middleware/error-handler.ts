import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { HttpError } from "../lib/errors.js";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new HttpError("NOT_FOUND", `Route ${req.method} ${req.path} not found`));
};

/** Central error handler: every error leaves as { error: { code, message, details? } }. */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let httpError: HttpError;

  if (err instanceof HttpError) {
    httpError = err;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[] | string | undefined) ?? "field";
      httpError = new HttpError("CONFLICT", `A record with this ${String(target)} already exists`, {
        target,
      });
    } else if (err.code === "P2025") {
      httpError = new HttpError("NOT_FOUND", "Resource not found");
    } else if (err.code === "P2003") {
      httpError = new HttpError("BAD_REQUEST", "A referenced record does not exist");
    } else {
      httpError = new HttpError("INTERNAL_ERROR", "Database error");
    }
  } else if (
    err instanceof SyntaxError &&
    "type" in err &&
    (err as { type?: string }).type === "entity.parse.failed"
  ) {
    httpError = new HttpError("BAD_REQUEST", "Malformed JSON body");
  } else if (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    (err as { type?: string }).type === "entity.too.large"
  ) {
    httpError = new HttpError("BAD_REQUEST", "Request body too large");
  } else {
    httpError = new HttpError("INTERNAL_ERROR", "Something went wrong");
  }

  if (httpError.status >= 500) req.log?.error({ err }, "Unhandled error");

  res.status(httpError.status).json({
    error: {
      code: httpError.code,
      message: httpError.message,
      ...(httpError.details !== undefined ? { details: httpError.details } : {}),
    },
  });
};
