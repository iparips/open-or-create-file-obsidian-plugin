import { addDays, addMonths, addWeeks, addYears, format } from 'date-fns'
import { TimeShift, TimeShiftUnit } from './timeShift'

/**
 * Available pattern placeholder units
 */
export const PATTERN_UNITS = {
	YEAR: 'year',
	MONTH: 'month',
	DAY: 'day',
	DATE: 'date',
	TIME: 'time',
	WEEK: 'week',
	DOW: 'dow',
} as const

export class PathSegmentBuilder {
	/**
	 * Processes a pattern string by replacing placeholders with formatted date components
	 *
	 * Supports the following placeholders:
	 * - {year} - 4-digit year (e.g., "2025")
	 * - {month} - 2-digit month (e.g., "06")
	 * - {day} - 2-digit day (e.g., "07")
	 * - {date} - ISO date format (e.g., "2025-06-07")
	 * - {time} - Time in HH-mm-ss format (e.g., "14-30-45")
	 * - {week} - ISO week number (e.g., "23")
	 * - {dow} - Day of week abbreviation (e.g., "Sat")
	 *
	 * @param pattern - The pattern string containing placeholders (e.g., "{year}-{month}-{day}.md")
	 * @param date - The base date to extract components from
	 * @param timeShift - Optional parsed time shift to apply before processing
	 * @returns The processed pattern with placeholders replaced by actual date values
	 */
	static build(pattern: string, date: Date, timeShift?: TimeShift): string {
		const targetDate = timeShift ? this.applyTimeShift(date, timeShift) : date

		return pattern.replace(/{(year|month|day|date|time|week|dow)}/g, (_, unitPlaceholder) => {
			return this.formatPlaceholder(unitPlaceholder, targetDate)
		})
	}

	private static applyTimeShift(date: Date, timeShift: TimeShift): Date {
		switch (timeShift.unit) {
			case TimeShiftUnit.Year:
				return addYears(date, timeShift.amount)
			case TimeShiftUnit.Month:
				return addMonths(date, timeShift.amount)
			case TimeShiftUnit.Day:
				return addDays(date, timeShift.amount)
			case TimeShiftUnit.Week:
				return addWeeks(date, timeShift.amount)
		}
	}

	/**
	 * Processes a single placeholder and returns the formatted date component
	 * @param unit - The time unit extracted from the placeholder (e.g., "year", "month", "day", "date", "time", "week", "dow")
	 * @param date - The date to apply the formatting to
	 * @returns The formatted date component as a string
	 */
	private static formatPlaceholder(unit: string, date: Date): string {
		switch (unit) {
			case PATTERN_UNITS.YEAR:
				return format(date, 'yyyy')
			case PATTERN_UNITS.MONTH:
				return format(date, 'MM')
			case PATTERN_UNITS.DAY:
				return format(date, 'dd')
			case PATTERN_UNITS.DATE:
				return format(date, 'yyyy-MM-dd')
			case PATTERN_UNITS.TIME:
				return format(date, 'HH-mm-ss')
			case PATTERN_UNITS.WEEK:
				return format(date, 'II')
			case PATTERN_UNITS.DOW:
				return format(date, 'EEE')
			default:
				return `{${unit}}`
		}
	}
}
