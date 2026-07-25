---
name: example
description: Starter skill template — placeholder used as a worked example for this repo. Replace or delete.
when_to_use: Replace this file with a real skill, or delete the whole `.puku/skills/example/` directory once you have one real skill to ship.
---

# example

This is a **starter skill** showing the minimum viable shape for a Puku skill in this repo. It exists only so the team can copy-paste it as a starting point. **Replace or delete it before shipping.**

## When to use

Use this as a template — not as a real capability. Triggers should be specific enough that an LLM can match them reliably; descriptions should not duplicate the `name`.

## Minimal body

A skill's body should hold domain knowledge the LLM needs but cannot infer from the codebase alone:

1. **Decision rules** — "do X when Y" constraints.
2. **Exact code patterns** — copy-pasteable snippets that must look a certain way.
3. **Pitfalls** — what to never do, with the *why*.

Keep it short. Long reference material belongs in `docs/` and is loaded on demand via `@docs/path.md`.

## See also

- `docs/features/SKILLS.md` — full skill authoring guide (frontmatter schema, trigger-writing tips, when to use a skill vs. a doc reference).