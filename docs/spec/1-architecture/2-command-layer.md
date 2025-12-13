# Command Execution Layer

All command execution components are located in `src/command/open-or-create/`.

## 1. Command Callback (`commandCallback.ts`)

Function: `createOrOpenFileCommandCallback()`

Flow:

1. Parse time shift configuration
2. Build note file path from patterns + time shift
3. Resolve template (static template OR previous note)
4. Delegate to `NoteCreator` to open/create file
5. Display result notice to user

Key Logic:

- `buildNoteFilePath()`: Constructs full file path using patterns
- `resolveTemplatePath()`: Determines template source (static file or previous note)

## 2. Path Segment Builder (`pathSegmentBuilder.ts`)

Class: `PathSegmentBuilder`

Purpose: Replaces date placeholders in patterns with formatted date values

Supported Placeholders:

- `{year}` → 4-digit year (e.g., "2025")
- `{month}` → 2-digit month (e.g., "06")
- `{day}` → 2-digit day (e.g., "07")
- `{date}` → ISO date (e.g., "2025-06-07")
- `{time}` → HH-mm-ss format (e.g., "14-30-45")
- `{week}` → ISO week number (e.g., "23")
- `{dow}` → Day of week abbreviation (e.g., "Sat")

Key Method:

- `build()`: Applies time shift, then replaces all placeholders in pattern

Dependencies: `date-fns` library for date manipulation

## 3. Time Shift (`timeShift.ts`)

Class: `TimeShiftParser`

Purpose: Parses user-specified time shifts like "+1 day" or "-2 weeks"

Format: `[+|-]N unit` where unit is day(s), week(s), month(s), year(s)

Enum: `TimeShiftUnit` (Day, Week, Month, Year)

Type: `TimeShift { amount: number, unit: TimeShiftUnit }`

## 4. Previous Note Candidate Finder (`previous-note-candidate-finder/`)

Class: `PreviousNoteCandidatesFinder`

Purpose: Generates candidate paths for finding previous notes to use as templates

Algorithm:

1. Detect time granularity from patterns (daily, weekly, monthly, yearly)
2. If command has time shift, its unit overrides detected granularity
3. Generate up to 10 candidate paths going backwards in time
4. First existing file becomes the template

Key Components:

- `TimeShiftUnitDetector`: Detects granularity from placeholders in patterns
- `range()`: Utility for generating number sequences

Limitation: Time shift unit override can cause unexpected behaviour (documented in README.md:99-106)
