# Folder Archiver

## Motivation

I often use week-based folders inside my Journal, and over the course of months they tend to grow into a long list of folders.
I want a command to move them all into an archive folder in my obsidian vault grouped by year and quarter.

## In Scope

- Settings Tab, where user can configure archiving feature
- Archiving command
- Refactor the existing folder structure to have clear grouping of files by obsidian command they implement.
  - Create folders under src/command for
    - open-or-create command, and another one for
    - archive command
  - Change src/settings/ include two directories
    - one for settings for open-or-create command
    - another for settings for archive command
    - settings entrypoint on the root of the settings folder
    - and a folder for common code

## Out of scope

- Compression
- File and folder renaming

## Feature Details

### Archiving Feature Settings Tab

- Inputs
  - Button to create an archiving configuration
  - Archiving configuration includes
    - Source Directory Pattern
      - Source dir pattern is a glob pattern
    - Destination Directory Pattern
      - supports special placeholders
        - {year}, {month}, {quarter}
    - Age of subdirectories inside of the source dir

### New Obsidian Archive Command

Executes all Archiving operations configured in the config tab

## Non-Functional Requirements

Command should be performant in large repos with that have a lot

## Acceptance Criteria

### Scenario 1: Execute archive command with matching folders

Given I have an archiving configuration set up with source pattern "Journal/Week-\*"
And destination pattern "Archive/{year}/Q{quarter}"
And age threshold of 90 days
And there are folders "Journal/Week-01-2024", "Journal/Week-02-2024" that are older than 90 days
When I execute the archive command
Then the old week folders should be moved to "Archive/2024/Q1/"
And the original folders should no longer exist in the Journal directory

### Scenario 2: Archive command respects age threshold

Given I have an archiving configuration with age threshold of 90 days
And there are folders that are 89 days old
When I execute the archive command
Then no folders should be moved
And folders should remain in their original location

### Scenario 3: Archive command handles multiple configurations

Given I have two archiving configurations set up
And the first targets "Journal/Week-_" folders
And the second targets "Projects/Archive-_" folders
When I execute the archive command
Then all matching folders from both configurations should be processed
And each should be moved to their respective destination patterns

### Scenario 4: Destination directory is created if it doesn't exist

Given I have an archiving configuration with destination "Archive/{year}/Q{quarter}"
And the destination directory does not exist
When I execute the archive command with matching folders
Then the destination directory structure should be created automatically
And folders should be moved into the newly created directories

### Scenario 5: Multiple archiving configurations can be managed

Given I have created several archiving configurations
When I open the settings tab
Then I should see all my archiving configurations listed
And I should be able to edit or delete existing configurations

### Scenario 6: Archive command handles year and quarter placeholders correctly

Given I have an archiving configuration with destination "Archive/{year}/Q{quarter}"
And I have folders from different months (January, April, July, October)
When I execute the archive command
Then January folders should go to "Archive/{year}/Q1"
And April folders should go to "Archive/{year}/Q2"
And July folders should go to "Archive/{year}/Q3"
And October folders should go to "Archive/{year}/Q4"

### Scenario 7: Month placeholder supports multiple format options

Given I have an archiving configuration with destination "Archive/{year}/{month:MM}"
And I have folders from January 2024
When I execute the archive command
Then January folders should go to "Archive/2024/01"

Given I have an archiving configuration with destination "Archive/{year}/{month:MMM}"
And I have folders from January 2024
When I execute the archive command
Then January folders should go to "Archive/2024/Jan"

Given I have an archiving configuration with destination "Archive/{year}/{month:MMMM}"
And I have folders from January 2024
When I execute the archive command
Then January folders should go to "Archive/2024/January"

Given I have an archiving configuration with destination "Archive/{year}/{month}"
And the format is not specified
When I execute the archive command
Then the default format should be MM-MMM (01-Jan)
