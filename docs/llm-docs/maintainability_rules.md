# Maintainability Rules

Write code optimising for human readability. Always follow the Maintainability Rules below.

## Functions structure
- Be 15 lines max
- Have a single purpose clearly reflected in its name
- Have no more than one level of branching. Extract another function if more is needed.
- Follow the Single Level of Abstraction principle and read like a table of contents of operations delegating to other functions.

## Function order
- In a file or a class put higher order functions on top, and lower order ones below
- Group functions such that lower order functions are placed below higher order functions that use them

## Files structure
Ensure files have
- No more than 100 lines of code
- Have at most one class
- Contain a class with static methods, except when state is needed
  - This allows function calls to be prefixed with the class name (e.g., `FileScanner.find_mp4_files()`)
  - This makes it immediately clear which file a function belongs to when reading code

## Directory structure
- Follow a Single Responsibility principle
- Contain related files
- Aim to have at most seven files per directory

## Programming style
Favour a combination of object-oriented combined with functional programming styles.

- Use pure functions, higher order functions where possible
- Favour forEach or map functions over loops such as for, or while
- Avoid using state unless necessary to clearly express the intent of a class

## Error logging
- Ensure that logging is only done on the top level, eg index.ts files
  - and that the remaining code returns Outcome objects that are then logged on the top level.
- Outcome objects could have either success or failure states, which can include errors

## Basic formatting
- Always put a new line at the end of each file you generate
