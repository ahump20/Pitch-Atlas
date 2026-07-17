import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

type OrphanRow = { storage_path: string };

type GcDatabase = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: {
      authorize_discussion_media_gc: {
        Args: { p_token_sha256: string };
        Returns: boolean;
      };
      orphan_discussion_media_paths: {
        Args: { p_limit?: number };
        Returns: OrphanRow[];
      };
      record_discussion_media_gc_run: {
        Args: {
          p_error_code?: string | null;
          p_removed: number;
          p_requested: number;
          p_status: "ok" | "partial" | "error";
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type ResponseMeta = {
  source: "pitch-atlas-orphan-media-gc";
  fetched_at: string;
  timezone: "America/Chicago";
};

type ResponseBody = {
  ok: boolean;
  requested?: number;
  removed?: number;
  error?: string;
  meta?: ResponseMeta;
};

const SOURCE = "pitch-atlas-orphan-media-gc" as const;
const BUCKET = "discussion-media";
const MAX_OBJECTS_PER_RUN = 1000;
const AUTOMATION_HEADER = "X-Pitch-Atlas-Automation";

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return Array.from(
    new Uint8Array(digest),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
}

function meta(): ResponseMeta {
  return {
    source: SOURCE,
    fetched_at: new Date().toISOString(),
    timezone: "America/Chicago",
  };
}

function json(
  status: number,
  body: ResponseBody,
  extraHeaders: Record<string, string> = {},
): Response {
  const responseMeta = body.meta ?? meta();

  return Response.json(
    { ...body, meta: responseMeta },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "Pragma": "no-cache",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "X-Data-Source": responseMeta.source,
        "X-Origin-Data-Source": responseMeta.source,
        "X-Last-Updated": responseMeta.fetched_at,
        ...extraHeaders,
      },
    },
  );
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return json(405, { ok: false, error: "method_not_allowed" }, {
      "Allow": "POST",
    });
  }

  const automationSecret = req.headers.get(AUTOMATION_HEADER);
  if (!automationSecret || !/^[0-9a-f]{64}$/i.test(automationSecret)) {
    return json(401, { ok: false, error: "unauthorized" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    console.error("gc-orphan-discussion-media public client is not configured");
    return json(500, { ok: false, error: "server_not_configured" });
  }

  const publicClient = createClient<GcDatabase>(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  const tokenHash = await sha256Hex(automationSecret);
  const { data: authorized, error: authError } = await publicClient.rpc(
    "authorize_discussion_media_gc",
    { p_token_sha256: tokenHash },
  );

  if (authError) {
    console.error(
      "gc-orphan-discussion-media authorization lookup failed",
      authError.code,
    );
    return json(502, { ok: false, error: "auth_check_failed" });
  }

  if (authorized !== true) {
    return json(401, { ok: false, error: "unauthorized" });
  }

  // Do not read or use service-role credentials until the hash-only gate passes.
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceRoleKey) {
    console.error("gc-orphan-discussion-media admin client is not configured");
    return json(500, { ok: false, error: "server_not_configured" });
  }

  const supabaseAdmin = createClient<GcDatabase>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  async function recordRun(
    status: "ok" | "partial" | "error",
    requested: number,
    removed: number,
    errorCode: string | null = null,
  ) {
    const { error } = await supabaseAdmin.rpc(
      "record_discussion_media_gc_run",
      {
        p_status: status,
        p_requested: requested,
        p_removed: removed,
        p_error_code: errorCode,
      },
    );
    if (error) {
      console.error(
        "gc-orphan-discussion-media heartbeat write failed",
        error.code,
      );
    }
  }

  const { data, error: listError } = await supabaseAdmin
    .rpc(
      "orphan_discussion_media_paths",
      { p_limit: MAX_OBJECTS_PER_RUN },
    );

  if (listError) {
    console.error(
      "gc-orphan-discussion-media orphan lookup failed",
      listError.code,
    );
    await recordRun("error", 0, 0, "orphan_lookup_failed");
    return json(502, { ok: false, error: "orphan_lookup_failed" });
  }

  const paths = ((data ?? []) as OrphanRow[])
    .map((row) => row.storage_path)
    .filter((path): path is string =>
      typeof path === "string" && path.length > 0
    )
    .slice(0, MAX_OBJECTS_PER_RUN);

  if (paths.length === 0) {
    await recordRun("ok", 0, 0);
    return json(200, { ok: true, requested: 0, removed: 0 });
  }

  const { data: removedObjects, error: removeError } = await supabaseAdmin
    .storage
    .from(BUCKET)
    .remove(paths);
  if (removeError) {
    console.error(
      "gc-orphan-discussion-media storage removal failed",
      removeError.name,
    );
    await recordRun("error", paths.length, 0, "storage_remove_failed");
    return json(502, { ok: false, error: "storage_remove_failed" });
  }

  const removed = Array.isArray(removedObjects) ? removedObjects.length : 0;
  await recordRun(
    removed === paths.length ? "ok" : "partial",
    paths.length,
    removed,
  );
  return json(200, { ok: true, requested: paths.length, removed });
});
