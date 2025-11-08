import { processPattern } from './patternParser'

/**
 * Determines the smallest time granularity used in a pattern string
 * Priority: day > week > month > year (smallest to largest)
 */
function detectTimeGranularity(destinationPattern: string, fileNamePattern: string): string {
	const combinedPattern = `${destinationPattern}/${fileNamePattern}`

	// Check in order of smallest to largest granularity
	if (/{day}/.test(combinedPattern) || /{dow}/.test(combinedPattern)) {
		return 'day'
	}
	if (/{week}/.test(combinedPattern)) {
		return 'week'
	}
	if (/{month}/.test(combinedPattern)) {
		return 'month'
	}
	if (/{year}/.test(combinedPattern)) {
		return 'year'
	}

	// Default to day if no time pattern detected
	return 'day'
}

/**
 * Finds potential previous note paths based on pattern analysis
 */
export class PreviousNoteFinder {
	private readonly destinationPattern: string
	private readonly fileNamePattern: string
	private readonly baseTimeShift?: string
	private readonly maxAttempts = 10

	constructor(destinationPattern: string, fileNamePattern: string, baseTimeShift?: string) {
		this.destinationPattern = destinationPattern
		this.fileNamePattern = fileNamePattern
		this.baseTimeShift = baseTimeShift
	}

	/**
	 * Generates a list of potential previous note file paths to try
	 * @returns Array of file paths, ordered from most recent to oldest
	 */
	public generatePreviousNotePaths(): string[] {
		const granularity = detectTimeGranularity(this.destinationPattern, this.fileNamePattern)
		const paths: string[] = []
		const now = new Date()

		for (let i = 1; i <= this.maxAttempts; i++) {
			const timeShift = this.calculateTimeShift(granularity, i)
			const path = this.buildPath(now, timeShift)
			paths.push(path)
		}

		return paths
	}

	/**
	 * Builds a single file path with the given time shift
	 */
	private buildPath(date: Date, timeShift: string): string {
		const destinationFolder = processPattern(this.destinationPattern, date, timeShift)
		const fileName = processPattern(this.fileNamePattern, date, timeShift)
		return `${destinationFolder}/${fileName}`
	}

	/**
	 * Calculates the time shift string for a given iteration
	 * Takes into account the base time shift from the command configuration
	 */
	private calculateTimeShift(granularity: string, iteration: number): string {
		const baseShift = this.parseBaseTimeShift()
		const lookbackShift = -iteration // Always negative to go backwards

		// If we have a base shift, we need to adjust relative to it
		if (baseShift) {
			const totalShift = baseShift.amount + lookbackShift
			return `${totalShift} ${baseShift.unit}`
		}

		// No base shift, just go backwards
		return `${lookbackShift} ${granularity}`
	}

	/**
	 * Parses the base time shift from the command configuration
	 */
	private parseBaseTimeShift(): { amount: number; unit: string } | null {
		if (!this.baseTimeShift) return null

		const match = this.baseTimeShift.trim().match(/^([+-]?\d+)\s+(day|days|week|weeks|month|months|year|years)$/i)
		if (!match) return null

		const [, amountStr, unitStr] = match
		const amount = parseInt(amountStr, 10)
		const unit = unitStr.toLowerCase().replace(/s$/, '') // Normalize to singular

		return { amount, unit }
	}
}
