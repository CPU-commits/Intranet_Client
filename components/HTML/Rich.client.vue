<!-- eslint-disable vue/require-default-prop -->
<!-- eslint-disable import/no-named-as-default -->
<script setup lang="ts">
// Tiptap
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Youtube from '@tiptap/extension-youtube'
import CodeBlockLowLight from '@tiptap/extension-code-block-lowlight'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
// Modules
import { lowlight } from 'lowlight'
import { Editor } from '@tiptap/core'
// Stores
const toasts = useToastsStore()
// Fetch module
const { $fetchModule } = useNuxtApp()

// Props
const props = withDefaults(
	defineProps<{
		body?: string
		readOnly?: boolean
		haveBackground?: boolean
		placeholder?: string
		fnBeforeMount?: () => any
		fnFocusDown?: () => any
	}>(),
	{
		body: '',
		readOnly: false,
		haveBackground: true,
		placeholder: 'Escribe algo...',
	},
)
// Emits
const emits = defineEmits<{
	(e: 'buildEditor', editor: Editor): void
}>()

const editorElement = ref<HTMLElement | null>(null)
// Editor tiptap
const editor = useEditor({
	extensions: [
		StarterKit.configure({
			blockquote: {
				HTMLAttributes: {
					class: 'ProseMirrorBlockquote',
				},
			},
			codeBlock: false,
		}),
		CharacterCount,
		Image.configure({
			allowBase64: true,
		}),
		Link.configure({
			validate: (href) => /^https?:\/\//.test(href),
		}),
		Placeholder.configure({
			placeholder: props.placeholder,
		}),
		Subscript,
		Superscript,
		Table.configure({
			HTMLAttributes: {
				class: 'ProseMirrorTable',
			},
		}),
		TableCell,
		TableHeader,
		TableRow,
		TaskItem,
		TaskList.configure({
			HTMLAttributes: {
				class: 'PromiseMirrorTaskList',
			},
		}),
		TextAlign.configure({
			types: ['heading', 'paragraph'],
		}),
		Underline,
		Youtube.configure({
			inline: true,
			nocookie: true,
		}),
		CodeBlockLowLight.configure({
			lowlight,
			HTMLAttributes: {
				class: 'PromiseMirrorCode',
			},
		}),
		TextStyle,
		Color,
	],
	editorProps: {
		handleDOMEvents: {
			focusout: () => {
				if (props.fnFocusDown) props.fnFocusDown()
			},
		},
		attributes: {
			class:
				!props.haveBackground && props.readOnly
					? 'ProseMirrorNoBackground'
					: '',
		},
	},
	onCreate: (propsEditor) => {
		// Emit build
		emits('buildEditor', propsEditor.editor)
		// Functions
		if (props.fnBeforeMount) props.fnBeforeMount()
		if (editor?.value?.options.editorProps?.handleDOMEvents)
			editor.value.options.editorProps.handleDOMEvents.focusout = () => {
				if (props.fnFocusDown) props.fnFocusDown()
			}
	},
	content: props.body,
	autofocus: true,
	editable: !props.readOnly,
})

onMounted(async () => {
	await nextTick()
	if (editorElement.value)
		if (!props.haveBackground) {
			editorElement.value.style.setProperty('--background', 'transparent')
			editorElement.value.style.setProperty('--box-shadow', 'transparent')
			editorElement.value.style.setProperty('--padding', '0')
		} else {
			if (useColorMode().value === 'dark')
				editorElement.value.style.setProperty(
					'--background',
					'var(--color-main-dark-contrast)',
				)
			else
				editorElement.value.style.setProperty(
					'--background',
					'var(--color-main-light-contrast)',
				)
			editorElement.value.style.setProperty('--padding', '15px')
		}
})

/*
onUpdated(() => {
	if (body !== '' && editor.value) editor.value.commands.setContent(body)
})
*/

// Image
// Image Modal
const imageModal = ref(false)
const toggleModalImage = () => (imageModal.value = !imageModal.value)
// Form
const src = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

function blobToBase64(blob: Blob) {
	return new Promise((resolve) => {
		const reader = new FileReader()
		reader.onloadend = () => resolve(reader.result)
		reader.readAsDataURL(blob)
	})
}

async function addImage() {
	try {
		if (
			fileInput.value?.files &&
			fileInput.value.files.length === 1 &&
			editor
		) {
			const file = fileInput.value.files[0]
			if (!file.type.includes('image'))
				throw new Error('Debe seleccionar una imagen')
			const base64 = await blobToBase64(file)
			editor?.value
				?.chain()
				.focus()
				.setImage({
					src: base64 as string,
				})
				.run()
		}
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		toasts.addToast({
			message: _err.message,
			type: 'error',
		})
	}
}

