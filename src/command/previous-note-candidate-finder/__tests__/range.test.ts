import { describe, it, expect } from 'vitest'
import { range } from '../range'

describe('range', () => {
	it('generates ascending range when start is less than end', () => {
		const result = range(0, 5)

		expect(result).toEqual([0, 1, 2, 3, 4])
	})

	it('generates descending range when start is greater than end', () => {
		const result = range(5, 0)

		expect(result).toEqual([5, 4, 3, 2, 1])
	})

	it('generates negative descending range when end is negative', () => {
		const result = range(0, -3)

		expect(result).toEqual([0, -1, -2])
	})

	it('returns empty array when start equals end', () => {
		const result = range(3, 3)

		expect(result).toEqual([])
	})
})
