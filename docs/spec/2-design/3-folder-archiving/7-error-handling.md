# Error Handling

## Error Scenarios

1. Source folder not found
   - Log error and skip to next operation
   - Include in error count summary

2. Destination already exists
   - Append timestamp to destination folder name
   - Retry move operation

3. Permission errors
   - Log error with clear message
   - Display notice to user

4. Invalid glob pattern
   - Validate during settings save
   - Show validation error in UI

5. Invalid placeholders
   - Validate during settings save
   - Show validation error in UI

## Error Handling Implementation

```typescript
async function executeArchiveOperations(
  operations: ArchiveOperation[],
  adapter: ObsidianAdapter
): Promise<{ successCount: number; errorCount: number }> {
  let successCount = 0
  let errorCount = 0

  for (const op of operations) {
    try {
      await moveWithRetry(op, adapter)
      successCount++
    } catch (error) {
      console.error(`Failed to move ${op.sourcePath}:`, error)
      errorCount++
    }
  }

  return { successCount, errorCount }
}

async function moveWithRetry(
  operation: ArchiveOperation,
  adapter: ObsidianAdapter
): Promise<void> {
  let destinationPath = operation.destinationPath

  try {
    await adapter.moveFolder(operation.sourcePath, destinationPath)
  } catch (error) {
    // If destination exists, append timestamp and retry
    if (error.message?.includes('already exists')) {
      const timestamp = Date.now()
      destinationPath = `${destinationPath}-${timestamp}`
      await adapter.moveFolder(operation.sourcePath, destinationPath)
    } else {
      throw error
    }
  }
}
```

## Error Reporting

Errors are aggregated in the `ArchiveSummary`:

```typescript
interface ArchiveSummary {
  movedCount: number
  errorCount: number
  errors: string[]
}
```

User sees summary in notice:
- Success: "Archived 5 folders. 0 errors."
- Partial success: "Archived 3 folders. 2 errors."
- Complete failure: Error message displayed