function addUrlImage() {
	if (editor)
		editor?.value
			?.chain()
			.focus()
			.setImage({
				src: src.value,
			})
			.run()
	imageModal.value = false
}

// Link
// Link modal
const linkModal = ref(false)
const toggleModalLink = () => (linkModal.value = !linkModal.value)
// Form
const href = ref('')

function setLink() {
	// empty
	if (href.value === '') {
		editor?.value?.chain().focus().extendMarkRange('link').unsetLink().run()

		return
	}

	// update link
	editor?.value
		?.chain()
		.focus()
		.extendMarkRange('link')
		.setLink({
			href: href.value,
			target: '_blank',
		})
		.run()

	linkModal.value = false
}
// Youtube
// YoutubeModal
const youtubeModal = ref(false)
const toggleModalYoutube = () => (youtubeModal.value = !youtubeModal.value)
// Form
const srcYoutube = ref('')

function setYoutube() {
	editor?.value?.commands.setYoutubeVideo({
		src: srcYoutube.value,
	})
}

function getValue(e: Event) {
	const target = e.target as HTMLInputElement
	return target.value
}
</script>

<template>
	<section ref="editorElement" class="Editor">
		<header v-if="!readOnly" class="Editor__header">
			<!-- Heading -->
			<HTMLButtonRichInput
				:click="
					() =>
						editor
							?.chain()
							.focus()
							.toggleHeading({ level: 1 })
							.run()
				"
				:selected="editor?.isActive('heading', { level: 1 })"
				title="Titulo 1"
			>
				<i class="fa-solid fa-heading" />
				<span class="HNumber">1</span>
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="
					() =>
						editor
							?.chain()
							.focus()
							.toggleHeading({ level: 2 })
							.run()
				"
				:selected="editor?.isActive('heading', { level: 2 })"
				title="Titulo 2"
			>
				<i class="fa-solid fa-heading" />
				<span class="HNumber">2</span>
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="
					() =>
						editor
							?.chain()
							.focus()
							.toggleHeading({ level: 3 })
							.run()
				"
				:selected="editor?.isActive('heading', { level: 3 })"
				title="Titulo 3"
			>
				<i class="fa-solid fa-heading" />
				<span class="HNumber">3</span>
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="
					() =>
						editor
							?.chain()
							.focus()
							.toggleHeading({ level: 4 })
							.run()
				"
				:selected="editor?.isActive('heading', { level: 4 })"
				title="Titulo 4"
			>
				<i class="fa-solid fa-heading" />
				<span class="HNumber">4</span>
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="
					() =>
						editor
							?.chain()
							.focus()
							.toggleHeading({ level: 5 })
							.run()
				"
				:selected="editor?.isActive('heading', { level: 5 })"
				title="Titulo 5"
			>
				<i class="fa-solid fa-heading" />
				<span class="HNumber">5</span>
			</HTMLButtonRichInput>
			<!-- Paragraph -->
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().setParagraph().run()"
				:selected="editor?.isActive('paragraph')"
				title="Parrafo"
			>
				<i class="fa-solid fa-p" />
			</HTMLButtonRichInput>
			|
			<!-- Color -->
			<HTMLButtonRichInput :click="() => {}" title="Color texto">
				<i class="fa-solid fa-paint-roller" />
			</HTMLButtonRichInput>
			<input
				type="color"
				:value="editor?.getAttributes('textStyle').color ?? '#3d3d3d'"
				@input="
					(event) =>
						editor?.chain().focus().setColor(getValue(event)).run()
				"
			/>
			|
			<!-- Bold -->
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().toggleBold().run()"
				:selected="editor?.isActive('bold')"
				title="Negrita"
			>
				<i class="fa-solid fa-bold" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().toggleItalic().run()"
				:selected="editor?.isActive('italic')"
				title="Italica"
			>
				<i class="fa-solid fa-italic" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().toggleStrike().run()"
				:selected="editor?.isActive('strikethrough')"
				title="Tachado"
			>
				<i class="fa-solid fa-strikethrough" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().toggleUnderline().run()"
				:selected="editor?.isActive('underline')"
				title="Subrayado"
			>
				<i class="fa-solid fa-underline" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().toggleSubscript().run()"
				:selected="editor?.isActive('subscript')"
				title="Subíndice"
			>
				<i class="fa-solid fa-subscript" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().toggleSuperscript().run()"
				:selected="editor?.isActive('superscript')"
				title="Superíndice"
			>
				<i class="fa-solid fa-superscript" />
			</HTMLButtonRichInput>
			|
			<!-- Blockquote -->
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().toggleBlockquote().run()"
				:selected="editor?.isActive('blockquote')"
				title="Cita"
			>
				<i class="fa-solid fa-quote-left" />
			</HTMLButtonRichInput>
			|
			<!-- Align -->
			<HTMLButtonRichInput
				:click="
					() => editor?.chain().focus().setTextAlign('left').run()
				"
				:selected="editor?.isActive({ textAlign: 'left' })"
				title="Izquierda"
			>
				<i class="fa-solid fa-align-left" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="
					() => editor?.chain().focus().setTextAlign('center').run()
				"
				:selected="editor?.isActive({ textAlign: 'center' })"
				title="Derecha"
			>
				<i class="fa-solid fa-align-center" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="
					() => editor?.chain().focus().setTextAlign('right').run()
				"
				:selected="editor?.isActive({ textAlign: 'right' })"
				title="Centrado"
			>
				<i class="fa-solid fa-align-right" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="
					() => editor?.chain().focus().setTextAlign('justify').run()
				"
				:selected="editor?.isActive({ textAlign: 'justify' })"
				title="Justificado"
			>
				<i class="fa-solid fa-align-justify" />
			</HTMLButtonRichInput>
			|
			<!-- Lists -->
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().toggleBulletList().run()"
				:selected="editor?.isActive('bulletList')"
				title="Lista desordenada"
			>
				<i class="fa-solid fa-list" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().toggleOrderedList().run()"
				:selected="editor?.isActive('orderedList')"
				title="Lista ordenada"
			>
				<i class="fa-solid fa-list-ol" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().toggleTaskList().run()"
				:selected="editor?.isActive('taskList')"
				title="Lista de tareas"
			>
				<i class="fa-solid fa-list-check" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="
					() => editor?.chain().focus().sinkListItem('listItem').run()
				"
				:disabled="!editor?.can().sinkListItem('listItem')"
				title="Adentrar lista"
			>
				<i class="fa-solid fa-angles-right" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="
					() => editor?.chain().focus().liftListItem('listItem').run()
				"
				:disabled="!editor?.can().liftListItem('listItem')"
				title="Retroceder lista"
			>
				<i class="fa-solid fa-angles-left" />
			</HTMLButtonRichInput>
			|
			<!-- Table -->
			<HTMLButtonRichInput
				:click="
					() =>
						editor
							?.chain()
							.focus()
							.insertTable({
								rows: 3,
								cols: 3,
								withHeaderRow: true,
							})
							.run()
				"
				title="Crear tabla"
			>
				<i class="fa-solid fa-table" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().addColumnBefore().run()"
				title="Añadir columna a la izquierda"
			>
				<i class="fa-solid fa-diagram-successor" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().addColumnAfter().run()"
				title="Añadir columna a la derecha"
			>
				<i class="fa-solid fa-diagram-predecessor" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().addRowAfter().run()"
				title="Añadir fila"
			>
				<i class="fa-solid fa-diagram-next" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().deleteColumn().run()"
				title="Eliminar columna"
			>
				<i class="fa-solid fa-minus" />
				<i class="fa-solid fa-table-columns" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().deleteRow().run()"
				title="Eliminar fila"
			>
				<i class="fa-solid fa-minus" />
				<i class="fa-solid fa-table-cells-large" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().deleteTable().run()"
				title="Eliminar tabla"
			>
				<i class="fa-solid fa-minus" />
				<i class="fa-solid fa-table" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="
					() => editor?.chain().focus().toggleHeaderColumn().run()
				"
				title="Encabezar columna"
			>
				<i class="fa-solid fa-heading" />
				<i class="fa-solid fa-table-columns" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().toggleHeaderRow().run()"
				title="Encabezar fila"
			>
				<i class="fa-solid fa-heading" />
				<i class="fa-solid fa-table-cells-large" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().toggleHeaderCell().run()"
				title="Encabezar celda"
			>
				<i class="fa-solid fa-heading" />
				<i class="fa-solid fa-square" />
			</HTMLButtonRichInput>
			|
			<!-- Code -->
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().toggleCodeBlock().run()"
				:selected="editor?.isActive('codeBlock')"
			>
				<i class="fa-solid fa-code" />
			</HTMLButtonRichInput>
			<!-- Image -->
			<HTMLButtonRichInput
				:click="() => fileInput?.click()"
				title="Añadir imagen"
			>
				<i class="fa-solid fa-file-image" />
			</HTMLButtonRichInput>
			<input
				ref="fileInput"
				type="file"
				accept="image/png, image/gif, image/jpeg"
				@change="addImage"
			/>
			<HTMLButtonRichInput
				:click="toggleModalImage"
				title="Añadir imagen desde URL"
			>
				<i class="fa-solid fa-image" />
			</HTMLButtonRichInput>
			<!-- Link -->
			<HTMLButtonRichInput :click="toggleModalLink" title="Añadir enlace">
				<i class="fa-solid fa-link" />
			</HTMLButtonRichInput>
			<!-- Youtube -->
			<HTMLButtonRichInput
				:click="toggleModalYoutube"
				title="Añadir video de Youtube"
			>
				<i class="fa-brands fa-youtube" />
			</HTMLButtonRichInput>
			|
			<!-- Salt -->
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().setHardBreak().run()"
				title="Salto de linea"
			>
				<i class="fa-solid fa-window-minimize" />
			</HTMLButtonRichInput>
			<!-- Rule -->
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().setHorizontalRule().run()"
				title="Linea horizontal"
			>
				<i class="fa-solid fa-ruler-horizontal" />
			</HTMLButtonRichInput>
			|
			<!-- History -->
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().undo().run()"
				:disabled="!editor?.can().undo()"
				title="Retroceder"
			>
				<i class="fa-solid fa-rotate-left" />
			</HTMLButtonRichInput>
			<HTMLButtonRichInput
				:click="() => editor?.chain().focus().redo().run()"
				:disabled="!editor?.can().redo()"
				title="Avanzar"
			>
				<i class="fa-solid fa-rotate-right" />
			</HTMLButtonRichInput>
			|
		</header>
		<editor-content :editor="editor" />

		<footer v-if="editor && !readOnly" class="Editor__footer">
			<small
				>{{
					editor.storage.characterCount.characters()
				}}
				C&aacute;racteres</small
			>
			<small>{{ editor.storage.characterCount.words() }} Palabras</small>
		</footer>

		<!-- Modals -->
		<Modal v-model:opened="imageModal">
			<template #title>
				<h2>Agregar imagen desde URL</h2>
			</template>
			<HTMLForm :form="addUrlImage">
				<label for="image">Imagen</label>
				<HTMLInput id="image" v-model:value="src" />
				<HTMLButton type="submit">Agregar</HTMLButton>
			</HTMLForm>
		</Modal>

		<Modal v-model:opened="linkModal">
			<template #title>
				<h2>Agregar enlace</h2>
			</template>
			<HTMLForm :form="setLink">
				<label for="link">Enlace</label>
				<HTMLInput id="link" v-model:value="href" />
				<HTMLButton type="submit">Agregar</HTMLButton>
			</HTMLForm>
		</Modal>

		<Modal v-model:opened="youtubeModal">
			<template #title>
				<h2>Agregar Youtube Video</h2>
			</template>
			<HTMLForm :form="setYoutube">
				<label for="youtube">Enlace</label>
				<HTMLInput id="youtube" v-model:value="srcYoutube" />
				<HTMLButton type="submit">Agregar</HTMLButton>
			</HTMLForm>
		</Modal>
	</section>
