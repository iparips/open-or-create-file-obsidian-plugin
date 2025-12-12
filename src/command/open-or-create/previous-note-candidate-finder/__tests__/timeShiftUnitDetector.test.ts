import { describe, it, expect } from 'vitest'
import { TimeShiftUnitDetector } from '../timeShiftUnitDetector'
import { TimeShiftUnit } from '../../timeShift'

describe('TimeShiftUnitDetector', () => {
	describe('detect', () => {
		it('returns Day when pattern contains {day}', () => {
			const result = TimeShiftUnitDetector.detect('notes/{year}', '{day}.md')

			expect(result).toBe(TimeShiftUnit.Day)
		})

		it('returns Day when pattern contains {dow}', () => {
			const result = TimeShiftUnitDetector.detect('notes', '{dow}.md')

			expect(result).toBe(TimeShiftUnit.Day)
		})

		it('returns Week when pattern contains {week}', () => {
			const result = TimeShiftUnitDetector.detect('notes/{year}', '{week}.md')

			expect(result).toBe(TimeShiftUnit.Week)
		})

		it('returns Month when pattern contains {month}', () => {
			const result = TimeShiftUnitDetector.detect('notes/{year}', '{month}.md')

			expect(result).toBe(TimeShiftUnit.Month)
		})

		it('returns Year when pattern contains {year} only', () => {
			const result = TimeShiftUnitDetector.detect('notes', '{year}.md')

			expect(result).toBe(TimeShiftUnit.Year)
		})

		it('returns Day as fallback when no pattern matches', () => {
			const result = TimeShiftUnitDetector.detect('notes', 'static-name.md')

			expect(result).toBe(TimeShiftUnit.Day)
		})

		it('returns Day when pattern contains {day} alongside {week}', () => {
			const result = TimeShiftUnitDetector.detect('notes/{week}', '{day}.md')

			expect(result).toBe(TimeShiftUnit.Day)
		})

		it('returns Day when pattern contains {day} alongside {month} and {year}', () => {
			const result = TimeShiftUnitDetector.detect('notes/{year}/{month}', '{day}.md')

			expect(result).toBe(TimeShiftUnit.Day)
		})

		it('returns Week when pattern contains {week} alongside {month}', () => {
			const result = TimeShiftUnitDetector.detect('notes/{month}', '{week}.md')

			expect(result).toBe(TimeShiftUnit.Week)
		})

		it('returns Week when pattern contains {week} alongside {year}', () => {
			const result = TimeShiftUnitDetector.detect('notes/{year}', '{week}.md')

			expect(result).toBe(TimeShiftUnit.Week)
		})

		it('returns Month when pattern contains {month} alongside {year}', () => {
			const result = TimeShiftUnitDetector.detect('notes/{year}', '{month}.md')

			expect(result).toBe(TimeShiftUnit.Month)
		})

		it('detects pattern in directory path', () => {
			const result = TimeShiftUnitDetector.detect('notes/{week}', 'note.md')

			expect(result).toBe(TimeShiftUnit.Week)
		})
	})
})
