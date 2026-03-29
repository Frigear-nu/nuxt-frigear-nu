#!/usr/bin/env bash
# =============================================================================
# rewrite-history-remove-large-files.sh
#
# Rewrites the entire git history to strip large binary blobs (videos and
# unoptimised images) that were accidentally committed. After running this
# script every collaborator MUST re-clone the repository because all commit
# SHAs change.
#
# Prerequisites
#   • Git LFS set up (this PR adds the .gitattributes – merge it first!)
#   • pip install git-filter-repo   (or: brew install git-filter-repo)
#   • A FRESH CLONE of the repository (git-filter-repo refuses to run on
#     repos that still point at a remote to protect against accidental pushes)
#
# Usage (run from the repository root):
#   git clone <repo-url> clean-clone && cd clean-clone
#   bash scripts/rewrite-history-remove-large-files.sh
#
# What the script does
#   1. Removes all blobs larger than 500 KB from every historical commit.
#      – This strips the raw image data that was stored directly in git.
#      – Git LFS pointers (~136 bytes) are untouched because they are tiny.
#   2. Completely removes public/videos/ from the entire history (those MOV
#      files were never referenced by the site and must not come back).
#
# After running this script
#   1. Verify the repository looks correct:
#        git log --oneline | head -20
#        git show HEAD:public/images/carousels/home/arena-toilet.png | head -3
#        # should print: "version https://git-lfs.github.com/spec/v1"
#   2. Push the LFS objects and the rewritten history:
#        git remote add origin <repo-url>
#        git lfs push --all origin
#        git push --force-with-lease origin --all
#        git push --force-with-lease origin --tags
#   3. Ask every collaborator to re-clone the repository.
#   4. Reclaim local disk space:
#        git gc --aggressive --prune=now
# =============================================================================

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# Require a clean working tree
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: Working tree is not clean. Commit or stash your changes first." >&2
  exit 1
fi

# Check that git-filter-repo is available
if ! command -v git-filter-repo &>/dev/null; then
  echo "ERROR: git-filter-repo not found. Install it with: pip install git-filter-repo" >&2
  exit 1
fi

# Warn if .gitattributes is missing (LFS setup not in place yet)
if [ ! -f ".gitattributes" ]; then
  echo "WARNING: .gitattributes not found – make sure the LFS setup PR is merged" >&2
  echo "         before running this script, otherwise image files will be lost." >&2
  read -r -p "Continue anyway? [y/N] " reply
  [[ "$reply" =~ ^[Yy]$ ]] || exit 1
fi

echo "==> Current repository size:"
git count-objects -vH | grep size-pack

echo ""
echo "==> Removing large files from git history…"
echo "    • Stripping all raw blobs > 500 KB (images become LFS pointers)"
echo "    • Fully removing public/videos/ tree from all commits"

git filter-repo --force \
  --strip-blobs-bigger-than 500K \
  --invert-paths --path public/videos/

echo ""
echo "==> Repository size after rewrite:"
git count-objects -vH | grep size-pack

echo ""
echo "==> History rewrite complete."
echo ""
echo "IMPORTANT – next steps:"
echo "  1. Add back the remote:"
echo "       git remote add origin <your-repo-url>"
echo "  2. Push LFS objects then the rewritten history:"
echo "       git lfs push --all origin"
echo "       git push --force-with-lease origin --all"
echo "       git push --force-with-lease origin --tags"
echo "  3. Tell ALL collaborators to re-clone (old SHAs are gone)."
echo "  4. Run 'git gc --aggressive --prune=now' to reclaim local disk space."
