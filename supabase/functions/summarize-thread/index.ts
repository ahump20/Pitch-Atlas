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

type BodyReadResult = {
  body: Record<string, unknown> | null;
  tooLarge: boolean;
  invalidJson: boolean;
};

const allowedMethods = "POST, OPTIONS";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": allowedMethods,
  "Access-Control-Max-Age": "86400",
  "Vary": "Authorization, Origin",
};

const allowHeaders = {
  "Allow": allowedMethods,
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
  "Pragma": "no-cache",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Connection": "keep-alive",
};

const MAX_MESSAGES = 200;
const MAX_TRANSCRIPT_CHARS = 12000;
const MAX_BODY_BYTES = 4096;
const OPENAI_TIMEOUT_MS = 15000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function meta(): SummaryMeta {
  return {
    source: "pitch-atlas-summarize-thread",
    fetched_at: new Date().toISOString(),
    timezone: "America/Chicago",
  };
}

function json(status: number, body: JsonBody, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ ...body, meta: body.meta ?? meta() }), {
    status,
    headers: { ...jsonHeaders, ...extraHeaders },
  });
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

async function readBody(req: Request): Promise<BodyReadResult> {
  try {
    if (!req.body) {
      return { body: null, tooLarge: false, invalidJson: false };
    }

    const reader = req.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      if (!value) {
        continue;
      }

      receivedBytes += value.byteLength;
      if (receivedBytes > MAX_BODY_BYTES) {
        try {
          await reader.cancel();
        } catch (error) {
          console.error("summarize-thread body reader cancel failed", error);
        }
        return { body: null, tooLarge: true, invalidJson: false };
      }

      chunks.push(value);
    }

    const bytes = new Uint8Array(receivedBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const text = new TextDecoder().decode(bytes);
    if (!text.trim()) {
      return { body: null, tooLarge: false, invalidJson: false };
    }

    try {
      const body = JSON.parse(text);
      return {
        body: body && typeof body === "object" ? body as Record<string, unknown> : null,
        tooLarge: false,
        invalidJson: false,
      };
    } catch {
      return { body: null, tooLarge: false, invalidJson: true };
    }
  } catch {
    return { body: null, tooLarge: false, invalidJson: false };
  }
}

function threadIdFromBody(body: Record<string, unknown> | null): { threadId: string } | { error: string } {
  const raw = body?.thread_id;
  if (typeof raw !== "string") {
    return { error: "thread_id_required" };
  }

  const threadId = raw.trim();
  if (!threadId) {
    return { error: "thread_id_required" };
  }

  if (!UUID_PATTERN.test(threadId)) {
    return { error: "invalid_thread_id" };
  }

  return { threadId };
}

function senderLabel(senderId: string | null, labels: Map<string, string>): string {
  const key = senderId?.trim();
  if (!key) {
    return "Unknown participant";
  }

  const existing = labels.get(key);
  if (existing) {
    return existing;
  }

  const label = `Participant ${labels.size + 1}`;
  labels.set(key, label);
  return label;
}

function buildTranscript(messages: MessageRow[]): string {
  const senderLabels = new Map<string, string>();
  const transcript = messages
    .map((message) => {
      const timestamp = message.created_at ?? "unknown-time";
      const sender = senderLabel(message.sender_id, senderLabels);
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

async function readCompletion(response: Response): Promise<Record<string, unknown> | null> {
  try {
    const completion = await response.json();
    return completion && typeof completion === "object" ? completion as Record<string, unknown> : null;
  } catch (error) {
    console.error("summarize-thread OpenAI response JSON parse failed", error);
    return null;
  }
}

function completionMessageContent(completion: Record<string, unknown> | null): unknown {
  const choices = completion?.choices;
  if (!Array.isArray(choices)) {
    return null;
  }

  const firstChoice = choices[0];
  if (!firstChoice || typeof firstChoice !== "object") {
    return null;
  }

  const message = (firstChoice as Record<string, unknown>).message;
  if (!message || typeof message !== "object") {
    return null;
  }

  return (message as Record<string, unknown>).content;
}

async function requestSummary(openaiApiKey: string, transcript: string): Promise<Response | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    return await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
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
  } finally {
    clearTimeout(timeoutId);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { ...corsHeaders, ...allowHeaders } });
  }

  if (req.method !== "POST") {
    return json(405, { error: "method_not_allowed" }, allowHeaders);
  }

  const token = bearerToken(req);
  if (!token) {
    return json(401, { error: "missing_bearer_token" });
  }

  if (requestBodyTooLarge(req)) {
    return json(413, { error: "request_too_large" });
  }

  const bodyResult = await readBody(req);
  if (bodyResult.tooLarge) {
    return json(413, { error: "request_too_large" });
  }
  if (bodyResult.invalidJson) {
    return json(400, { error: "invalid_json" });
  }

  const body = bodyResult.body;
  const threadIdResult = threadIdFromBody(body);
  if ("error" in threadIdResult) {
    return json(400, { error: threadIdResult.error });
  }
  const { threadId } = threadIdResult;

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

  const completion = await readCompletion(openaiResp);
  const result = parseSummary(completionMessageContent(completion));

  if (!result) {
    console.error("summarize-thread OpenAI response was empty or malformed");
    return json(502, { error: "summary_unavailable" });
  }

  return json(200, {
    thread_id: threadId,
    message_count: rows.length,
    result,
  });
});
