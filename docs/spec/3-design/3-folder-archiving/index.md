# Folder Archiving Design

This document describes the technical design for the folder archiving feature. This feature allows users to automatically move old folders to archive locations based on configurable patterns and age thresholds.

## Purpose

Enable users to keep their vault organised by automatically archiving old folders (e.g., weekly journals, project folders) into structured archive locations grouped by date (year, quarter, month).

## Design Documents

1. [Architecture Overview](1-architecture-overview.md) - High-level components and file structure
2. [Data Model](2-data-model.md) - Types and interfaces
3. [Component Design](3-component-design.md) - Implementation details for core components
4. [Settings UI](4-settings-ui.md) - React components for settings interface
5. [Validation](5-validation.md) - Type guards and validation rules
6. [Command Registration](6-command-registration.md) - Plugin command integration
7. [Error Handling](7-error-handling.md) - Error scenarios and handling strategies
8. [Testing Strategy](8-testing-strategy.md) - Unit, integration, and manual testing
9. [Migration and Defaults](9-migration-and-defaults.md) - Backward compatibility and defaults
10. [Implementation Order](10-implementation-order.md) - Step-by-step implementation plan
