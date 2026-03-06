---
name: github-pr-review
description: Review a GitHub pull request professionally and thoroughly using the gh CLI. Use when the user asks to review a PR, check a pull request, or audit changes before merging. Produces structured feedback with categorized comments (critical, suggested, nitpick).
---

# GitHub PR Review

Review pull requests in a structured, professional, and safe way using the `gh` CLI.

## Prerequisites

Ensure `gh` is authenticated:
```bash
gh auth status
```

## Review Workflow

### 1. Fetch the PR

```bash
# List open PRs
gh pr list

# View a specific PR (replace 42 with PR number)
gh pr view 42

# Check out the branch to inspect code locally
gh pr checkout 42
```

### 2. Get the Diff

```bash
# Full diff
gh pr diff 42

# Files changed
gh pr view 42 --json files --jq '.files[].path'
```

### 3. Read the Code

For each changed file:
- Read the diff carefully
- Check for correctness, security, and style issues
- Compare against project conventions in `CLAUDE.md`

### 4. Structured Review Output

Organize feedback into three categories:

```markdown
## PR Review: [PR Title] (#42)

### Critical (must fix before merging)
- `path/to/file.ts:42` — Supabase `service_role` key exposed in frontend environment file.
  This should NEVER be in frontend code; only `anon` key is allowed.

### Suggested (should fix, improves quality)
- `backend/src/services/room.service.ts:15` — Error from Supabase is swallowed.
  Throw it or return an appropriate error response.

### Nitpick (minor style/convention)
- `frontend/src/app/features/rooms/room-list.component.ts:8` — Use `inject()` instead of constructor injection per project conventions.

### Looks Good
- Auth middleware correctly applied to all POST/PUT/DELETE routes
- Test coverage added for the new service method
- Commit messages follow `feat(scope): description` convention
```

### 5. Post the Review

```bash
# Post a review comment (approve, request-changes, or comment)
gh pr review 42 --comment --body "..."
gh pr review 42 --request-changes --body "..."
gh pr review 42 --approve --body "LGTM"
```

## Project-Specific Review Checklist

Go through each PR with this checklist:

**Security**
- [ ] No secrets or keys in frontend code
- [ ] Auth middleware applied to protected routes
- [ ] RLS policies exist for any new Supabase table

**Architecture**
- [ ] Backend follows Route → Controller → Service pattern; no Supabase calls in controllers
- [ ] Angular components are standalone; no NgModules introduced
- [ ] No business logic in Angular templates

**Quality**
- [ ] Tests added for new behavior
- [ ] ESLint passes (`npm run lint`)
- [ ] TypeScript strict mode satisfied (no `any` without justification)

**Conventions**
- [ ] Commit messages follow `type(scope): subject` format
- [ ] New files/directories follow existing naming conventions
- [ ] JSDoc comments on public service methods (backend)

## Safety Rules

- **Never approve** a PR that exposes secrets, bypasses auth, or removes RLS
- **Always check** that the PR branch is up to date with `main` before approving
- **Flag** any migration that drops columns or tables as high-risk
