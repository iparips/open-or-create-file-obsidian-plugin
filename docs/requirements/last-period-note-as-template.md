## Last period note as template prompt

Update plugin configuration, add a new heading under Template file called "Use previous note as
template". Make that be a toggle. If it is on, then when user calls the command, detect the previous file that was created using that command, and if it's present, use that as a template.

Don't show previous note timeshift in the UI, infer it based on

- command's destination folder pattern,
- filename,
- and time shift

Example 1

command: todo
folder pattern is "01 - Journal/Weekly/Week-{week}"
file name is "todo"
time shift is empty

In this case, the note's path increments are in weeks, so we subtract 1 week from the date and check if note exists

Then previous note paths to try are

- "01 - Journal/Weekly/Week-{week minus 1}/todo" -> use if exists, otherwise try:
- "01 - Journal/Weekly/Week-{week minus 2}/todo" -> use if exists, otherwise try:
- "01 - Journal/Weekly/Week-{week minus 3}/todo"

  - and so on until 10 periods are attempted

- Example 2

command: next week's todo
folder pattern is "01 - Journal/Weekly/Week-{week}"
file name is "todo"
time shift is "+1 week"

In this case, the note's path increments are in weeks, so we subtract 1 week from the date and check if note exists

Then previous note paths to try are

- "01 - Journal/Weekly/Week-{week}/todo"
- "01 - Journal/Weekly/Week-{week minus 1}/todo" -> use if exists, otherwise try:
- "01 - Journal/Weekly/Week-{week minus 2}/todo" -> use if exists, and so on until 10 periods are attempted

Example 3

command: tomorrow's note
folder pattern is "01 - Journal/Weekly/Week-{week}"
file name is "{month}-{day}-{dow}.md"
time shift is "+1 day"

In this case, the note's path increments are in days, so we subtract 1 day from the date and check if note exists

Then previous note paths to try are

- "01 - Journal/Weekly/Week-{week}/{month}-{day}-{dow}.md" -> use if exists, otherwise try:
- "01 - Journal/Weekly/Week-{week}/{month}-{day-1}-{dow-1}.md" -> use if exists, otherwise try:
- "01 - Journal/Weekly/Week-{week}/{month}-{day-2}-{dow-2}.md" -> use if exists, and so on

Example 4

command: next retrospective (fortnightly)
folder pattern is "01 - Journal/Weekly/Week-{week}"
file name is "retro.md"
time shift is "+2 weeks"

In this case, the note's path increments are in weeks, so we subtract 1 week from the date and check if note exists
Even thought the increment is in weeks, we still subtract week by week because what if

- last retro note was created in week 1
- we are in week 2
- we want to create a note for a retro in week 3

Then previous note paths to try are

- "01 - Journal/Weekly/Week-{week}/{month}-{day}-{dow}.md" -> use if exists, otherwise try:
- "01 - Journal/Weekly/Week-{week}/{month}-{day-1}-{dow-1}.md" -> use if exists, otherwise try:
- "01 - Journal/Weekly/Week-{week}/{month}-{day-2}-{dow-2}.md" -> use if exists, and so on

Encapsulate this calculation in a one class that takes in command's configuration, and returns a list of note paths to try.

If none of the paths exist, use the template if one is specified, and if none is specified, create an empty note.
