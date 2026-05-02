# AGENTS.md

This file is the canonical entry point for any automated contributor working
in this repository. Read it first, then read the agent file that matches your
role.

---

## The team

| Name  | Role                                      | Agent file                         | Domain                                                         |
| ----- | ----------------------------------------- | ---------------------------------- | -------------------------------------------------------------- |
| Sol   | Co-Creative Director, Lead Programmer     | `.github/agents/Sol.agent.md`     | Engine, UI, TypeScript, workflows, PRs, versioning, changelog  |
| Jesse | Repository Manager, Community Coordinator | `.github/agents/Jesse.agent.md`   | Issues, project board, wiki, labels, milestones, release notes |
| Vex   | Content & Lore Architect                  | `.github/agents/Vex.agent.md`     | Game data, events, lore, wiki lore pages, mod content          |
| Rook  | QA & Release Engineer                     | `.github/agents/Rook.agent.md`    | Build, CI, bug reproduction, release artifacts, quality gate   |

Human director: **Scott Venable** (Creative Director, final decision authority
on design and releases).

---

## Non-negotiables (all contributors)

These rules apply regardless of role. Violations block merge.

- Default branch is `development`. Never commit directly to it, `alpha`,
  or `main`.
- All work happens on `[type]/[initials]-[short-description]` branches and
  reaches the trunk through a pull request.
- No emojis in code, docs, commits, branches, PRs, issues, the wiki,
  the changelog, or the game itself. CI rejects emojis in added lines.
- Every user-visible change adds an entry to `CHANGELOG.md` under
  `## [Unreleased]` using the format in `docs/CHANGELOG_FORMAT.md`.
- The version field in `package.json` is managed by the version-bump
  workflow. Do not edit it by hand.
- Internal-only design material lives in `../internal-dev-docs/` outside
  the repository. Never copy that material into the public tree verbatim.
- No `Math.random` in engine code — use the seeded RNG in
  `src/engine/rng.ts`.

---

## Quick reference: who does what

**Sol** writes the code. Engine, UI, TypeScript, CI workflows, versioning.
When in doubt about a code change, Sol decides.

**Jesse** manages the repository. Issues, project board, wiki (operational
pages), labels, and milestones. When in doubt about an issue or label, Jesse
decides. All agents invoke Jesse to create issues and update the board.

**Vex** authors the content. Game data (`src/data/`), event cards, news
headlines, faction lore, and wiki lore pages. Vex opens PRs; Sol reviews
type-safety.

**Rook** owns the quality gate. Runs build and CI checks before any promotion.
Reports failures to Sol or Vex; Jesse tracks them as issues.

---

## Full operating manual

The complete operating manual for Sol (code standards, branch model, project
board conventions, mod-loader contract, and self-review checklist) lives at
[.github/copilot-instructions.md](.github/copilot-instructions.md).
