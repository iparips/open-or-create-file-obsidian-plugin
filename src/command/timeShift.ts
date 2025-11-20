/**
 * Supported time shift units
 */
export enum TimeShiftUnit {
	Day = 'day',
	Week = 'week',
	Month = 'month',
	Year = 'year',
}

/**
 * Parsed time shift with amount and unit
 */
export type TimeShift = {
	amount: number
	unit: TimeShiftUnit
}

/**
 * Parses time shift strings into structured objects
 */
export class TimeShiftParser {
	/**
	 * Parses a time shift modifier string and returns the shift amount and unit
	 * @param timeShift - The time shift string (examples: "+1 day", "-2 weeks", "+3 months")
	 * @returns ParsedTimeShift object, or undefined if invalid
	 */
	static parse(timeShift?: string): TimeShift | undefined {
		if (!timeShift) return undefined

		const match = timeShift
			.trim()
			.match(/^([+-]?\d+)\s+(day|days|week|weeks|month|months|year|years)$/i)
		if (!match) return undefined

		const [, amountString, unitString] = match
		const amount = parseInt(amountString, 10)
		const unit = this.normalizeUnit(unitString)

		return { amount, unit }
	}

	private static normalizeUnit(unitString: string): TimeShiftUnit {
		const normalized = unitString.toLowerCase().replace(/s$/, '')

		switch (normalized) {
			case 'day':
				return TimeShiftUnit.Day
			case 'week':
				return TimeShiftUnit.Week
			case 'month':
				return TimeShiftUnit.Month
			case 'year':
				return TimeShiftUnit.Year
			default:
				return TimeShiftUnit.Day
		}
	}
}
