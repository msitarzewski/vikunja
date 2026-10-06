/**
 * How many toolbar actions fit on one row, keeping their order.
 *
 * `segments` holds the width of each action, grouped as in the toolbar. Every segment
 * after the first is preceded by a `separator`. Once anything overflows, a More button
 * of width `more`, also after a separator, has to fit as well.
 */
export function inlineActionCount(
	segments: number[][],
	available: number,
	separator: number,
	more: number,
): number {
	const total = segments.reduce(
		(sum, widths, index) => sum + (index > 0 ? separator : 0) + widths.reduce((a, b) => a + b, 0),
		0,
	)
	if (total <= available) {
		return segments.flat().length
	}

	let used = separator + more
	let count = 0
	for (const [index, widths] of segments.entries()) {
		for (const [position, width] of widths.entries()) {
			const cost = width + (index > 0 && position === 0 ? separator : 0)
			if (used + cost > available) {
				return count
			}
			used += cost
			count++
		}
	}
	return count
}
