<script setup lang="ts">
// Types
import { UserFile } from '~~/models/file/file.model';
import { isValidHttpUrl } from '~~/utils/format';
// Nuxtapp
const { $fetchModule } = useNuxtApp()
// Stores
const toasts = useToastsStore()
// Emits
const emits = defineEmits<{
	(e: 'newLink', link: typeof linkObj): void
	(e: 'newFile', file: Array<UserFile>): void
}>()

// Modal
const cloud = ref(false)
const link = ref(false)
// Data
const linkObj = reactive({
    title: '',
    link: '',
})

function addLink() {
    try {
        if (linkObj.title.length < 3 || linkObj.title.length > 100)
            throw new Error('El titulo debe tener mín. 3 y máx 100 cárac.')
        if (!isValidHttpUrl(linkObj.link)) throw new Error('Debe ingresar un enlace válido')
		emits('newLink', {
			title: linkObj.title,
			link: linkObj.link,
		})

        linkObj.link = ''
		linkObj.title = ''
        link.value = false
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        toasts.addToast({
            message: _err.message,
            type: 'error',
        })
    }
}
</script>

<template>
	<div class="_Attached">
		<HTMLButtonIcon
			title="Adjuntar archivos"
			classItem="fa-solid fa-paperclip"
			:click="() => cloud = true"
		/>
		<HTMLButtonIcon
			title="Añadir enlace"
			classItem="fa-solid fa-link"
			:click="() => link = true"
		/>

		<!-- Modals -->
		<Cloud
			v-model:modal="cloud"
			@files="(files) => $emit('newFile', files)"
		/>

		<Modal v-model:opened="link">
			<template #title>
				<h2>Agregar enlace</h2>
			</template>
			<HTMLForm :form="addLink">
				<label for="title">Titulo</label>
				<HTMLInput v-model:value="linkObj.title" id="title" />
				<label for="link">Enlace</label>
				<HTMLInput v-model:value="linkObj.link" type="url" id="link" />
				<small v-if="linkObj.link.startsWith('http:')">
					<i class="fa-solid fa-bomb" /> No es un enlace seguro
				</small>
				<HTMLButton type="submit">Agregar enlace</HTMLButton>
			</HTMLForm>
		</Modal>
	</div>
</template>

<style scoped>
	._Attached {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}

	small,
	small i {
		color: white;
		padding: 3px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-danger);
		border-radius: 3px;
	}
</style>
