# Note Management Layer

All note management components are located in `src/notes/`.

## 1. Note Creator (`noteCreator.ts`)

Class: `NoteCreator`

Purpose: High-level note operations (open existing or create new)

Method: `openOrCreateFileFromTemplate(noteFilePath, templateFilePath?)`

Logic:

1. Check if note exists
2. If exists: open it
3. If not: create from template, then open

## 2. Obsidian Adapter (`obsidianAdapter.ts`)

Class: `ObsidianAdapter`

Purpose: Abstraction layer over Obsidian API for testability

Key Methods:

- `openFile()`: Opens file using Obsidian workspace API
- `doesFileExist()`: Checks vault for file existence
- `createFileAndFolder()`: Creates parent folders + file from template
- `getTemplateContentOrEmpty()`: Loads template content or returns empty string
- `loadTemplateContent()`: Reads template file from vault

Design Pattern: Adapter pattern for dependency injection and testing
