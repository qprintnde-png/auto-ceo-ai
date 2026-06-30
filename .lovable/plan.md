# Full Database Restore from `db_cluster-28-09-2025@07-16-50.backup.gz`

## Important: this cannot be executed by Lovable

The upload is a Supabase **cluster-level `pg_dumpall`** containing `CREATE ROLE`, `ALTER SYSTEM`, auth schema, storage schema, and full data. Restoring it requires:

- **Superuser / `postgres` role access** — Lovable's migration tool runs as a restricted role and will reject `CREATE ROLE`, `ALTER SYSTEM`, grants on `auth.*`, etc.
- **An empty target database** — restoring over the current DB will collide on every existing object (roles already exist, `public.profiles` already exists, RLS policies conflict).
- **Matching JWT secret** — auth users carry hashed passwords tied to the old project's JWT secret. Without copying that secret too, nobody can log in after restore.

Because of this, the only safe path is for **you** to run the restore against a **fresh Supabase project**, then point Lovable at it.

---

## Recommended path: restore into a new Supabase project, then re-link

### Step 1 — Create a new empty Supabase project
- supabase.com → New Project. Pick the same region as your old one. Save the DB password.

### Step 2 — Copy the JWT secret from the OLD project (so user passwords keep working)
- Old project → Settings → API → **JWT Secret** → copy.
- New project → Settings → API → **JWT Secret** → paste & save. Restart the project.
- Skip this step only if you're OK with all users being forced to reset their passwords.

### Step 3 — Restore the dump
On your local machine (needs `psql` ≥ 15):

```bash
gunzip -k db_cluster-28-09-2025@07-16-50.backup.gz

# Connection string from: New project → Settings → Database → Connection string → URI (session pooler / direct)
export NEW_DB="postgresql://postgres:[PASSWORD]@db.[NEW-REF].supabase.co:5432/postgres"

psql "$NEW_DB" -v ON_ERROR_STOP=1 -f db_cluster-28-09-2025@07-16-50.backup
```

Expect a few benign warnings (`role "supabase_admin" already exists`, extension already installed). Hard errors mean stop and review.

### Step 4 — Re-link Lovable to the new project
- In Lovable: disconnect the current Cloud/Supabase connection.
- Reconnect, selecting the **new** project ref.
- Lovable regenerates `src/integrations/supabase/client.ts` and `types.ts` against the restored schema.

### Step 5 — Verify
- Sign in with an old user (works only if Step 2 was done).
- Check `profiles`, `companies`, `business_plans`, `tasks`, `cached_sections` row counts match the old project.
- Re-deploy edge functions (they live in this repo, not in the DB) and re-add any secrets (`LOVABLE_API_KEY`, `ANTHROPIC_API_KEY`, `GROK_API_KEY`, `PERPLEXITY_API_KEY`).

---

## What Lovable WILL do for you (after you confirm)

1. **Analyze the dump locally** and produce a report: schemas, tables, row counts, extensions, and a diff vs. the current project's schema — so you know what you're about to overwrite.
2. **Generate a tailored restore script** with the exact `psql` commands and the post-restore checklist above, pre-filled.
3. **After you re-link** the new project, regenerate the Supabase TypeScript types and smoke-test the app against the restored data.

## What Lovable will NOT do

- Run `pg_restore` / cluster-level SQL against the current project (no superuser, would break the live app).
- Wipe the current database from inside chat.
- Copy the JWT secret for you (only visible to project owners in Supabase dashboard).

---

## Alternative if you don't want a new project

Tell me instead and I'll switch to **"Extract schema + data and merge into current DB"**:
- I parse the dump, list every table and row, and you pick which tables/rows to import.
- I write proper migrations for missing tables and use the insert tool for data.
- Slower, but no new Supabase project required and no risk to your current auth users.

---

## Confirm to proceed

Reply with either:
- **"Generate the analysis + restore script"** — I'll produce the report and the ready-to-run `psql` commands.
- **"Switch to merge mode"** — I'll plan a non-destructive table-by-table import into the current DB instead.
