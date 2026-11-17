import express, { Router } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { env, isProd, isTest } from "./lib/env.js";
import { HttpError } from "./lib/errors.js";
import { docsCsp, docsInitScript, docsPage } from "./lib/docs-page.js";
import { openApiSpec } from "./lib/openapi.js";
import { pingDb, withDbRetry } from "./lib/prisma.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { authRouter } from "./routes/auth.js";
import { leadsRouter } from "./routes/leads.js";
import { postsRouter } from "./routes/posts.js";
import { termsRouter } from "./routes/terms.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.set("query parser", "simple");

  app.use(
    pinoHttp({
      level: isTest ? "silent" : isProd ? "info" : "debug",
      autoLogging: { ignore: (req) => req.url === "/api/v1/health" },
      redact: ["req.headers.authorization", "req.headers.cookie"],
      ...(isProd || isTest ? {} : { transport: { target: "pino-pretty", options: { singleLine: true } } }),
    }),
  );
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      methods: ["GET", "POST", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      maxAge: 600,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  // General rate limit for the whole API.
  app.use(
    "/api",
    rateLimit({
      windowMs: 60 * 1000,
      limit: 300,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      handler: (_req, _res, next) => next(new HttpError("RATE_LIMITED", "Too many requests")),
    }),
  );

  // Docs: Swagger UI from a CDN (see lib/docs-page.ts), with its own CSP for this page only.
  app.get("/api/docs", (_req, res) => {
    res.setHeader("Content-Security-Policy", docsCsp);
    res.type("html").send(docsPage);
  });
  app.get("/api/docs/init.js", (_req, res) => res.type("js").send(docsInitScript));
  app.get("/api/openapi.json", (_req, res) => res.json(openApiSpec));

  const v1 = Router();
  // Tolerates a Neon cold start: each attempt waits up to connect_timeout (15s) and is retried once.
  // Still down -> 503, and the platform health check simply polls again.
  v1.get("/health", async (_req, res) => {
    try {
      await withDbRetry(pingDb, { attempts: 2, delayMs: 1500 });
    } catch {
      throw new HttpError("SERVICE_UNAVAILABLE", "Database is not reachable yet, try again shortly");
    }
    res.json({ data: { status: "ok" } });
  });
  v1.use("/auth", authRouter);
  v1.use("/posts", postsRouter);
  v1.use("/categories", termsRouter("category"));
  v1.use("/tags", termsRouter("tag"));
  v1.use("/leads", leadsRouter);
  app.use("/api/v1", v1);

  app.get("/", (_req, res) => res.redirect("/api/docs"));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
