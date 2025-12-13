# Key Design Decisions

## 1. Dynamic Command Registration

Commands are registered dynamically based on settings:

- Allows unlimited custom commands
- Commands can be added/removed without code changes
- Each command gets unique ID (index-based)

Trade-off: Commands must be unregistered and re-registered on settings changes

## 2. React for Settings UI

Settings tab uses React instead of Obsidian's imperative API:

- Better state management
- Component reusability
- Easier validation feedback

Trade-off: Larger bundle size, React dependency

## 3. Time Shift Unit Override

When time shift is specified, its unit overrides detected granularity:

- Simplifies implementation (single unit throughout)
- Can cause unexpected behaviour (documented limitation)

Future consideration: Allow independent time shift and search granularity

## 4. Backward Compatibility

`configureDefaultsAndValidateSettings()` applies defaults for new optional fields:

- Ensures old settings files work with new versions
- Uses `Object.assign()` to merge defaults with stored config

## 5. Validation Separation

Validation logic separated from UI components:

- Pure validation functions (no React dependencies)
- Reusable across settings tab and initialization
- Easier to test
