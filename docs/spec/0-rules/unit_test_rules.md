# Unit Test Rules

## Branch coverage

- Aim for 100% branch coverage.
- Each branch of code in the method under test should have one test case
- Break up assertions in test cases in such way that only one test case fails when a particular branch of code under test is broken - avoid duplicating assertions.

## Test Naming

- Name tests in format "does X when condition Y"
- Don't start test names with "should" because it's redundant and repetitive

## Test Organisation

- Group tests by execution context using nested `describe` blocks
  - Top level: describe the function/class under test
  - Second level: describe the context/precondition (e.g., "when read is successful", "when validation fails")
  - Third level (if needed): further subdivide complex scenarios
- Use `beforeEach` to set up common test data and spies at the appropriate describe level
- Use `afterEach` to clean up resources like spies
- Start with a test outline that lists all the scenarios before implementation

Example structure:

```typescript
describe('functionName', () => {
	let commonMock: ReturnType<typeof vi.fn>
	let spy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		vi.clearAllMocks()
		commonMock = vi.fn()
		spy = vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		spy.mockRestore()
	})

	describe('when context A', () => {
		beforeEach(() => {
			// Setup specific to this context
		})

		it('does X when condition Y', () => {
			// Test implementation
		})
	})

	describe('when context B', () => {
		// Tests for different context
	})
})
```

## Arrange - Act - Assert test case structure

All test cases should follow the below structure

- Arrange - where input data is arranged
- Act - where class under test is invoked
- Assert - where assertions on the output are made

When a test case is large: multiple concepts / objects are setup in either of the above sections,
Then either group those sections using blank lines

## Mocking

- Use actual class instances for mocks when possible instead of plain objects (e.g., `new ValidationResult([])` instead of `{ isValid: true, errors: [] }`)
- This ensures type safety and prevents missing methods
- Mock external dependencies at the module level using `vi.mock()`
- Use `vi.mocked()` to get typed mock functions for better autocomplete
