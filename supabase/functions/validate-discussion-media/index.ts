import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { createMediaValidationHandler } from "./handler.ts";

const url = Deno.env.get("SUPABASE_URL");
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) throw new Error("Media validator is not configured");

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        signal: AbortSignal.any([
          ...(init?.signal ? [init.signal] : []),
          AbortSignal.timeout(15000),
        ]),
      }),
  },
});

Deno.serve(createMediaValidationHandler({
  async getUser(token) {
    const { data, error } = await admin.auth.getUser(token);
    return error || !data.user
      ? null
      : { id: data.user.id, isAnonymous: data.user.is_anonymous !== false };
  },
  async captureObject(ownerId, storagePath) {
    const { data, error } = await admin.rpc(
      "discussion_media_validation_object",
      {
        p_owner_id: ownerId,
        p_storage_path: storagePath,
      },
    );
    if (error) throw new Error(error.message);
    return data?.[0]?.object_id ?? null;
  },
  async download(storagePath) {
    const encodedPath = storagePath.split("/").map(encodeURIComponent).join(
      "/",
    );
    const { data, error } = await admin.storage.from("discussion-media")
      .download(encodedPath);
    if (error || !data) throw new Error("Storage download failed");
    return data;
  },
  async record(record) {
    const { error } = await admin.rpc("record_discussion_media_validation", {
      p_owner_id: record.ownerId,
      p_storage_path: record.storagePath,
      p_object_id: record.objectId,
      p_byte_size: record.byteSize,
      p_mime_type: record.mimeType,
      p_kind: record.kind,
    });
    if (error) throw new Error(error.message);
  },
}));
