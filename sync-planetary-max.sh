#!/usr/bin/env bash
set -euo pipefail

# Configuration
REPO_URL="https://github.com/max-institute/Planetary-max-.git"
BRANCH="main"
COMMIT_MSG="feat(portal-os1): compile MAX-FORCE intent aspects & sync BEEMAX edge telemetry"

echo ">>> [1/5] Verifying Git repository state..."
if [ ! -d ".git" ]; then
  git init
  git remote add origin "$REPO_URL"
fi

# Ensure remote matches max-institute/Planetary-max-
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ "$CURRENT_REMOTE" != "$REPO_URL" ]; then
  git remote remove origin 2>/dev/null || true
  git remote add origin "$REPO_URL"
fi

echo ">>> [2/5] Staging Portal-OS1 aspects, runtime configs, and worker scripts..."
git add src/aspects/ src/agents/ src/runtime/ wrangler.toml package.json 2>/dev/null || git add -A

# Abort cleanly if there are no changes to commit
if git diff --cached --quiet; then
  echo ">>> No uncommitted changes detected in MAX-SPACE buffer. Repository is already in sync."
  exit 0
fi

echo ">>> [3/5] Committing snapshot to local cryptographic ledger..."
git commit -m "$COMMIT_MSG"

echo ">>> [4/5] Pulling & rebasing upstream changes from $BRANCH..."
git pull --rebase origin "$BRANCH" || true

echo ">>> [5/5] Pushing changes to max-institute/Planetary-max- ($BRANCH)..."
git push -u origin "$BRANCH"

echo ">>> Sync complete. Portal-OS1 state is now locked on GitHub."
