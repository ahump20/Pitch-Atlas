# External content sync

Cloudflare Worker for the reviewed Pitch Atlas social shelf. It polls only explicitly
allowlisted X or YouTube sources, writes canonical post references to Supabase, and
never downloads or proxies third-party media.

## Publication behavior

- A source must be active and use `ingest_method = api`.
- New posts from a non-auto-publish source enter `pending`.
- An auto-publish source still needs a recognized pitch term before a post can
  publish automatically. Untagged posts enter `pending`.
- Instagram and TikTok discovery remains editorial; known public URLs can be filed
  through Supabase Studio or the community suggestion queue.
- The browser always renders the official provider embed or outbound link.

## Secrets

Set `SUPABASE_SERVICE_ROLE_KEY`, then the provider credentials actually in use:
`X_BEARER_TOKEN`, `YOUTUBE_API_KEY`, and `CRON_SECRET`. Do not put them in
`wrangler.toml` or repository settings as plaintext variables.
