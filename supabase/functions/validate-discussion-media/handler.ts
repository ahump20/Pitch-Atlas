import { detectMediaType, MEDIA_BYTE_CAPS } from "../_shared/media-type.ts";

export interface ValidationRecord {
  ownerId: string;
  storagePath: string;
  objectId: string;
  byteSize: number;
  mimeType: string;
  kind: "image" | "video";
}

export interface ValidationDependencies {
  getUser: (
    token: string,
  ) => Promise<{ id: string; isAnonymous: boolean } | null>;
  captureObject: (
    ownerId: string,
    storagePath: string,
  ) => Promise<string | null>;
  download: (storagePath: string) => Promise<Blob>;
  record: (record: ValidationRecord) => Promise<void>;
}

const MAX_BODY_BYTES = 2048;
const trustedOrigins = new Set([
  "https://pitch-atlas.com",
  "https://www.pitch-atlas.com",
]);

function response(req: Request, status: number, body: object): Response {
  const origin = req.headers.get("Origin") ?? "";
  let allowed = trustedOrigins.has(origin);
  try {
    const url = new URL(origin);
    allowed ||= ["localhost", "127.0.0.1"].includes(url.hostname) &&
      ["3000", "4173", "5173"].includes(url.port);
  } catch { /* Missing/invalid origin receives the production CORS origin. */ }
  return Response.json(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": allowed
        ? origin
        : "https://pitch-atlas.com",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Vary": "Authorization, Origin",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function readBody(req: Request): Promise<unknown> {
  const reader = req.body?.getReader();
  if (!reader) throw new Error("media_blocked: missing upload path");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new Error("media_blocked: request is too large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new Error("media_blocked: invalid upload request");
  }
}

export function createMediaValidationHandler(deps: ValidationDependencies) {
  return async (req: Request): Promise<Response> => {
    const reply = (status: number, body: object) => response(req, status, body);
    if (req.method === "OPTIONS") return reply(200, { ok: true });
    if (req.method !== "POST") {
      return reply(405, { ok: false, error: "method_not_allowed" });
    }
    const token = /^Bearer ([^\s]+)$/i.exec(
      req.headers.get("Authorization") ?? "",
    )?.[1];
    if (!token) return reply(401, { ok: false, error: "invalid_session" });
    if (
      req.headers.get("Content-Type")?.split(";")[0].trim() !==
        "application/json"
    ) {
      return reply(415, {
        ok: false,
        error: "media_blocked: use a JSON upload request",
      });
    }
    try {
      const user = await deps.getUser(token);
      if (!user || user.isAnonymous) {
        return reply(401, { ok: false, error: "invalid_session" });
      }
      const body = await readBody(req);
      const path = body && typeof body === "object" && "storagePath" in body
        ? body.storagePath
        : null;
      if (
        typeof path !== "string" || path.length > 1024 ||
        !path.startsWith(`${user.id}/`) ||
        path.split("/").some((part) =>
          !part || part === "." || part === ".."
        ) ||
        path.includes("\\") || path.includes("\0")
      ) {
        return reply(400, {
          ok: false,
          error:
            "media_blocked: upload path must stay inside your account folder",
        });
      }
      // Identity must be captured before reading, never after the download.
      const objectId = await deps.captureObject(user.id, path);
      if (!objectId) {
        return reply(400, {
          ok: false,
          error: "media_blocked: uploaded object not found",
        });
      }
      const blob = await deps.download(path);
      const type = detectMediaType(
        new Uint8Array(await blob.slice(0, 16).arrayBuffer()),
      );
      if (!type || blob.size === 0 || blob.size > MEDIA_BYTE_CAPS[type.kind]) {
        return reply(400, {
          ok: false,
          error: "media_blocked: actual file type or size is not allowed",
        });
      }
      await deps.record({
        ownerId: user.id,
        storagePath: path,
        objectId,
        byteSize: blob.size,
        mimeType: type.mime,
        kind: type.kind,
      });
      return reply(200, {
        ok: true,
        byteSize: blob.size,
        mimeType: type.mime,
        kind: type.kind,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (
        message.startsWith("media_blocked:") ||
        message.startsWith("rate_limit:")
      ) {
        return reply(400, { ok: false, error: message });
      }
      return reply(502, { ok: false, error: "validation_unavailable" });
    }
  };
}
