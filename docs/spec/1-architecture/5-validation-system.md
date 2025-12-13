# Validation System

Location: `src/settings/common/validation/`

## Core Files

- `validateSettings.ts`: Top-level settings validation
- `validateField.ts`: Field-level validation rules
- `validationResult.ts`: Validation result wrapper
- `validations.ts`: Reusable validation functions
- `typeGuards.ts`: TypeScript type guards

## Validation Rules

- `required`: Non-empty string
- `endsWithMd`: Optional field ending in .md
- `requiredAndEndsWithMd`: Required field ending in .md
- `timeShift`: Valid time shift format

## Architecture

Rule-based validation with composable validators

## ValidationResult API

The `ValidationResult` class provides a simple public API:

- `isValid: boolean` - Whether validation passed
- `errors: ValidationError[]` - All validation errors
- `settings: CreateOrOpenFilePluginSettings` - The validated/default settings
- `fold<T>(onSuccess, onError)` - Functional transformation for production code
- `getErrorsForCommand(index)` - Filter errors for specific command (used by UI)

## Design Decision

Tests access properties directly (`result.errors`, `result.settings`) for clarity. Production code uses `fold()` for functional transformations when appropriate. This hybrid approach balances testability with functional patterns.
