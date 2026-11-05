# Community moderation operations

Owner: Austin Humphrey. This identifies the product owner; it does not establish staffed hours or prove that anyone has read an inbox. Before resubmission, the owner must verify access to the inbox and take responsibility for reviewing reports and contact messages within 24 hours. No email delivery or push-alert system is represented as deployed.

## What is enforced

- Existing text-filter triggers use the deployed `banned_terms` table. New terms can be maintained by the project administrator. This is a limited text filter, not a claim that every harmful expression can be recognized automatically.
- New Field Notes are held pending. New discussion images are pending and cannot be listed or signed by ordinary clients until a moderator approves them. The public discussion text still posts after server filtering.
- All reports appear in `private.community_report_queue` from the first report. The existing distinct-reporter thresholds remain an additional rapid-hide mechanism.
- Every ten minutes, `enforce_community_report_deadlines` quarantines open reports aged 22 hours. The target is hidden even if its author has been deleted. A current author is also reversibly restricted from community participation and their public community content is hidden. Existing JWTs are checked against the restriction on every request.
- The two-hour margin covers the existing one-hour signed-image URL lifetime plus scheduling time. Previously cached/downloaded images cannot be recalled.
- A deadline quarantine is not a finding of misconduct. A moderator's confirmed violation removes the target and ejects the contributor from community participation. Dismissing the final open report lifts only a temporary quarantine; it never reverses an ejection. User accounts and records are not deleted.
- Contact messages, including optional reply addresses, are private. Anonymous contribution sessions can contact the developer without posting or accepting the media terms. Exact retries within ten minutes return the same receipt; five distinct messages per session per hour are accepted. Contact remains available to restricted contributors for appeals.
- Finalized media paths are immutable, including writes made by the Storage service for signed uploads. A private path-digest ledger remains after content/account cleanup; normal Storage API garbage collection can still delete objects. Timestamp-only bookkeeping is allowed. New uploads must use fresh UUID paths with `upsert=false`.
- Deleting a report or its parent reconciles temporary quarantine without reversing confirmed ejection. Restricted contributors cannot create new reports. Account deletion removes the sender link from both private contacts and contact-review audit events.

## Operator access and daily workflow

Use the authenticated Supabase project dashboard for project `cloeoulvrrfcbitrjpso` or server-side service-role tooling. Never place a service-role credential in the app/browser. The app's publishable key cannot read these queues or perform moderation.

1. Read every open report, oldest first, plus pending images/Field Notes and private contacts. Check at least often enough to act within 24 hours; the 22-hour quarantine is a safety backstop, not a substitute for a decision.
2. Inspect the report and its source content using admin access. For images, use Storage in the dashboard or a server-side short-lived signed URL; do not publish the image to inspect it.
3. For a violation, call the service-only moderation RPC with an explicit reason. For a false report, dismiss it. A moderator must evaluate evidence; report counts never justify a permanent ejection by themselves.
4. Review pending media before publishing. Reject objectionable images; never approve material from a restricted contributor. Field Note review remains an administrator action setting visibility only after review.
5. Read contact messages and use their optional reply address only when an actual reply is sent by the owner. Mark a contact reviewed/closed only after the corresponding action. The RPC records a decision, not delivery.

```sql
select * from private.community_report_queue order by created_at;
select id,post_id,owner_id,storage_path,created_at
from public.discussion_media where moderation_state='pending' order by created_at;
select id,pitch_slug,author_id,tweak,note,created_at
from public.field_notes where visibility='pending' order by created_at;
select id,sender_id,message,reply_email,created_at
from private.safety_contacts where status='open' order by created_at;

-- Replace placeholders with the reviewed record, decision and evidence.
select public.moderate_community_report('discussion', '<report-uuid>', 'actioned', '<specific reason of at least 10 characters>');
select public.moderate_community_report('note', '<report-uuid>', 'dismissed', '<specific reason of at least 10 characters>');
select public.review_community_media('<media-uuid>', true, '<specific approval reason>');
select public.review_safety_contact('<contact-uuid>', 'reviewed', '<specific action actually taken>');
```

## Scheduler health and escalation

Deployment fails if `pg_cron` is absent. Verify the named job is active and its last scheduled run succeeded. A stale run (over 20 minutes), any overdue open contact, or an unreviewed quarantine requires the owner to inspect the backlog immediately. The durable run table and PostgreSQL notification expose counts only; no external notification subscriber is assumed.

```sql
select jobid,jobname,schedule,active from cron.job
where jobname='pitch-atlas-community-review-deadlines';
select status,start_time,end_time,return_message from cron.job_run_details
where jobid=(select jobid from cron.job where jobname='pitch-atlas-community-review-deadlines')
order by start_time desc limit 5;
select * from private.community_moderation_runs order by ran_at desc limit 5;
select count(*) as overdue_contacts from private.safety_contacts
where status='open' and created_at <= now()-interval '22 hours';
```

If the scheduler is down, an administrator can run `select public.enforce_community_report_deadlines();` and investigate the job. This does not replace reviewing the resulting quarantines. Do not assert that human review is staffed or that messages are emailed without separate evidence.

## Validation and limitations

`supabase/tests/community-moderation.sql` uses generated fixture identities and a rollback transaction. Hosted execution requires the preflight to find no preexisting due reports and serializes report writes during its short transaction; otherwise use an isolated database. It checks the first-report queue, valid/private/idempotent/rate-limited contact, denied client image approval, prepublication object reads, deadline quarantine, existing-session write denial, false-report reversal, confirmed ejection, and cascading removal when a generated fixture account is deleted. The current production author columns are NOT NULL; content quarantine also protects targets independently of the author restriction.

This change does not create a way to prevent a determined person from making a new anonymous identity. It blocks the reported contributor's existing identity and tokens, preserves evidence and appeal contact, and does not falsely classify a new identity automatically. Human operational coverage must still be confirmed before claiming complete App Review compliance.

### November 5 deployment evidence

Production migration versions are `20261105041518` and `20261105054452`. The full hosted rollback acceptance passed after the second migration, with no fixture pitch or banned-term rows retained. The scheduler was active and its 05:40 UTC execution succeeded. These are point-in-time results, not a promise of future delivery or review.

The local concurrency suite passed all six moderation/deletion cases and both media finalization/replacement orders. It also checks reuse denial after trusted local object cleanup. Run `MODERATION_TEST_PORT=55440 python3 supabase/tests/community-moderation-concurrency.py` against an isolated fixture database; the script always connects to localhost and creates/cleans only generated fixtures. Hosted Storage deletion must use its API; the rollback SQL suite does not bypass the hosted direct-delete protection. Storage HTTP upload behavior was inspected in Supabase's upstream implementation, not tested with production file uploads.
