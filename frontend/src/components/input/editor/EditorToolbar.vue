<template>
	<div
		ref="toolbarRef"
		class="editor-toolbar"
		role="toolbar"
		:aria-label="$t('input.editor.toolbarLabel')"
		@keydown="onToolbarKeydown"
		@focusin="onToolbarFocusin"
	>
		<div
			v-for="(segment, index) in segments"
			:key="segment[0].id"
			class="editor-toolbar__segment"
		>
			<BaseButton
				v-for="action in segment"
				:key="action.id"
				v-tooltip="$t(action.label)"
				class="editor-toolbar__button"
				:class="{ 'is-active': action.isActive?.() }"
				:aria-pressed="action.toggle ? action.isActive?.() : undefined"
				:title="action.title"
				@click="action.run"
			>
				<span class="icon">
					<Icon :icon="action.icon" />
					<span
						v-if="action.iconText"
						class="icon__lower-text"
						aria-hidden="true"
					>{{ action.iconText }}</span>
				</span>
				<span class="is-sr-only">{{ $t(action.label) }}</span>
			</BaseButton>
			<div
				v-if="tableMode && index === segments.length - 1"
				class="editor-toolbar__table-buttons"
			>
				<BaseButton
					class="editor-toolbar__button"
					@click="
						editor
							.chain()
							.focus()
							.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
							.run()
					"
				>
					{{ $t('input.editor.table.insert') }}
				</BaseButton>
				<BaseButton
					class="editor-toolbar__button"
					:disabled="!editor.can().addColumnBefore()"
					@click="editor.chain().focus().addColumnBefore().run()"
				>
					{{ $t('input.editor.table.addColumnBefore') }}
				</BaseButton>
				<BaseButton
					class="editor-toolbar__button"
					:disabled="!editor.can().addColumnAfter()"
					@click="editor.chain().focus().addColumnAfter().run()"
				>
					{{ $t('input.editor.table.addColumnAfter') }}
				</BaseButton>
				<BaseButton
					class="editor-toolbar__button"
					:disabled="!editor.can().deleteColumn()"
					@click="editor.chain().focus().deleteColumn().run()"
				>
					{{ $t('input.editor.table.deleteColumn') }}
				</BaseButton>
				<BaseButton
					class="editor-toolbar__button"
					:disabled="!editor.can().addRowBefore()"
					@click="editor.chain().focus().addRowBefore().run()"
				>
					{{ $t('input.editor.table.addRowBefore') }}
				</BaseButton>
				<BaseButton
					class="editor-toolbar__button"
					:disabled="!editor.can().addRowAfter()"
					@click="editor.chain().focus().addRowAfter().run()"
				>
					{{ $t('input.editor.table.addRowAfter') }}
				</BaseButton>
				<BaseButton
					class="editor-toolbar__button"
					:disabled="!editor.can().deleteRow()"
					@click="editor.chain().focus().deleteRow().run()"
				>
					{{ $t('input.editor.table.deleteRow') }}
				</BaseButton>
				<BaseButton
					class="editor-toolbar__button"
					:disabled="!editor.can().deleteTable()"
					@click="editor.chain().focus().deleteTable().run()"
				>
					{{ $t('input.editor.table.deleteTable') }}
				</BaseButton>
				<BaseButton
					class="editor-toolbar__button"
					:disabled="!editor.can().mergeCells()"
					@click="editor.chain().focus().mergeCells().run()"
				>
					{{ $t('input.editor.table.mergeCells') }}
				</BaseButton>
				<BaseButton
					class="editor-toolbar__button"
					:disabled="!editor.can().splitCell()"
					@click="editor.chain().focus().splitCell().run()"
				>
					{{ $t('input.editor.table.splitCell') }}
				</BaseButton>
				<BaseButton
					class="editor-toolbar__button"
					:disabled="!editor.can().toggleHeaderColumn()"
					@click="editor.chain().focus().toggleHeaderColumn().run()"
				>
					{{ $t('input.editor.table.toggleHeaderColumn') }}
				</BaseButton>
				<BaseButton
					class="editor-toolbar__button"
					:disabled="!editor.can().toggleHeaderRow()"
					@click="editor.chain().focus().toggleHeaderRow().run()"
				>
					{{ $t('input.editor.table.toggleHeaderRow') }}
				</BaseButton>
				<BaseButton
					class="editor-toolbar__button"
					:disabled="!editor.can().toggleHeaderCell()"
					@click="editor.chain().focus().toggleHeaderCell().run()"
				>
					{{ $t('input.editor.table.toggleHeaderCell') }}
				</BaseButton>
				<BaseButton
					class="editor-toolbar__button"
					:disabled="!editor.can().mergeOrSplit()"
					@click="editor.chain().focus().mergeOrSplit().run()"
				>
					{{ $t('input.editor.table.mergeOrSplit') }}
				</BaseButton>
				<BaseButton
					class="editor-toolbar__button"
					:disabled="!editor.can().fixTables()"
					@click="editor.chain().focus().fixTables().run()"
				>
					{{ $t('input.editor.table.fixTables') }}
				</BaseButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount} from 'vue'
