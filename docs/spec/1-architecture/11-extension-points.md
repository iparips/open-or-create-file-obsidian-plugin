# Extension Points

When adding new features, consider these extension points:

## 1. New Date Placeholders

- Add to `PATTERN_UNITS` in `pathSegmentBuilder.ts`
- Add format case in `formatPlaceholder()`
- Update `TimeShiftUnitDetector` if it affects granularity

## 2. New Validation Rules

- Add to `VALIDATIONS` in `validateField.ts`
- Add to `buildFieldValidations()` for specific fields
- Update validation tests

## 3. New Command Configuration Fields

- Add to `CommandConfig` type in `types.ts`
- Add to `DEFAULT_COMMAND_CONFIG` in `configureDefaultsAndValidateSettings.ts`
- Add UI component in `CommandCard.tsx`
- Add validation rules if needed

## 4. New Template Sources

- Modify `resolveTemplatePath()` in `commandCallback.ts`
- Add new resolution strategy
- Update `CommandConfig` with new options

## 5. Settings Import/Export Formats

- Modify `ActionsHeader.tsx` component
- Add new file type support
- Update validation for new format
