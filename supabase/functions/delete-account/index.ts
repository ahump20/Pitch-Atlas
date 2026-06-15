import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type CleanupTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};

type CleanupSchema = {
  Tables: Record<string, CleanupTable>;
  Views: Record<string, never>;
  Functions: Record<string, never>;
  Enums: Record<string, never>;
  CompositeTypes: Record<string, never>;
};

type DeleteAccountDatabase = {
  public: CleanupSchema;
};

type CleanupResult = {
  ok: boolean;
  error?: string;
  meta?: DeleteAccountMeta;
};

type SupabaseAdmin = SupabaseClient<DeleteAccountDatabase>;

type DeleteAccountMeta = {
  source: "pitch-atlas-delete-account";
  fetched_at: string;
  timezone: "America/Chicago";
};

type FetchInitWithSignal = Parameters<typeof fetch>[1] & {
  signal?: AbortSignal | null;
};

const allowedMethods = "POST, DELETE, OPTIONS";

const trustedOrigins = new Set([
  "https://pitch-atlas.com",
  "https://www.pitch-atlas.com",
]);

const localDevPorts = new Set(["3000", "4173", "5173"]);

function isLocalDevOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return (
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      (url.port === "" || localDevPorts.has(url.port))
    );
  } catch {
    return false;
  }
}

function allowedOriginFor(req: Request): string {
  const origin = req.headers.get("Origin")?.trim();
  if (origin && (trustedOrigins.has(origin) || isLocalDevOrigin(origin))) {
    return origin;
  }

  return "https://pitch-atlas.com";
}

function corsHeaders(req: Request): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": allowedOriginFor(req),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": allowedMethods,
    "Access-Control-Max-Age": "86400",
    "Vary": "Authorization, Origin",
  };
}

const allowHeaders = {
  "Allow": allowedMethods,
};

function jsonHeaders(req: Request): Record<string, string> {
  return {
    ...corsHeaders(req),
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Pragma": "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Connection": "keep-alive",
  };
}

const STORAGE_LIST_PAGE_SIZE = 1000;
const STORAGE_REMOVE_BATCH_SIZE = 100;
const MAX_BODY_BYTES = 4096;
const SUPABASE_REQUEST_TIMEOUT_MS = 15000;
const OPTIONAL_DELETE_MISSING_CODES = new Set(["42P01", "42703"]);

class CleanupFailure extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "CleanupFailure";
  }
}

function meta(): DeleteAccountMeta {
  return {
    source: "pitch-atlas-delete-account",
    fetched_at: new Date().toISOString(),
    timezone: "America/Chicago",
  };
}

function provenanceHeaders(responseMeta: DeleteAccountMeta): Record<string, string> {
  return {
    "X-Data-Source": responseMeta.source,
    "X-Origin-Data-Source": responseMeta.source,
    "X-Last-Updated": responseMeta.fetched_at,
  };
}

function preflight(req: Request): Response {
  const responseMeta = meta();

  return new Response("ok", {
    headers: {
      ...corsHeaders(req),
      ...allowHeaders,
      "Cache-Control": "no-store",
      "Pragma": "no-cache",
      ...provenanceHeaders(responseMeta),
    },
  });
}

function json(req: Request, status: number, body: CleanupResult, extraHeaders: Record<string, string> = {}): Response {
  const responseMeta = body.meta ?? meta();

  return new Response(JSON.stringify({ ...body, meta: responseMeta }), {
    status,
    headers: {
      ...jsonHeaders(req),
      ...provenanceHeaders(responseMeta),
      ...extraHeaders,
    },
  });
}

function failCleanup(code: string, detail: unknown): never {
  console.error(`delete-account ${code}`, detail);
  throw new CleanupFailure(code);
}

function bearerToken(req: Request): string | null {
  const header = req.headers.get("Authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  return token ? token : null;
}

function requestBodyTooLarge(req: Request): boolean {
  const rawLength = req.headers.get("Content-Length");
  if (!rawLength) {
    return false;
  }

  const length = Number.parseInt(rawLength, 10);
  return Number.isFinite(length) && length > MAX_BODY_BYTES;
}

async function streamedRequestBodyTooLarge(req: Request): Promise<boolean> {
  if (!req.body) {
    return false;
  }

  const reader = req.body.getReader();
  let receivedBytes = 0;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        return false;
      }

      if (!value) {
        continue;
      }

      receivedBytes += value.byteLength;
      if (receivedBytes > MAX_BODY_BYTES) {
        try {
          await reader.cancel();
        } catch (error) {
          console.error("delete-account body reader cancel failed", error);
        }
        return true;
      }
    }
  } catch (error) {
    console.error("delete-account body reader failed", error);
    return false;
  }
}

async function fetchWithTimeout(input: Parameters<typeof fetch>[0], init?: FetchInitWithSignal): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SUPABASE_REQUEST_TIMEOUT_MS);
  const upstreamSignal = init?.signal;
  const abort = () => controller.abort();

  if (upstreamSignal?.aborted) {
    controller.abort();
  } else {
    upstreamSignal?.addEventListener("abort", abort, { once: true });
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
    upstreamSignal?.removeEventListener("abort", abort);
  }
}

