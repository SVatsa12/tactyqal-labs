/**
 * Swagger UI for /api/docs. The UI's JS/CSS load from a pinned CDN build instead of
 * swagger-ui-express, which serves them with express.static(): Vercel's Express runtime
 * ignores express.static(), so those assets would 404 there.
 */
const CDN = "https://cdn.jsdelivr.net";
const SWAGGER_UI = `${CDN}/npm/swagger-ui-dist@5.35.0`;

/** Replaces the API-wide CSP for the docs page only: CDN assets, no inline scripts. */
export const docsCsp = [
  "default-src 'self'",
  `script-src 'self' ${CDN}`,
  `style-src 'self' ${CDN} 'unsafe-inline'`,
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
].join("; ");

export const docsPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tactyqal Blog API</title>
    <link rel="stylesheet" href="${SWAGGER_UI}/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="${SWAGGER_UI}/swagger-ui-bundle.js" crossorigin></script>
    <script src="/api/docs/init.js"></script>
  </body>
</html>
`;

export const docsInitScript = `window.ui = SwaggerUIBundle({ url: "/api/openapi.json", dom_id: "#swagger-ui", deepLinking: true });\n`;
