# Unit Test Rules

## Branch coverage

- Aim for 100% branch coverage.
- Each branch of code in the method under test should have one test case
- Break up assertions in test cases in such way that only one test case fails when a particular branch of code under test is broken - avoid duplicating assertions.

## Test Naming

- Name tests in format "does X when condition Y"
- Don't start test names with "should" because it's redundant and repetitive

## Arrange - Act - Assert test case structure

All test cases should follow the below structure

- Arrange - where input data is arranged
- Act - where class under test is invoked
- Assert - where assertions on the output are made

When a test case is large: multiple concepts / objects are setup in either of the above sections,
Then either group those sections using blank lines
