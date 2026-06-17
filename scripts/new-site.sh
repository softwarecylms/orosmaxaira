#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# new-site.sh — provision a whole informational site in one run.
#
# Creates, for a freshly-scaffolded site (run this from INSIDE the project dir):
#   1. a Neon Postgres project           → pooled connection string
#   2. a GitHub repo (private)           → pushes your local code
#   3. invites your team as collaborators (Write access)
#   4. a Vercel project wired to the repo + env vars  → first production deploy
#   5. a local .env so the project runs immediately
#
# ---------------------------------------------------------------------------
# ONE-TIME SETUP (install + log in once — the script can't do this for you):
#   brew install gh jq                      # GitHub CLI + jq
#   npm  i -g vercel neonctl                # Vercel + Neon CLIs
#   gh auth login                           # GitHub  (or: export GH_TOKEN=...)
#   vercel login                            # Vercel  (or: export VERCEL_TOKEN=...)
#   neonctl auth                            # Neon    (or: export NEON_API_KEY=...)
#   # In the Vercel dashboard, install the Vercel GitHub app on your account/org
#   # once, so Vercel is allowed to connect to your repos.
#
# ---------------------------------------------------------------------------
# USAGE:
#   PROJECT=acmecorp COLLABORATORS="alice,bob" ./scripts/new-site.sh
#
#   # review everything first WITHOUT creating anything:
#   DRY_RUN=1 PROJECT=acmecorp COLLABORATORS="alice,bob" ./scripts/new-site.sh
#
# CONFIG (env vars):
#   PROJECT        required  slug for repo + Neon + Vercel (e.g. acmecorp)
#   COLLABORATORS  optional  comma-separated GitHub usernames to invite
#   GH_OWNER       optional  your account/org (default: your gh login)
#   VISIBILITY     optional  private | public          (default: private)
#   DRY_RUN        optional  1 = print commands, create nothing
# ============================================================================

PROJECT="${PROJECT:?set PROJECT=<slug>, e.g. PROJECT=acmecorp}"
VISIBILITY="${VISIBILITY:-private}"
COLLABORATORS="${COLLABORATORS:-}"
DRY_RUN="${DRY_RUN:-0}"

say()  { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
run()  { printf '  + %s\n' "$*"; [ "$DRY_RUN" = "1" ] || "$@"; }

# --- 0. preflight: required CLIs present? -----------------------------------
say "Checking tools"
for bin in git gh vercel neonctl jq openssl; do
  command -v "$bin" >/dev/null 2>&1 || { echo "Missing '$bin' — see ONE-TIME SETUP at the top."; exit 1; }
done
GH_OWNER="${GH_OWNER:-$(gh api user -q .login)}"
echo "  owner=$GH_OWNER  project=$PROJECT  visibility=$VISIBILITY  dry_run=$DRY_RUN"

# --- 1. secrets -------------------------------------------------------------
say "Generating secrets"
PAYLOAD_SECRET="$(openssl rand -base64 32)"
REVALIDATION_SECRET="$(openssl rand -base64 32)"
SERVER_URL="https://${PROJECT}.vercel.app"   # update later if you add a custom domain

# --- 2. Neon Postgres -------------------------------------------------------
say "Creating Neon project"
if [ "$DRY_RUN" = "1" ]; then
  NEON_ID="dry-neon-id"
  DATABASE_URI="postgres://USER:PASS@ep-dry-pooler.neon.tech/neondb?sslmode=require"
  echo "  + neonctl projects create --name $PROJECT (skipped: dry run)"
else
  NEON_JSON="$(neonctl projects create --name "$PROJECT" --output json)"
  NEON_ID="$(echo "$NEON_JSON" | jq -r '.project.id')"
  # pooled connection string = safe for Vercel serverless (won't exhaust connections)
  DATABASE_URI="$(neonctl connection-string --project-id "$NEON_ID" --pooled)"
  echo "  neon project id = $NEON_ID"
fi

# --- 3. local .env (so the site runs locally right away) --------------------
say "Writing local .env"
if [ "$DRY_RUN" = "1" ]; then
  echo "  + write .env with DATABASE_URI / PAYLOAD_SECRET / ... (skipped: dry run)"
else
  cat > .env <<EOF
NEXT_PUBLIC_SERVER_URL=$SERVER_URL
PAYLOAD_SECRET=$PAYLOAD_SECRET
DATABASE_URI=$DATABASE_URI
REVALIDATION_SECRET=$REVALIDATION_SECRET
# SMTP_* and CONTACT_* — fill these in manually (see .env.example)
EOF
  echo "  wrote .env"
fi

# --- 4. GitHub repo + push --------------------------------------------------
say "Creating GitHub repo and pushing code"
if [ -z "$(git rev-parse --is-inside-work-tree 2>/dev/null || true)" ]; then
  run git init -q
fi
run git add -A
# commit only if there is something staged / no commits yet
if [ "$DRY_RUN" = "1" ] || ! git rev-parse HEAD >/dev/null 2>&1 || ! git diff --cached --quiet; then
  run git commit -q -m "Initial commit: $PROJECT" || true
fi
run gh repo create "$GH_OWNER/$PROJECT" "--$VISIBILITY" --source=. --remote=origin --push

# --- 5. invite collaborators ------------------------------------------------
if [ -n "$COLLABORATORS" ]; then
  say "Inviting collaborators (Write access)"
  IFS=',' read -ra USERS <<< "$COLLABORATORS"
  for u in "${USERS[@]}"; do
    u="$(echo "$u" | xargs)"   # trim
    [ -z "$u" ] && continue
    run gh api --method PUT "/repos/$GH_OWNER/$PROJECT/collaborators/$u" -f permission=push
  done
fi

# --- 6. Vercel project + env + deploy ---------------------------------------
say "Creating Vercel project and wiring it to the repo"
run vercel link --yes --project "$PROJECT"
run vercel git connect "https://github.com/$GH_OWNER/$PROJECT" --yes

set_env() {  # set_env NAME VALUE  → sets it for production, preview, development
  local name="$1" value="$2" env
  for env in production preview development; do
    if [ "$DRY_RUN" = "1" ]; then
      printf '  + echo *** | vercel env add %s %s\n' "$name" "$env"
    else
      printf '%s' "$value" | vercel env add "$name" "$env" >/dev/null 2>&1 \
        || echo "    (env $name/$env may already exist — skipped)"
    fi
  done
}
say "Setting Vercel environment variables"
set_env NEXT_PUBLIC_SERVER_URL "$SERVER_URL"
set_env PAYLOAD_SECRET         "$PAYLOAD_SECRET"
set_env DATABASE_URI           "$DATABASE_URI"
set_env REVALIDATION_SECRET    "$REVALIDATION_SECRET"

say "Deploying to production"
run vercel deploy --prod --yes

# --- done -------------------------------------------------------------------
cat <<EOF

✅ Done — '$PROJECT' is provisioned.

  Repo     : https://github.com/$GH_OWNER/$PROJECT
  Vercel   : $SERVER_URL   (admin: $SERVER_URL/admin)
  Neon     : project '$PROJECT' (id ${NEON_ID})
  Local    : .env written — run \`pnpm install && pnpm migrate && pnpm seed && pnpm dev\`

Still manual (on purpose):
  • Add SMTP_* / CONTACT_* env vars (contact form)  → Vercel dashboard or set_env above
  • Rotate the seeded Payload admin password, create real editor accounts
  • Point your custom domain at the Vercel project and update NEXT_PUBLIC_SERVER_URL
EOF
