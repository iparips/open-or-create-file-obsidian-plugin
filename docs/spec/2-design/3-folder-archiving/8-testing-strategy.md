# Testing Strategy

## Unit Tests

### 1. folderMatcher.test.ts
- Test glob pattern to regex conversion
- Test pattern matching with various folder paths
- Test wildcards: `*`, `**`, `?`

### 2. destinationPathBuilder.test.ts
- Test year placeholder replacement
- Test quarter calculation (Q1-Q4)
- Test month format variations (MM, MMM, MMMM)
- Test default month format (MM-MMM)
- Test folder name appending

### 3. folderScanner.test.ts
- Test age calculation
- Test folder filtering by pattern
- Test with empty vault
- Test with nested folders

### 4. validateArchiveConfig.test.ts
- Test validation rules for all fields
- Test placeholder validation
- Test age threshold validation
- Test type guard functionality

## Integration Tests

### 1. archiveCommandCallback.test.ts
- Test full archive flow with mocked ObsidianAdapter
- Test multiple configurations
- Test error handling
- Test result aggregation

## Manual Testing Checklist

- [ ] Create test folders with various dates
- [ ] Configure archive with different patterns
- [ ] Execute archive command
- [ ] Verify folders moved to correct locations
- [ ] Verify age threshold respected
- [ ] Test with multiple configurations
- [ ] Test error handling (missing folders, permission errors)
- [ ] Test settings validation
- [ ] Test settings persistence
- [ ] Test import/export with archive configs
- [ ] Test settings sync across devices

## Performance Testing

For large vaults:
- [ ] Test with 1000+ folders
- [ ] Verify reasonable execution time
- [ ] Check memory usage
- [ ] Test UI responsiveness during execution
