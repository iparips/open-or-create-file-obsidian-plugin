# Open or Create File Obsidian Plugin

This plugin allows adding custom Obsidian commands that create or open files based on predefined patterns, making it easier to maintain daily notes, weekly plans, and other regularly used documents. It reduces the cognitive load by automating the creation of frequently used files.

Please note, I work on this during my spare time of which I have very little. If there are any issues, feel free to raise a PR, but note it might take me some time to respond.

## Features

- Open or Create new files from templates
- Support for dynamic file paths using date-based patterns
- Time shift functionality for future/past dates
- Customizable command names for quick access
- Import and Export of custom command configuration as json files

## How to configure the plugin

1. Go to Obsidian > Settings > Community Plugins > Create or Open File
2. Click on Settings cog icon
3. Click "Add command" button
4. Supply configuration below to configure your new command
5. Once created, the command can be executed by opening Command Palette, typing the command name, and pressing Enter.

### Example 1: Weekly shopping list

Add configuration below to create a weekly Shopping list command.

```yaml
Command name: 'Shopping list'
Template file path: '00 - Meta/Templates/shopping-list-template.md'
Destination folder pattern: '01 - Journal/Weekly/Week-{week}'
File name: 'shopping-list.md'
```

Executing the command will create: `01 - Journal/Weekly/Week-23/shopping-list.md` with the template's contents.

### Example 2: Tomorrow's daily note

Add configuration below to create a weekly Shopping list command.

```yaml
Command name: "Tomorrow's Daily Note"
Destination folder: '01 - Journal/Weekly/Week-{week}'
File name: '{month}-{day}-{dow}.md'
Time shift: '+1 day'
```

Executing the command will create: `01 - Journal/Weekly/Week-23/06-07-Sat.md` using tomorrow's date.

## Supported placeholders

Use these placeholders in both destination folder paths and file names:

| Placeholder | Example    | Description              |
| ----------- | ---------- | ------------------------ |
| `{year}`    | 2025       | 4-digit year             |
| `{month}`   | 06         | 2-digit month            |
| `{day}`     | 07         | 2-digit day              |
| `{date}`    | 2025-06-07 | ISO date format          |
| `{time}`    | 14-30-45   | Time in HH-mm-ss format  |
| `{week}`    | 23         | ISO week number          |
| `{dow}`     | Sat        | Day of week abbreviation |

## Time shifts

Apply time shifts to adjust the date used for pattern resolution:

Format: `+N unit` or `-N unit`

- N: number
- unit: day(s), week(s), month(s), year(s)

Examples:

- `+1 day` → Use tomorrow's date
- `-2 weeks` → Use date from 2 weeks ago
- `+3 months` → Use date from 3 months in the future

## Support the project

If you find this plugin helpful, consider supporting its development:

- ⭐ Star the project on GitHub
- 💖 [Sponsor on GitHub](https://github.com/sponsors/iparips)
- 🐛 Report bugs and suggest features

Your support helps me dedicate more time to improving this plugin and developing new features!

## Other documentation

- [TODO](docs/TODO.md) - Planned features and improvements
- [Contributing](docs/CONTRIBUTING.md) - How to contribute to this project
- [Release Notes](docs/RELEASE.md) - Version history and changelog
