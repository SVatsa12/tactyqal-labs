import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/errors.js";
import { requireAuth, signToken } from "../middleware/auth.js";
import { body } from "../middleware/validate.js";
import { loginSchema } from "../schemas/index.js";

export const authRouter = Router();

// Brute-force protection on login: 10 attempts / 15 min per IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, _res, next) =>
    next(new HttpError("RATE_LIMITED", "Too many login attempts. Try again in a few minutes.")),
});

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("timing-equalizer-not-a-password", 10);

authRouter.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = body(loginSchema, req);
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw new HttpError("UNAUTHORIZED", "Invalid email or password");

  const claims = { sub: user.id, email: user.email, name: user.name, role: user.role };
  res.json({
    data: {
      token: signToken(claims),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    },
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) throw new HttpError("UNAUTHORIZED", "User no longer exists");
  res.json({ data: user });
});
