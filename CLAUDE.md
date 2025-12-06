## References for LLMs

- When generating code, follow rules in @docs/sdd/0-rules/maintainability-rules.md
- When writing tests, follow rules in @docs/sdd/0-rules/unit-test-rules.md
- To run tests use `bun run test`

## Specification-Driven Development Workflow

This project uses SDD. When implementing features:

1. Start with the spec - Read the requirement from @docs/sdd/1-requirements/[feature].md
2. Create a design - Before coding, create @docs/sdd/2-design/[feature].md with:
   - Technical approach
   - Architecture decisions
   - Data models
   - Present this for approval before proceeding
3. Break down into tasks - Create @docs/sdd/3-tasks/[feature].md with:
   - Numbered checklist of implementation steps
   - Each task should be small and reviewable
4. Use TodoWrite - Track progress in-session as you work through tasks
5. Implement - Follow the design and task breakdown
6. Test - Ensure tests follow unit test rules
7. Update @docs/sdd/1-requirements/index.md - mark feature complete

Never start coding without a requirement spec. If one doesn't exist, create it first and get approval.
