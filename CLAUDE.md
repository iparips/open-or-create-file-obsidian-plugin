## References for LLMs

- When generating code, follow rules in @docs/spec/0-rules/maintainability-rules.md
- When writing tests, follow rules in @docs/spec/0-rules/unit-test-rules.md
- Read the system architecture overview in @docs/spec/2-design/1-open-or-create-architecture-overview.md
- To run tests use `bun run test`
- Always use Australian English
- Never use Markdown bold formatting in generated text.

## Specification-Driven Development Workflow

This project uses SDD. When implementing features:

1. Start with the spec - Read the requirement from @docs/spec/1-requirements/[feature].md
2. Create a design - Before coding, create @docs/spec/2-design/[feature].md with:
   - Technical approach
   - Architecture decisions
   - Data models
   - Present this for approval before proceeding
3. Break down into tasks - Create @docs/spec/3-tasks/[feature].md with:
   - Numbered checklist of implementation steps
   - Each task should be small and reviewable
4. Use TodoWrite - Track progress in-session as you work through tasks
5. Implement - Follow the design and task breakdown
6. Test - Ensure tests follow unit test rules
7. Update @docs/spec/1-requirements/index.md - mark feature complete

Never start coding without a requirement spec. If one doesn't exist, create it first and get approval.