async function removeDiscussionMediaObjects(admin: SupabaseAdmin, userId: string): Promise<number> {
  const bucket = admin.storage.from("discussion-media");
  const paths: string[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await bucket.list(userId, {
      limit: STORAGE_LIST_PAGE_SIZE,
      offset,
    });

    if (error) {
      failCleanup("storage_list_failed", error);
    }

    const objects = data ?? [];
    paths.push(
      ...objects
        .filter((object) => object.name && object.name !== ".emptyFolderPlaceholder")
        .map((object) => `${userId}/${object.name}`),
    );

    if (objects.length < STORAGE_LIST_PAGE_SIZE) {
      break;
    }

    offset += STORAGE_LIST_PAGE_SIZE;
  }

  if (paths.length === 0) {
    return 0;
  }

  for (let i = 0; i < paths.length; i += STORAGE_REMOVE_BATCH_SIZE) {
    const { error: removeError } = await bucket.remove(paths.slice(i, i + STORAGE_REMOVE_BATCH_SIZE));
    if (removeError) {
      failCleanup("storage_remove_failed", removeError);
    }
  }

  return paths.length;
}

async function deleteIfPresent(admin: SupabaseAdmin, table: string, column: string, value: string) {
  const { error } = await admin.from(table).delete().eq(column, value);
  if (error) {
    failCleanup("required_row_delete_failed", { table, error });
  }
}

async function deleteIfTableExists(admin: SupabaseAdmin, table: string, column: string, value: string) {
  const { error } = await admin.from(table).delete().eq(column, value);
  if (!error) return;
  if (OPTIONAL_DELETE_MISSING_CODES.has(error.code ?? "")) return;
  failCleanup("optional_row_delete_failed", { table, error });
}

async function deleteBlockedUsersForDeletedAccount(admin: SupabaseAdmin, userId: string) {
  const columns = ["blocker_id", "blocked_id"] as const;

  for (const column of columns) {
    const { error } = await admin.from("blocked_users").delete().eq(column, userId);
    if (!error) continue;
    if (error.code === "42P01") continue;
    failCleanup("blocked_users_delete_failed", { column, error });
  }
}

Deno.serve(async (req: Request) => {
  const reply = (status: number, body: CleanupResult, extraHeaders: Record<string, string> = {}) =>
    json(req, status, body, extraHeaders);

  if (req.method === "OPTIONS") {
    return preflight(req);
  }

  if (req.method !== "POST" && req.method !== "DELETE") {
    return reply(405, { ok: false, error: "method_not_allowed" }, allowHeaders);
  }

  const token = bearerToken(req);
  if (!token) {
    return reply(401, { ok: false, error: "missing_bearer_token" });
  }

  if (requestBodyTooLarge(req)) {
    return reply(413, { ok: false, error: "request_too_large" });
  }

  if (await streamedRequestBodyTooLarge(req)) {
    return reply(413, { ok: false, error: "request_too_large" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return reply(500, { ok: false, error: "server_not_configured" });
  }

  const admin: SupabaseAdmin = createClient<DeleteAccountDatabase>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fetchWithTimeout },
  });

  let userLookup;
  try {
    userLookup = await admin.auth.getUser(token);
  } catch (error) {
    console.error("delete-account auth lookup failed", error);
    return reply(502, { ok: false, error: "auth_lookup_failed" });
  }

  const { data: userResult, error: userError } = userLookup;
  const user = userResult?.user;

  if (userError || !user) {
    return reply(401, { ok: false, error: "invalid_session" });
  }

  const userId = user.id;

  try {
    await removeDiscussionMediaObjects(admin, userId);

    await deleteIfPresent(admin, "discussion_media", "owner_id", userId);
    await deleteIfPresent(admin, "discussion_media_terms", "user_id", userId);
    await deleteIfPresent(admin, "discussion_reports", "reporter_id", userId);
    await deleteIfPresent(admin, "note_reports", "reporter_id", userId);
    await deleteIfPresent(admin, "note_tries", "user_id", userId);
    await deleteIfPresent(admin, "note_helpful", "user_id", userId);
    await deleteIfPresent(admin, "field_notes", "author_id", userId);
    await deleteIfPresent(admin, "discussion_posts", "author_id", userId);
    await deleteIfTableExists(admin, "messages", "sender_id", userId);
    await deleteIfTableExists(admin, "thread_participants", "user_id", userId);
    await deleteIfTableExists(admin, "threads", "created_by", userId);

    await deleteBlockedUsersForDeletedAccount(admin, userId);

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      failCleanup("auth_delete_failed", deleteUserError);
    }

    return reply(200, {
      ok: true,
    });
  } catch (error) {
    if (!(error instanceof CleanupFailure)) {
      console.error("delete-account unexpected failure", error);
    }
    return reply(500, {
      ok: false,
      error: "delete_account_failed",
    });
  }
});
