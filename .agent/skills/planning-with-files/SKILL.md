---
name: planning-with-files
description: Use this skill for complex, multi-step tasks where context could be lost across tool calls or long sessions. Saves a structured task plan to disk so the agent stays anchored to the goal. Inspired by Manus-style task planning. Use when implementing a full feature, refactoring a module, or fixing a complex bug that requires many steps.
---

# Planning with Files

Save a structured plan to disk to stay anchored across long tasks and many tool calls.

This prevents context drift and provides a clear audit trail of decisions made.

## When to Use

Use this skill when:
- The task involves 5+ steps
- Multiple files will be touched
- The task might span multiple sessions
- You need to track findings before acting

## File Locations

Always write plan files to the **project root** (not temp dirs):

```
.agent/
└── plans/
    ├── task_plan.md    — What we're doing and why
    ├── findings.md     — What we've discovered (read before acting)
    └── progress.md     — Checklist of what's done / in progress / blocked
```

> Create the `.agent/plans/` directory if it doesn't exist yet.

## File Formats

### task_plan.md
```markdown
# Task: [Short Title]

## Goal
[1-2 sentences: what success looks like]

## Approach
[Brief plan: what steps, what order, why]

## Constraints / Risks
- [Known gotchas, things to avoid]

## Files in Scope
- `path/to/file.ts` — reason
- `path/to/other.ts` — reason
```

### findings.md
```markdown
# Findings

## [Area/File name]
- [What you learned about the current implementation]
- [Gotchas discovered]

## Decisions Made
- [Decision]: [Reason]
```

### progress.md
```markdown
# Progress

## Status: IN PROGRESS / BLOCKED / DONE

## Checklist
- [x] Step 1: Done
- [/] Step 2: In progress
- [ ] Step 3: Not started
- [!] Step 4: BLOCKED — reason

## Blockers
- [Any blockers and what's needed to unblock]
```

## Workflow

```
1. CREATE task_plan.md — before touching any code
2. READ existing code → write findings.md
3. CREATE progress.md checklist
4. Execute steps, updating progress.md after each
5. When blocked: write blocker to progress.md, surface to user
6. When done: mark progress.md as DONE, summarize changes
```

## Rules

- **Always read plan files at the start of each session** before taking any action
- **Update progress.md after every meaningful step** — not just at the end
- **Write findings BEFORE conclusions** — don't assume, investigate first
- **Never delete plan files** during the task (they're the single source of truth)
- Clean up plan files only after the user confirms they're no longer needed
