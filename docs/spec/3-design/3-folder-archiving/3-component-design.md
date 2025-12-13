# Component Design

## 1. Archive Command Callback

File: `src/command/archive/archiveCommandCallback.ts` (approx 80 lines)

Purpose: Entry point, orchestrates archiving, displays results.

```typescript
export class ArchiveCommandExecutor {
	static async execute(plugin: CreateOrOpenFilePlugin, adapter: ObsidianAdapter): Promise<void> {
		const configs = plugin.settings.archiveConfigs
		const outcome = await this.executeArchiving(configs, adapter)
		this.displayResults(outcome)
	}

	private static async executeArchiving(
		configs: ArchiveConfig[],
		adapter: ObsidianAdapter,
	): Promise<ArchiveOutcome> {
		if (configs.length === 0) {
			return { success: false, error: 'No archive configurations found' }
		}

		const summary = await this.processAllConfigs(configs, adapter)
		return { success: true, data: summary }
	}

	private static async processAllConfigs(
		configs: ArchiveConfig[],
		adapter: ObsidianAdapter,
	): Promise<ArchiveSummary> {
		const results = await Promise.all(configs.map((config) => this.processConfig(config, adapter)))
		return this.aggregateResults(results)
	}

	private static async processConfig(
		config: ArchiveConfig,
		adapter: ObsidianAdapter,
	): Promise<ArchiveSummary> {
		const operations = await ArchiveOperationBuilder.build(config, adapter)
		return FolderMover.moveAll(operations, adapter)
	}

	private static aggregateResults(results: ArchiveSummary[]): ArchiveSummary {
		return results.reduce(
			(total, current) => ({
				movedCount: total.movedCount + current.movedCount,
				errorCount: total.errorCount + current.errorCount,
				errors: [...total.errors, ...current.errors],
			}),
			{ movedCount: 0, errorCount: 0, errors: [] },
		)
	}

	private static displayResults(outcome: ArchiveOutcome): void {
		if (!outcome.success) {
			new Notice(outcome.error)
			return
		}

		const { movedCount, errorCount } = outcome.data
		const message = `Archived ${movedCount} folders. ${errorCount} errors.`
		new Notice(message)
	}
}
```

## 2. Folder Scanner

File: `src/command/archive/folderScanner.ts`

Purpose: Scan vault for folders matching a glob pattern and calculate their ages.

```typescript
export async function scanForMatches(
	sourcePattern: string,
	adapter: ObsidianAdapter,
): Promise<FolderMatch[]> {
	// 1. Get all folders in vault
	const allFolders = await adapter.getAllFolders()

	// 2. Convert glob pattern to regex
	const matcher = createMatcher(sourcePattern)

	// 3. Filter matching folders
	const matchingFolders = allFolders.filter((folder) => matcher.test(folder.path))

	// 4. Calculate age for each folder
	const now = Date.now()
	return matchingFolders.map((folder) => ({
		path: folder.path,
		modifiedTime: folder.stat.mtime,
		ageInDays: calculateAgeInDays(folder.stat.mtime, now),
	}))
}

function calculateAgeInDays(modifiedTime: number, now: number): number {
	const ageInMs = now - modifiedTime
	return Math.floor(ageInMs / (1000 * 60 * 60 * 24))
}
```

## 3. Folder Matcher

File: `src/command/archive/folderMatcher.ts`

Purpose: Convert glob patterns to regex for matching folder paths.

```typescript
export function createMatcher(globPattern: string): RegExp {
	// Convert glob pattern to regex
	// * matches any characters except /
	// ** matches any characters including /

	let regexPattern = globPattern
		.replace(/\*\*/g, '___DOUBLE_STAR___') // Temporarily replace **
		.replace(/\*/g, '[^/]*') // * becomes [^/]*
		.replace(/___DOUBLE_STAR___/g, '.*') // ** becomes .*
		.replace(/\?/g, '[^/]') // ? becomes [^/]

	// Anchor pattern
	regexPattern = `^${regexPattern}$`

	return new RegExp(regexPattern)
}
```

Examples:

- `"Journal/Week-*"` → `/^Journal\/Week-[^/]*$/`
- `"Projects/**/Archive"` → `/^Projects\/.*\/Archive$/`

## 4. Destination Path Builder

File: `src/command/archive/destinationPathBuilder.ts`

Purpose: Build destination paths by replacing date placeholders.

```typescript
export function buildDestinationPath(match: FolderMatch, destinationPattern: string): string {
	const date = new Date(match.modifiedTime)

	// Replace placeholders
	let path = destinationPattern
		.replace(/{year}/g, formatYear(date))
		.replace(/{quarter}/g, formatQuarter(date))
		.replace(/{month:MMMM}/g, formatMonth(date, 'MMMM'))
		.replace(/{month:MMM}/g, formatMonth(date, 'MMM'))
		.replace(/{month:MM}/g, formatMonth(date, 'MM'))
		.replace(/{month}/g, formatMonth(date, 'MM-MMM')) // Default format

	// Append original folder name to destination
	const folderName = match.path.split('/').pop() || ''
	return normalizePath(`${path}/${folderName}`)
}

function formatYear(date: Date): string {
	return date.getFullYear().toString()
}

function formatQuarter(date: Date): string {
	const month = date.getMonth() + 1 // 1-12
	const quarter = Math.ceil(month / 3)
	return quarter.toString()
}

function formatMonth(date: Date, format: string): string {
	const month = date.getMonth() + 1 // 1-12

	switch (format) {
		case 'MM':
			return month.toString().padStart(2, '0')
		case 'MMM':
			return getShortMonthName(month)
		case 'MMMM':
			return getFullMonthName(month)
		case 'MM-MMM':
			return `${month.toString().padStart(2, '0')}-${getShortMonthName(month)}`
		default:
			return month.toString().padStart(2, '0')
	}
}

function getShortMonthName(month: number): string {
	const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	return names[month - 1]
}

function getFullMonthName(month: number): string {
	const names = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	]
	return names[month - 1]
}
```

## 5. Folder Mover (ObsidianAdapter Extension)

File: `src/notes/obsidianAdapter.ts` (modified)

Purpose: Move folders to archive locations.

```typescript
// Added to existing ObsidianAdapter class

export class ObsidianAdapter {
	// ... existing methods ...

	async moveFolder(sourcePath: string, destinationPath: string): Promise<void> {
		const sourceFolder = this.vault.getAbstractFileByPath(sourcePath)

		if (!sourceFolder || !(sourceFolder instanceof TFolder)) {
			throw new Error(`Source folder not found: ${sourcePath}`)
		}

		// Create destination parent directories if needed
		await this.createFolderIfNeeded(destinationPath)

		// Move folder using Obsidian API
		await this.vault.rename(sourceFolder, destinationPath)
	}

	async getAllFolders(): Promise<TFolder[]> {
		const folders: TFolder[] = []
		Vault.recurseChildren(this.vault.getRoot(), (file) => {
			if (file instanceof TFolder) {
				folders.push(file)
			}
		})
		return folders
	}

	private async createFolderIfNeeded(folderPath: string): Promise<void> {
		const parentPath = folderPath.substring(0, folderPath.lastIndexOf('/'))

		if (parentPath && !this.vault.getAbstractFileByPath(parentPath)) {
			await this.vault.createFolder(parentPath)
		}
	}
}
```
