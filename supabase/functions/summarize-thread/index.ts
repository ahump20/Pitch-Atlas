import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SummaryMeta = {
  source: "pitch-atlas-summarize-thread";
  fetched_at: string;
  timezone: "America/Chicago";
};

type JsonBody = Record<string, unknown> & {
  meta?: SummaryMeta;
};

type MessageRow = {
  sender_id: string | null;
  body: string | null;
  created_at: string | null;
};

type RuntimeConfig = {
  supabaseUrl: string;
  serviceKey: string;
  openaiApiKey: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
  "Connection": "keep-alive",
};

const MAX_MESSAGES = 200;
const MAX_TRANSCRIPT_CHARS = 12000;

function meta(): SummaryMeta {
  return {
    source: "pitch-atlas-summarize-thread",
    fetched_at: new Date().toISOString(),
    timezone: "America/Chicago",
  };
}

function json(status: number, body: JsonBody): Response {
  return new Response(JSON.stringify({ ...body, meta: body.meta ?? meta() }), {
    status,
    headers: jsonHeaders,
  });
}

function bearerToken(req: Request): string | null {
  const header = req.headers.get("Authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function serviceKeyFromEnv(): string | null {
  const rawSecretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  const fallback = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!rawSecretKeys) {
    return fallback ?? null;
  }

  try {
    const parsed = JSON.parse(rawSecretKeys) as Record<string, unknown>;
    const value = parsed.default;
    return typeof value === "string" && value.length > 0 ? value : fallback ?? null;
  } catch (error) {
    console.error("summarize-thread Supabase secret config is invalid", error);
    return fallback ?? null;
  }
}

function runtimeConfig(): RuntimeConfig | null {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = serviceKeyFromEnv();
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

  if (!supabaseUrl || !serviceKey || !openaiApiKey) {
    console.error("summarize-thread runtime config is missing");
    return null;
  }

  return { supabaseUrl, serviceKey, openaiApiKey };
}

function createAdminClient(config: RuntimeConfig): SupabaseClient {
  return createClient(config.supabaseUrl, config.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? body as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function buildTranscript(messages: MessageRow[]): string {
  const transcript = messages
    .map((message) => {
      const timestamp = message.created_at ?? "unknown-time";
      const sender = message.sender_id ?? "unknown-sender";
      const body = message.body ?? "";
      return `[${timestamp}] ${sender}: ${body}`;
    })
    .join("\n");

  if (transcript.length <= MAX_TRANSCRIPT_CHARS) {
    return transcript;
  }

  return transcript.slice(-MAX_TRANSCRIPT_CHARS);
}

function parseSummary(content: unknown): Record<string, unknown> | null {
  if (typeof content !== "string" || content.trim().length === 0) {
    return null;
  }

  try {
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return {
      summary: content,
      action_items: [],
      sentiment: "unknown",
    };
  }
}

async function requestSummary(openaiApiKey: string, transcript: string): Promise<Response | null> {
  try {
    return await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "Summarize chat threads clearly. Return JSON with keys: summary, action_items (array), sentiment.",
          },
          {
            role: "user",
            content: transcript,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });
  } catch (error) {
    console.error("summarize-thread OpenAI request crashed", error);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, { error: "method_not_allowed" });
  }

  const token = bearerToken(req);
  if (!token) {
    return json(401, { error: "missing_bearer_token" });
  }

  const config = runtimeConfig();
  if (!config) {
    return json(500, { error: "server_not_configured" });
  }

  const admin = createAdminClient(config);

  const {
    data: { user },
    error: userError,
  } = await admin.auth.getUser(token);

  if (userError || !user) {
    return json(401, { error: "invalid_session" });
  }

  const body = await readBody(req);
  const threadId = typeof body?.thread_id === "string" ? body.thread_id.trim() : "";

  if (!threadId) {
    return json(400, { error: "thread_id_required" });
  }

  const { data: participant, error: participantError } = await admin
    .from("thread_participants")
    .select("thread_id")
    .eq("thread_id", threadId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (participantError) {
    console.error("summarize-thread participant lookup failed", participantError);
    return json(500, { error: "participant_lookup_failed" });
  }

  if (!participant) {
    return json(403, { error: "forbidden" });
  }

  const { data: messages, error: messagesError } = await admin
    .from("messages")
    .select("sender_id, body, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(MAX_MESSAGES);

  if (messagesError) {
    console.error("summarize-thread messages lookup failed", messagesError);
    return json(500, { error: "messages_lookup_failed" });
  }

  const rows = (messages ?? []) as MessageRow[];

  if (rows.length === 0) {
    return json(200, {
      thread_id: threadId,
      message_count: 0,
      result: {
        summary: "No messages in this thread yet.",
        action_items: [],
        sentiment: "neutral",
      },
    });
  }

  const transcript = buildTranscript(rows);

  const openaiResp = await requestSummary(config.openaiApiKey, transcript);

  if (!openaiResp) {
    return json(502, { error: "summary_unavailable" });
  }

  if (!openaiResp.ok) {
    console.error("summarize-thread OpenAI request failed", {
      status: openaiResp.status,
      statusText: openaiResp.statusText,
    });
    return json(502, { error: "summary_unavailable" });
  }

  const completion = await openaiResp.json();
  const result = parseSummary(completion?.choices?.[0]?.message?.content);

  if (!result) {
    console.error("summarize-thread OpenAI response was empty");
    return json(502, { error: "summary_unavailable" });
  }

  return json(200, {
    thread_id: threadId,
    message_count: rows.length,
    result,
  });
});
