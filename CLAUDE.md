# Open or Create File - Obsidian Plugin

## Commands

- Test: `bun run test`
- Build: `bun run build` (lints, formats, bundles to main.js at repo root)
- Version bump: `bun run version:patch` (also updates manifest.json and versions.json)

## Constraints

- @codemirror/state and @codemirror/view must stay pinned to the exact versions
  obsidian lists as peerDependencies. Don't let `bun update --latest` bump them.
- typescript must stay on 6.x until typescript-eslint supports TS 7.
- main.js at repo root is a build artefact; never edit it.

## Docs

- Architecture overview: docs/spec/1-architecture/README.md
- Specs live under docs/spec/ (not spec/), numbered 0-rules through 4-tasks.
