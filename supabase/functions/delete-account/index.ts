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
  user_id?: string;
  removed_storage_objects?: number;
  deleted_auth_user?: boolean;
  error?: string;
  meta?: DeleteAccountMeta;
};

type SupabaseAdmin = SupabaseClient<DeleteAccountDatabase>;

type DeleteAccountMeta = {
  source: "pitch-atlas-delete-account";
  fetched_at: string;
  timezone: "America/Chicago";
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
  "Connection": "keep-alive",
};

const STORAGE_LIST_PAGE_SIZE = 1000;
const STORAGE_REMOVE_BATCH_SIZE = 100;
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

function json(status: number, body: CleanupResult): Response {
  return new Response(JSON.stringify({ ...body, meta: body.meta ?? meta() }), {
    status,
    headers: jsonHeaders,
  });
}

function failCleanup(code: string, detail: unknown): never {
  console.error(`delete-account ${code}`, detail);
  throw new CleanupFailure(code);
}

function bearerToken(req: Request): string | null {
  const header = req.headers.get("Authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST" && req.method !== "DELETE") {
    return json(405, { ok: false, error: "method_not_allowed" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const token = bearerToken(req);

  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, { ok: false, error: "server_not_configured" });
  }

  if (!token) {
    return json(401, { ok: false, error: "missing_bearer_token" });
  }

  const admin: SupabaseAdmin = createClient<DeleteAccountDatabase>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userResult, error: userError } = await admin.auth.getUser(token);
  const user = userResult?.user;

  if (userError || !user) {
    return json(401, { ok: false, error: "invalid_session" });
  }

  const userId = user.id;

  try {
    const removedStorageObjects = await removeDiscussionMediaObjects(admin, userId);

    await deleteIfPresent(admin, "discussion_media", "owner_id", userId);
    await deleteIfPresent(admin, "discussion_media_terms", "user_id", userId);
    await deleteIfPresent(admin, "discussion_reports", "reporter_id", userId);
    await deleteIfPresent(admin, "note_reports", "reporter_id", userId);
    await deleteIfPresent(admin, "note_tries", "user_id", userId);
    await deleteIfPresent(admin, "note_helpful", "user_id", userId);
    await deleteIfTableExists(admin, "messages", "sender_id", userId);
    await deleteIfTableExists(admin, "thread_participants", "user_id", userId);
    await deleteIfTableExists(admin, "threads", "created_by", userId);

    const { error: blockError } = await admin
      .from("blocked_users")
      .delete()
      .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

    if (blockError && blockError.code !== "42P01") {
      failCleanup("blocked_users_delete_failed", blockError);
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      failCleanup("auth_delete_failed", deleteUserError);
    }

    return json(200, {
      ok: true,
      user_id: userId,
      removed_storage_objects: removedStorageObjects,
      deleted_auth_user: true,
    });
  } catch (error) {
    if (!(error instanceof CleanupFailure)) {
      console.error("delete-account unexpected failure", error);
    }
    return json(500, {
      ok: false,
      user_id: userId,
      error: "delete_account_failed",
    });
  }
});