</template>

<style scoped>
.light-mode .Editor {
	box-shadow: var(--box-shadow);
}

.Editor {
	width: 100%;
	box-sizing: border-box;
	background-color: var(--background);
	border-radius: 15px;
	padding: var(--padding);
}

.Editor__header {
	padding: 10px;
	display: flex;
	gap: 10px;
	flex-wrap: wrap;
	border-bottom: 2px solid var(--color-main);
	color: var(--color-light);
}

.HNumber {
	font-size: 0.9rem;
	font-weight: bold;
	transition: all 0.4s ease;
}

i {
	font-size: 14px;
}

input[type='file'] {
	display: none;
}

input[type='color'] {
	width: 20px;
	height: 20px;
	background-color: transparent;
	border: none;
}

.Editor__footer {
	margin-top: 10px;
	display: flex;
	gap: 10px;
	padding: 10px;
}

@media (max-width: 767.98px) {
	i {
		font-size: 0.8rem;
	}

	small {
		font-size: 0.75rem;
	}

	.Editor__footer {
		margin-top: 5px;
		gap: 6px;
		padding: 8px;
	}
}

@media (max-width: 575.98px) {
	.Editor__header {
		padding: 0px;
		gap: 8px;
		padding-bottom: 5px;
	}

	i {
		font-size: 0.7rem;
	}

	small {
		font-size: 0.7rem;
	}

	.Editor__footer {
		margin-top: 0px;
		gap: 5px;
		padding: 5px;
	}
}
</style>
