import type {Locator} from '@playwright/test'
import {test, expect} from '../../support/fixtures'
import {ProjectFactory} from '../../factories/project'
import {TaskFactory} from '../../factories/task'
import {createDefaultViews} from '../project/prepareProjects'

const MORE = 'More formatting options'
const ACTION_COUNT = 19

// Distinct top edges of the visible toolbar buttons; 1 means a single row.
async function rowCount(toolbar: Locator): Promise<number> {
	const tops = await toolbar.locator('button.editor-toolbar__button:visible').evaluateAll(
		buttons => buttons.map(button => Math.round(button.getBoundingClientRect().top)),
	)
	return new Set(tops).size
}

test.describe('Editor toolbar overflow', () => {
	test('a narrow editor keeps one row and offers the rest in a menu', async ({
		authenticatedPage: page,
		apiContext,
		userToken,
	}) => {
		await page.setViewportSize({width: 700, height: 900})
		const [project] = await ProjectFactory.create(1)
		await createDefaultViews(project.id)
		const [task] = await TaskFactory.create(1, {project_id: project.id})
		await page.goto(`/tasks/${task.id}`)

		const comments = page.locator('.comments')
		const toolbar = comments.locator('.editor-toolbar')
		await expect(toolbar).toBeVisible()
		expect(await rowCount(toolbar)).toBe(1)

		const inline = await toolbar.locator('button.editor-toolbar__button:visible').count()
		const more = toolbar.getByRole('button', {name: MORE})
		await more.click()
		const items = toolbar.locator('.dropdown-menu .dropdown-item')
		// Every action is reachable exactly once: inline or in the menu (the More trigger is inline too).
		expect(inline - 1 + await items.count()).toBe(ACTION_COUNT)

		await comments.locator('.tiptap[contenteditable="true"]').fill('Above the rule')
		await more.click()
		await items.filter({hasText: 'Horizontal Rule'}).click()
		await expect(items.first()).toBeHidden()
		await comments.getByRole('button', {name: 'Comment', exact: true}).click()
		await expect(page.locator('.global-notification')).toContainText('Success')

		await page.reload()
		const stored = await apiContext.get(`tasks/${task.id}/comments`, {
			headers: {Authorization: `Bearer ${userToken}`},
		})
		expect(stored.ok()).toBeTruthy()
		expect(await stored.json()).toEqual([expect.objectContaining({comment: expect.stringContaining('<hr>')})])
	})

	test('a wide editor shows every action inline and no menu', async ({authenticatedPage: page}) => {
		await page.setViewportSize({width: 1920, height: 1080})
		const [project] = await ProjectFactory.create(1)
		await createDefaultViews(project.id)
		const [task] = await TaskFactory.create(1, {project_id: project.id})
		await page.goto(`/tasks/${task.id}`)

		const toolbar = page.locator('.comments .editor-toolbar')
		await expect(toolbar).toBeVisible()
		await expect(toolbar.getByRole('button', {name: MORE})).toHaveCount(0)
		await expect(toolbar.locator('button.editor-toolbar__button:visible')).toHaveCount(ACTION_COUNT)
		expect(await rowCount(toolbar)).toBe(1)
	})

	test('an active format in the menu shows as checked', async ({authenticatedPage: page}) => {
		await page.setViewportSize({width: 420, height: 900})
		const [project] = await ProjectFactory.create(1)
		await createDefaultViews(project.id)
		const [task] = await TaskFactory.create(1, {project_id: project.id})
		await page.goto(`/tasks/${task.id}`)

		const comments = page.locator('.comments')
		const toolbar = comments.locator('.editor-toolbar')
		const more = toolbar.getByRole('button', {name: MORE})
		await comments.locator('.tiptap[contenteditable="true"]').fill('Quote me')

		await more.click()
		const quote = toolbar.getByRole('menuitemcheckbox', {name: 'Quote'})
		await expect(quote).toHaveAttribute('aria-checked', 'false')
		await quote.click()

		await more.click()
		await expect(quote).toHaveAttribute('aria-checked', 'true')
		await expect(quote.locator('.editor-toolbar__menu-check')).toBeVisible()
		// Text is "active" in any plain paragraph; as a non-toggle it must never look selected.
		const text = toolbar.getByRole('menuitem', {name: 'Text', exact: true})
		await expect(text.locator('.editor-toolbar__menu-check')).toHaveCount(0)
	})

	test('the More button is part of the keyboard toolbar', async ({authenticatedPage: page}) => {
		await page.setViewportSize({width: 700, height: 900})
		const [project] = await ProjectFactory.create(1)
		await createDefaultViews(project.id)
		const [task] = await TaskFactory.create(1, {project_id: project.id})
		await page.goto(`/tasks/${task.id}`)

		const toolbar = page.locator('.comments .editor-toolbar')
		const more = toolbar.getByRole('button', {name: MORE})
		await toolbar.locator('button.editor-toolbar__button').first().focus()

		// End moves to the last toolbar button, which is More.
		await page.keyboard.press('End')
		await expect(more).toBeFocused()
		await expect(toolbar.locator('button[tabindex="0"]')).toHaveCount(1)

		await page.keyboard.press('Enter')
		const items = toolbar.locator('.dropdown-menu .dropdown-item')
		await expect(items.first()).toBeFocused()
		await page.keyboard.press('ArrowDown')
		await expect(items.nth(1)).toBeFocused()

		await page.keyboard.press('Escape')
		await expect(items.first()).toBeHidden()
		await expect(more).toBeFocused()
	})
})
