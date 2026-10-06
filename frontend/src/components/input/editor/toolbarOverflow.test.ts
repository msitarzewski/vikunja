import {describe, expect, it} from 'vitest'

import {inlineActionCount} from './toolbarOverflow'

// Three segments of 2, 3 and 1 actions, 10px wide each, 4px separators: 68px in total.
const SEGMENTS = [
	[10, 10],
	[10, 10, 10],
	[10],
]

describe('inlineActionCount', () => {
	it('keeps everything inline when it all fits, with no room left for More', () => {
		expect(inlineActionCount(SEGMENTS, 68, 4, 10)).toBe(6)
	})

	it('reserves room for More and its separator once anything overflows', () => {
		// One pixel short of everything. More + separator take 14; then 10, 10, 4+10, 10 reach 58,
		// and the fifth action would need 68.
		expect(inlineActionCount(SEGMENTS, 67, 4, 10)).toBe(4)
	})

	it('charges a separator only for the first action of a segment', () => {
		// 14 for More, 20 for the first segment, 4+10 for the next action: 48 exactly.
		expect(inlineActionCount(SEGMENTS, 48, 4, 10)).toBe(3)
		expect(inlineActionCount(SEGMENTS, 47, 4, 10)).toBe(2)
	})

	it('can put every action in the menu', () => {
		expect(inlineActionCount(SEGMENTS, 20, 4, 10)).toBe(0)
	})
})
