import { TimeShiftUnit } from '../timeShift'

const GRANULARITY_PATTERNS: [RegExp, TimeShiftUnit][] = [
	[/{day}|{dow}/, TimeShiftUnit.Day],
	[/{week}/, TimeShiftUnit.Week],
	[/{month}/, TimeShiftUnit.Month],
	[/{year}/, TimeShiftUnit.Year],
]

export class TimeShiftUnitDetector {
	static detect(destinationDirPattern: string, fileNamePattern: string): TimeShiftUnit {
		const combinedPattern = `${destinationDirPattern}/${fileNamePattern}`
		const match = GRANULARITY_PATTERNS.find(([regex]) => regex.test(combinedPattern))
		// Falls back to 'day' if nothing matches, since daily notes is a common case for obsidian
		return match ? match[1] : TimeShiftUnit.Day
	}
}
