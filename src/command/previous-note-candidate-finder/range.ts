/**
 * Generates an array of numbers from start to end (exclusive).
 * Works with both ascending and descending ranges.
 *
 * Examples:
 *   range(0, 5)  => [0, 1, 2, 3, 4]
 *   range(5, 0)  => [5, 4, 3, 2, 1]
 *   range(0, -3) => [0, -1, -2]
 */
export const range = (start: number, end: number): number[] => {
	const isAscending = start <= end
	const count = Math.abs(end - start)

	return Array.from({ length: count }, (_, index) => (isAscending ? start + index : start - index))
}
