# Architecture Overview

This document provides a high-level overview of the Open or Create File Obsidian Plugin architecture. It is intended for LLMs to understand the system structure before planning changes.

## Purpose

The plugin enables users to create custom Obsidian commands that open or create files based on configurable date-based patterns and templates. It automates creation of daily notes, weekly plans, and other regularly used documents.

## Documentation Structure

The architecture documentation is organised into the following files:

1. [System Overview](1-system-overview.md) - Core plugin components and entry point
2. [Command Layer](2-command-layer.md) - Command execution components
3. [Note Layer](3-note-layer.md) - Note management components
4. [Settings UI](4-settings-ui.md) - Settings UI components and hooks
5. [Settings Configuration](4-settings-config.md) - Settings initialization and migration
6. [Validation System](5-validation-system.md) - Validation architecture
7. [Data Flow](6-data-flow.md) - Command execution and settings update flows
8. [Design Decisions](7-design-decisions.md) - Key architectural decisions
9. [Testing](8-testing.md) - Test architecture and strategy
10. [Dependencies](9-dependencies.md) - Production and development dependencies
11. [File Organisation](10-file-organisation.md) - Directory structure
12. [Extension Points](11-extension-points.md) - How to extend the system
13. [Performance and Security](12-performance-security.md) - Performance and security considerations

## When Implementing New Features

1. Start with requirement spec in `docs/spec/2-requirements/`
2. Create design doc in `docs/spec/3-design/`
3. Follow maintainability rules in `docs/spec/0-rules/`
4. Write tests following unit test rules
5. Update these architecture docs if core structure changes
