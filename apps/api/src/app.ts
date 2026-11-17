import express, { Router } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import swaggerUi from "swagger-ui-express";
import { env, isProd } from "./lib/env.js";
import { HttpError } from "./lib/errors.js";
import { openApiSpec } from "./lib/openapi.js";
import { prisma } from "./lib/prisma.js";
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
      level: isProd ? "info" : "debug",
      autoLogging: { ignore: (req) => req.url === "/api/v1/health" },
      redact: ["req.headers.authorization", "req.headers.cookie"],
      ...(isProd ? {} : { transport: { target: "pino-pretty", options: { singleLine: true } } }),
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

  // Docs: Swagger UI needs inline scripts/styles, so relax CSP for this path only.
  app.use(
    "/api/docs",
    helmet({ contentSecurityPolicy: false }),
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, { customSiteTitle: "Tactyqal Blog API" }),
  );
  app.get("/api/openapi.json", (_req, res) => res.json(openApiSpec));

  const v1 = Router();
  v1.get("/health", async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
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