import type {Editor} from '@tiptap/vue-3'
import type {IconProp} from '@fortawesome/fontawesome-svg-core'

import BaseButton from '@/components/base/BaseButton.vue'
import {setLinkInEditor} from '@/components/input/editor/setLinkInEditor'

const props = defineProps<{
	editor: Editor,
}>()

const emit = defineEmits(['imageUploadClicked'])

const tableMode = ref(false)

function toggleTableMode() {
	tableMode.value = !tableMode.value
}

interface ToolbarAction {
	id: string,
	label: string,
	icon: IconProp,
	iconText?: string,
	title?: string,
	// Exposes isActive as aria-pressed.
	toggle?: boolean,
	isActive?: () => boolean,
	run: (event: MouseEvent) => void,
}

const headings: ToolbarAction[] = ([1, 2, 3] as const).map(level => ({
	id: `heading${level}`,
	label: `input.editor.heading${level}`,
	icon: ['fas', 'header'],
	iconText: String(level),
	toggle: true,
	isActive: () => props.editor.isActive('heading', {level}),
	run: () => props.editor.chain().focus().toggleHeading({level}).run(),
}))

const segments: ToolbarAction[][] = [
	headings,
	[
		{
			id: 'bold',
			label: 'input.editor.bold',
			icon: ['fas', 'bold'],
			toggle: true,
			isActive: () => props.editor.isActive('bold'),
			run: () => props.editor.chain().focus().toggleBold().run(),
		},
		{
			id: 'italic',
			label: 'input.editor.italic',
			icon: ['fas', 'italic'],
			toggle: true,
			isActive: () => props.editor.isActive('italic'),
			run: () => props.editor.chain().focus().toggleItalic().run(),
		},
		{
			id: 'underline',
			label: 'input.editor.underline',
			icon: ['fas', 'underline'],
			toggle: true,
			isActive: () => props.editor.isActive('underline'),
			run: () => props.editor.chain().focus().toggleUnderline().run(),
		},
		{
			id: 'strike',
			label: 'input.editor.strikethrough',
			icon: ['fas', 'strikethrough'],
			toggle: true,
			isActive: () => props.editor.isActive('strike'),
			run: () => props.editor.chain().focus().toggleStrike().run(),
		},
	],
	[
		{
			id: 'codeBlock',
			label: 'input.editor.code',
			icon: ['fas', 'code'],
			toggle: true,
			isActive: () => props.editor.isActive('codeBlock'),
			run: () => props.editor.chain().focus().toggleCodeBlock().run(),
		},
		{
			id: 'blockquote',
			label: 'input.editor.quote',
			icon: ['fas', 'quote-right'],
			toggle: true,
			isActive: () => props.editor.isActive('blockquote'),
			run: () => props.editor.chain().focus().toggleBlockquote().run(),
		},
	],
	[
		{
			id: 'bulletList',
			label: 'input.editor.bulletList',
			icon: ['fas', 'list-ul'],
			toggle: true,
			isActive: () => props.editor.isActive('bulletList'),
			run: () => props.editor.chain().focus().toggleBulletList().run(),
		},
		{
			id: 'orderedList',
			label: 'input.editor.orderedList',
			icon: ['fas', 'list-ol'],
			toggle: true,
			isActive: () => props.editor.isActive('orderedList'),
			run: () => props.editor.chain().focus().toggleOrderedList().run(),
		},
		{
			id: 'taskList',
			label: 'input.editor.taskList',
			icon: 'list-check',
			toggle: true,
			isActive: () => props.editor.isActive('taskList'),
			run: () => props.editor.chain().focus().toggleTaskList().run(),
		},
	],
	[
		{
			id: 'image',
			label: 'input.editor.image',
			icon: 'image',
			run: event => emit('imageUploadClicked', event),
		},
	],
	[
		{
			id: 'link',
			label: 'input.editor.link',
			icon: ['fas', 'link'],
			title: 'set link',
			isActive: () => props.editor.isActive('link'),
			run: event => setLink(event),
		},
		{
			id: 'paragraph',
			label: 'input.editor.text',
			icon: ['fas', 'paragraph'],
			title: 'paragraph',
			isActive: () => props.editor.isActive('paragraph'),
			run: () => props.editor.chain().focus().setParagraph().run(),
		},
		{
			id: 'horizontalRule',
			label: 'input.editor.horizontalRule',
			icon: ['fas', 'ruler-horizontal'],
			run: () => props.editor.chain().focus().setHorizontalRule().run(),
		},
	],
	[
		{
			id: 'undo',
			label: 'input.editor.undo',
			icon: ['fas', 'undo'],
			run: () => props.editor.chain().focus().undo().run(),
		},
		{
			id: 'redo',
			label: 'input.editor.redo',
			icon: ['fas', 'redo'],
			run: () => props.editor.chain().focus().redo().run(),
		},
	],
	[
		{
			id: 'table',
			label: 'input.editor.table.title',
			icon: ['fas', 'table'],
			isActive: () => props.editor.isActive('table'),
			run: toggleTableMode,
		},
	],
]

