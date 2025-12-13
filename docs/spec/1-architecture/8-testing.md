# Testing Architecture

## Test Support (`src/test-support/`)

- `__mocks__/obsidian.ts`: Mock Obsidian API for unit tests
- `builders.ts`: Test data builders (CommandConfigBuilder, SettingsBuilder)

## Test Organisation

Tests organised by responsibility, colocated with source code in `__tests__/` directories:

**Command layer:**

- `command/open-or-create/__tests__/`: Path building, time shift parsing, candidate finding

**Notes layer:**

- `notes/__tests__/`: Note creation and Obsidian adapter

**Settings layer:**

- `settings/common/__tests__/`: Settings initialization, validation rules, parseSettings
- `settings/common/hooks/__tests__/`: useSettings hook (state management, event handling)
- `settings/common/components/__tests__/`:
  - `SettingsComponent.test.tsx`: Component wiring smoke test
  - `ActionsHeader.test.tsx`: Import/export functionality
- `settings/open-or-create/components/__tests__/`:
  - `OpenOrCreateSettings.test.tsx`: Add/update/delete command operations

## Test Strategy

**Component tests** verify:

- User interactions (button clicks, input changes)
- Correct props passed to child components
- Callbacks invoked with expected data

**Hook tests** verify:

- State management logic
- Event subscription/cleanup
- Validation updates

**Unit tests** verify:

- Business logic (path building, validation)
- Edge cases and error handling

## Builder Pattern

Test data created using builder pattern (see `src/test-support/builders.ts`):

- Builders used for **setup** (arrange phase)
- Plain objects used for **assertions** (for clarity)

Example:

```typescript
// Setup: use builder
const settings = aSettings()
  .withCommand(aCommand().withCommandName('Test').build())
  .build()

// Assertion: plain object
expect(result).toEqual({
  commandConfigs: [{ commandName: 'New Name', ... }]
})
```

## Testing Libraries

- Vitest: Test runner (configured in package.json)
- @testing-library/react: React component testing
- happy-dom/jsdom: DOM environment for tests
