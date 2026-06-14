import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

type CleanupResult = {
  ok: boolean;
  user_id?: string;
  removed_storage_objects?: number;
  deleted_auth_user?: boolean;
  error?: string;
};

const jsonHeaders = {
  "Content-Type": "application/json",
  "Connection": "keep-alive",
};

const STORAGE_LIST_PAGE_SIZE = 1000;
const STORAGE_REMOVE_BATCH_SIZE = 100;

function json(status: number, body: CleanupResult): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });
}

function bearerToken(req: Request): string | null {
  const header = req.headers.get("Authorization") ?? "";
  const match = header.match(/^Bearer\\s+(.+)$/i);
  return match?.[1] ?? null;
}

async function removeDiscussionMediaObjects(admin: ReturnType<typeof createClient>, userId: string): Promise<number> {
  const bucket = admin.storage.from("discussion-media");
  const paths: string[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await bucket.list(userId, {
      limit: STORAGE_LIST_PAGE_SIZE,
      offset,
    });

    if (error) {
      throw new Error(`storage_list_failed: ${error.message}`);
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
      throw new Error(`storage_remove_failed: ${removeError.message}`);
    }
  }

  return paths.length;
}

async function deleteIfPresent(admin: ReturnType<typeof createClient>, table: string, column: string, value: string) {
  const { error } = await admin.from(table).delete().eq(column, value);
  if (error) {
    throw new Error(`${table}_delete_failed: ${error.message}`);
  }
}

Deno.serve(async (req: Request) => {
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

  const admin = createClient(supabaseUrl, serviceRoleKey, {
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

    const { error: blockError } = await admin
      .from("blocked_users")
      .delete()
      .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

    if (blockError && blockError.code !== "42P01") {
      throw new Error(`blocked_users_delete_failed: ${blockError.message}`);
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      throw new Error(`auth_delete_failed: ${deleteUserError.message}`);
    }

    return json(200, {
      ok: true,
      user_id: userId,
      removed_storage_objects: removedStorageObjects,
      deleted_auth_user: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "delete_account_failed";
    return json(500, {
      ok: false,
      user_id: userId,
      error: message,
    });
  }
});