// Roving tabindex: the toolbar is a single Tab stop and arrow keys move between
// buttons, so Tab always leaves the toolbar (to the editor content) instead of
// walking through every button.
const toolbarRef = ref<HTMLElement | null>(null)

function toolbarButtons(): HTMLButtonElement[] {
	if (!toolbarRef.value) {
		return []
	}
	return Array.from(toolbarRef.value.querySelectorAll<HTMLButtonElement>('button'))
		.filter(button => !button.disabled)
}

function setRovingTabindex(active: HTMLElement | null) {
	const buttons = toolbarButtons()
	if (buttons.length === 0) {
		return
	}
	const target = active && buttons.includes(active as HTMLButtonElement) ? active : buttons[0]
	buttons.forEach(button => {
		button.tabIndex = button === target ? 0 : -1
	})
}

function onToolbarFocusin(event: FocusEvent) {
	const target = event.target as HTMLElement
	if (target.tagName === 'BUTTON') {
		setRovingTabindex(target)
	}
}

function onToolbarKeydown(event: KeyboardEvent) {
	if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
		return
	}

	const buttons = toolbarButtons()
	if (buttons.length === 0) {
		return
	}

	event.preventDefault()

	const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement)
	const index = currentIndex === -1 ? 0 : currentIndex

	let next = index
	switch (event.key) {
		case 'ArrowRight':
			next = (index + 1) % buttons.length
			break
		case 'ArrowLeft':
			next = (index - 1 + buttons.length) % buttons.length
			break
		case 'Home':
			next = 0
			break
		case 'End':
			next = buttons.length - 1
			break
	}

	const nextButton = buttons[next]
	setRovingTabindex(nextButton)
	nextButton.focus()
}

// Buttons appear/disappear (table mode) and disable as the selection moves; re-assert the
// roving tabindex so Tab can always re-enter. Filtered to 'disabled' — we write tabindex ourselves.
let observer: MutationObserver | null = null

onMounted(() => {
	setRovingTabindex(null)
	observer = new MutationObserver(() => setRovingTabindex(document.activeElement as HTMLElement))
	if (toolbarRef.value) {
		observer.observe(toolbarRef.value, {
			subtree: true,
			childList: true,
			attributeFilter: ['disabled'],
		})
	}
})

onBeforeUnmount(() => {
	observer?.disconnect()
	observer = null
})

function setLink(event: MouseEvent) {
	setLinkInEditor((event.target as HTMLElement).getBoundingClientRect(), props.editor)
}
</script>

<style lang="scss" scoped>
.editor-toolbar {
	background: var(--white);
	border: 1px solid var(--grey-200);
	user-select: none;
	padding: .5rem;
	border-radius: $radius;
	display: flex;
	flex-wrap: wrap;

	> * + * {
		border-inline-start: 1px solid var(--grey-200);
		margin-inline-start: 6px;
		padding-inline-start: 6px;
	}
}

.editor-toolbar__button {
	min-inline-size: 2rem;
	block-size: 2rem;
	border-radius: $radius;
	border: 1px solid transparent;
	color: var(--grey-700);
	transition: all $transition;
	background: transparent;
	margin-inline-end: .25rem;

	&:hover {
		background: var(--grey-100);
		border-color: var(--grey-200);
	}

	.icon {
		position: relative;

		.icon__lower-text {
			font-size: .75rem;
			position: absolute;
			inset-block-end: -3px;
			inset-inline-end: -2px;
			font-weight: bold;
		}
	}
}

.editor-toolbar__table-buttons {
	margin-block-start: .5rem;

	> .editor-toolbar__button {
		margin-inline-end: .5rem;
		margin-block-end: .5rem;
		padding: 0 .25rem;
		border: 1px solid var(--grey-400);
		font-size: .75rem;
		block-size: 1.5rem;
	}
}
</style>
