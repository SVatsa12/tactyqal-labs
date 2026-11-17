import type { Request } from "express";
import type { z } from "zod";
import { HttpError } from "../lib/errors.js";

/** Parse a request part with a Zod schema, throwing a VALIDATION_ERROR on failure. */
export function parse<S extends z.ZodType>(
  schema: S,
  value: unknown,
  where: "body" | "query" | "params" = "body",
): z.infer<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new HttpError(
      "VALIDATION_ERROR",
      `Invalid request ${where}`,
      result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    );
  }
  return result.data;
}

export const body = <S extends z.ZodType>(schema: S, req: Request) => parse(schema, req.body, "body");
export const query = <S extends z.ZodType>(schema: S, req: Request) => parse(schema, req.query, "query");
export const params = <S extends z.ZodType>(schema: S, req: Request) => parse(schema, req.params, "params");
