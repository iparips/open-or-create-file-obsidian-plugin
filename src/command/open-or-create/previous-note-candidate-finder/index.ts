import { PathSegmentBuilder } from '../../open-or-create/pathSegmentBuilder'
import { TimeShift } from '../../open-or-create/timeShift'
import { TimeShiftUnitDetector } from './timeShiftUnitDetector'
import { range } from './range'

export class PreviousNoteCandidatesFinder {
	static generateCandidates(
		destinationDirPattern: string,
		fileNamePattern: string,
		commandTimeShift?: TimeShift,
		maxAttempts = 10,
	): string[] {
		const detectedTimeShiftUnit = TimeShiftUnitDetector.detect(
			destinationDirPattern,
			fileNamePattern,
		)
		const now = new Date()

		function generatePathCandidate(i: number) {
			const baseTimeShiftAmount = commandTimeShift?.amount ?? 0
			const timeShiftUnit = commandTimeShift?.unit ?? detectedTimeShiftUnit
			const timeShift = { amount: baseTimeShiftAmount - i, unit: timeShiftUnit }
			const destinationFolder = PathSegmentBuilder.build(destinationDirPattern, now, timeShift)
			const fileName = PathSegmentBuilder.build(fileNamePattern, now, timeShift)
			return `${destinationFolder}/${fileName}`
		}

		return range(1, maxAttempts + 1).map(generatePathCandidate)
	}
}
