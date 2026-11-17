import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../lib/env.js";
import { HttpError } from "../lib/errors.js";

const claimsSchema = z.object({
  sub: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(["ADMIN", "EDITOR"]),
});

export type AuthUser = z.infer<typeof claimsSchema>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign(user, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    algorithm: "HS256",
  });
}

function readUser(req: Request): AuthUser | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return undefined;
  try {
    const decoded = jwt.verify(header.slice(7), env.JWT_SECRET, { algorithms: ["HS256"] });
    const claims = claimsSchema.safeParse(decoded);
    return claims.success ? claims.data : undefined;
  } catch {
    return undefined;
  }
}

/** Attaches req.user when a valid token is present; never rejects. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  req.user = readUser(req);
  next();
}

/** Rejects the request unless a valid token is present. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const user = readUser(req);
  if (!user) return next(new HttpError("UNAUTHORIZED", "Missing or invalid token"));
  req.user = user;
  next();
}

export function requireRole(...roles: AuthUser["role"][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError("UNAUTHORIZED", "Missing or invalid token"));
    if (!roles.includes(req.user.role)) return next(new HttpError("FORBIDDEN", "Insufficient role"));
    next();
  };
}
