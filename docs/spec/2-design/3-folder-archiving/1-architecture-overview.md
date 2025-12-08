# Architecture Overview

The folder archiving feature will be implemented as a separate module alongside the existing open-or-create functionality. It will have its own:
- Command execution logic
- Settings UI
- Configuration types
- Validation rules

## High-Level Components

```
src/
├── command/
│   ├── open-or-create/         # Existing functionality
│   │   ├── commandCallback.ts
│   │   ├── pathSegmentBuilder.ts
│   │   ├── timeShift.ts
│   │   └── previous-note-candidate-finder/
│   └── archive/                # New archiving functionality
│       ├── archiveCommandCallback.ts
│       ├── folderScanner.ts
│       ├── folderMatcher.ts
│       ├── ageCalculator.ts
│       ├── destinationPathBuilder.ts
│       └── folderMover.ts
├── settings/
│   ├── open-or-create/         # Existing settings
│   │   ├── OpenOrCreateSettingsComponent.tsx
│   │   └── validation/
│   ├── archive/                # New archive settings
│   │   ├── ArchiveSettingsComponent.tsx
│   │   └── validation/
│   ├── common/                 # Shared utilities
│   │   └── pathSegmentBuilder.ts  (moved from command/)
│   ├── CreateOrOpenFileSettingsTab.ts  # Main settings entry point
│   └── configureDefaultsAndValidateSettings.ts
└── types.ts                    # All TypeScript types
```

## Design Principles

All components follow maintainability rules:
- Static class methods (not standalone functions)
- Max 15 lines per method
- Single level of abstraction
- Outcome types for error handling
- Files under 100 lines