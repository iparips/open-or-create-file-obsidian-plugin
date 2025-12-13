# File Organisation

```
src/
├── main.ts                               # Plugin entry point
├── types.ts                              # Shared TypeScript types
├── command/                              # Command execution logic
│   └── open-or-create/                   # Open-or-create feature
│       ├── commandCallback.ts            # Command handler
│       ├── pathSegmentBuilder.ts         # Date pattern replacement
│       ├── timeShift.ts                  # Time shift parsing
│       └── previous-note-candidate-finder/  # Previous note search
├── notes/                                # Note management
│   ├── noteCreator.ts                    # High-level note operations
│   └── obsidianAdapter.ts                # Obsidian API abstraction
├── settings/                             # Settings management
│   ├── common/                           # Shared settings infrastructure
│   │   ├── SettingsTab.ts                # Obsidian settings integration
│   │   ├── configureDefaultsAndValidateSettings.ts  # Settings init
│   │   ├── parseSettings.ts              # Settings parsing & migration
│   │   ├── components/                   # Shared UI components
│   │   │   ├── SettingsComponent.tsx     # Main settings entrypoint
│   │   │   ├── ActionsHeader.tsx         # Import/Export
│   │   │   ├── SettingInput.tsx          # Reusable input
│   │   │   ├── SettingToggle.tsx         # Reusable toggle
│   │   │   └── ValidationSummary.tsx     # Validation display
│   │   ├── hooks/                        # React hooks
│   │   │   └── useSettings.ts            # Settings state management
│   │   └── validation/                   # Validation logic
│   │       ├── validateSettings.ts       # Top-level validation
│   │       ├── validateField.ts          # Field validation rules
│   │       ├── validationResult.ts       # Result wrapper
│   │       ├── validations.ts            # Reusable validators
│   │       └── typeGuards.ts             # Type guards
│   ├── open-or-create/                   # Open-or-create specific
│   │   ├── components/
│   │   │   ├── OpenOrCreateSettings.tsx  # Command list panel
│   │   │   └── CommandCard.tsx           # Individual command UI
│   │   └── constants.ts                  # Default settings
│   └── archive/                          # Archive feature (future)
└── test-support/                         # Test utilities
    ├── __mocks__/obsidian.ts             # Obsidian API mocks
    └── builders.ts                       # Test data builders
```
