/** OpenAPI 3.1 description of /api/v1, served at /api/docs. */

const errorResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
});

const json = (schema: object) => ({ "application/json": { schema } });

const termPaths = (tag: string, base: string) => ({
  [base]: {
    get: {
      tags: [tag],
      summary: `List ${base.slice(1)} with published post counts`,
      responses: {
        200: {
          description: "OK",
          content: json({
            type: "object",
            properties: { data: { type: "array", items: { $ref: "#/components/schemas/TermWithCount" } } },
          }),
        },
      },
    },
    post: {
      tags: [tag],
      summary: `Create`,
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: json({ $ref: "#/components/schemas/TermInput" }) },
      responses: {
        201: { description: "Created", content: json({ type: "object", properties: { data: { $ref: "#/components/schemas/Term" } } }) },
        400: errorResponse("Validation error"),
        401: errorResponse("Unauthorized"),
        409: errorResponse("Slug already exists"),
      },
    },
  },
  [`${base}/{id}`]: {
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    patch: {
      tags: [tag],
      summary: "Update",
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: json({ $ref: "#/components/schemas/TermInput" }) },
      responses: {
        200: { description: "OK", content: json({ type: "object", properties: { data: { $ref: "#/components/schemas/Term" } } }) },
        401: errorResponse("Unauthorized"),
        404: errorResponse("Not found"),
      },
    },
    delete: {
      tags: [tag],
      summary: "Delete",
      security: [{ bearerAuth: [] }],
      responses: { 204: { description: "Deleted" }, 401: errorResponse("Unauthorized"), 404: errorResponse("Not found") },
    },
  },
});

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Tactyqal Labs Blog API",
    version: "1.0.0",
    description:
      "REST API for the Tactyqal Labs blog. Successful responses are `{ data, meta? }`; errors are `{ error: { code, message, details? } }`. Write endpoints need `Authorization: Bearer <token>` from `POST /auth/login`.",
  },
  servers: [{ url: "/api/v1" }],
  tags: [{ name: "Auth" }, { name: "Posts" }, { name: "Categories" }, { name: "Tags" }],
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: {
                type: "string",
                enum: ["BAD_REQUEST", "VALIDATION_ERROR", "UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND", "CONFLICT", "RATE_LIMITED", "INTERNAL_ERROR"],
              },
              message: { type: "string" },
              details: {},
            },
          },
        },
      },
      Term: {
        type: "object",
        properties: { id: { type: "string" }, name: { type: "string" }, slug: { type: "string" } },
      },
      TermWithCount: {
        allOf: [{ $ref: "#/components/schemas/Term" }, { type: "object", properties: { postCount: { type: "integer" } } }],
      },
      TermInput: {
        type: "object",
        properties: { name: { type: "string", maxLength: 80 }, slug: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" } },
      },
      PostSummary: {
        type: "object",
        properties: {
          id: { type: "string" },
          slug: { type: "string" },
          title: { type: "string" },
          excerpt: { type: ["string", "null"] },
          coverImageUrl: { type: ["string", "null"] },
          status: { type: "string", enum: ["DRAFT", "PUBLISHED"] },
          publishedAt: { type: ["string", "null"], format: "date-time" },
          readingTimeMinutes: { type: "integer" },
          updatedAt: { type: "string", format: "date-time" },
          author: { type: ["object", "null"], properties: { id: { type: "string" }, name: { type: "string" } } },
          categories: { type: "array", items: { $ref: "#/components/schemas/Term" } },
          tags: { type: "array", items: { $ref: "#/components/schemas/Term" } },
        },
      },
      Post: {
        allOf: [
          { $ref: "#/components/schemas/PostSummary" },
          {
            type: "object",
            properties: {
              content: { type: "string", description: "Sanitized HTML" },
              seoTitle: { type: ["string", "null"] },
              seoDescription: { type: ["string", "null"] },
              createdAt: { type: "string", format: "date-time" },
            },
          },
        ],
      },
      PostInput: {
        type: "object",
        properties: {
          title: { type: "string", maxLength: 200 },
          slug: { type: "string", description: "Generated from the title when omitted" },
          excerpt: { type: ["string", "null"], description: "Generated from the content when empty" },
          content: { type: "string", description: "HTML; sanitized on save" },
          coverImageUrl: { type: ["string", "null"], format: "uri" },
          status: { type: "string", enum: ["DRAFT", "PUBLISHED"] },
          publishedAt: { type: ["string", "null"], format: "date-time", description: "Set automatically on first publish" },
          seoTitle: { type: ["string", "null"] },
          seoDescription: { type: ["string", "null"] },
          categoryIds: { type: "array", items: { type: "string" } },
          tagIds: { type: "array", items: { type: "string" } },
        },
      },
      PageMeta: {
        type: "object",
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
    },
  },
  paths: {
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Exchange email + password for a JWT (rate limited)",
        requestBody: {
          required: true,
          content: json({
            type: "object",
            required: ["email", "password"],
            properties: { email: { type: "string", format: "email" }, password: { type: "string" } },
          }),
        },
        responses: {
          200: {
            description: "OK",
            content: json({
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    user: { type: "object", properties: { id: { type: "string" }, email: { type: "string" }, name: { type: "string" }, role: { type: "string" } } },
                  },
                },
              },
            }),
          },
          401: errorResponse("Invalid credentials"),
          429: errorResponse("Too many attempts"),
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Current user",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "OK" }, 401: errorResponse("Unauthorized") },
      },
    },
    "/posts": {
      get: {
        tags: ["Posts"],
        summary: "List posts",
        description:
          "Anonymous callers only see published posts. With a token, `status` filters drafts/published/all (default all).",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
          { name: "status", in: "query", schema: { type: "string", enum: ["draft", "published", "all"] } },
          { name: "q", in: "query", description: "Search title and excerpt", schema: { type: "string" } },
          { name: "category", in: "query", description: "Category slug", schema: { type: "string" } },
          { name: "tag", in: "query", description: "Tag slug", schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "OK",
            content: json({
              type: "object",
              properties: {
                data: { type: "array", items: { $ref: "#/components/schemas/PostSummary" } },
                meta: { $ref: "#/components/schemas/PageMeta" },
              },
            }),
          },
          400: errorResponse("Invalid query"),
        },
      },
      post: {
        tags: ["Posts"],
        summary: "Create a post",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: json({ allOf: [{ $ref: "#/components/schemas/PostInput" }, { required: ["title"] }] }) },
        responses: {
          201: { description: "Created", content: json({ type: "object", properties: { data: { $ref: "#/components/schemas/Post" } } }) },
          400: errorResponse("Validation error"),
          401: errorResponse("Unauthorized"),
        },
      },
    },
    "/posts/{id}": {
      parameters: [{ name: "id", in: "path", required: true, description: "Post id or slug", schema: { type: "string" } }],
      get: {
        tags: ["Posts"],
        summary: "Get one post by id or slug",
        responses: {
          200: { description: "OK", content: json({ type: "object", properties: { data: { $ref: "#/components/schemas/Post" } } }) },
          404: errorResponse("Not found (or not published)"),
        },
      },
      patch: {
        tags: ["Posts"],
        summary: "Update a post (partial)",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: json({ $ref: "#/components/schemas/PostInput" }) },
        responses: {
          200: { description: "OK", content: json({ type: "object", properties: { data: { $ref: "#/components/schemas/Post" } } }) },
          400: errorResponse("Validation error"),
          401: errorResponse("Unauthorized"),
          404: errorResponse("Not found"),
          409: errorResponse("Slug already used"),
        },
      },
      delete: {
        tags: ["Posts"],
        summary: "Delete a post",
        security: [{ bearerAuth: [] }],
        responses: { 204: { description: "Deleted" }, 401: errorResponse("Unauthorized"), 404: errorResponse("Not found") },
      },
    },
    ...termPaths("Categories", "/categories"),
    ...termPaths("Tags", "/tags"),
  },
};
