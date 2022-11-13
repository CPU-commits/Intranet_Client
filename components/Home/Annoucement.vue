<script setup lang="ts">
// Types
import type { Annoucement } from '@@/models/home/annoucement.model'
import { UserTypesKeys } from '~~/models/user/user.model';
// Utils
import { formatMiniDate } from '~~/utils/format'
import { differentDates } from '~~/utils/dates'
// Props
const { annoucement } = defineProps<{
    annoucement: Annoucement
}>()
// Nuxtapp
const { $homeService } = useNuxtApp()
// Stores
const auth = useAuthStore()

// Emits
const emits = defineEmits<{
    (e: 'delete', id: string): void
}>()
// Modal
const modal = ref(false)

async function deleteAnnoucement() {
    modal.value = false
    // Delete annoucement
    const isDeleted = await $homeService.deleteAnnoucement(annoucement._id)
    if (isDeleted) emits('delete', annoucement._id)
}
</script>

<template>
    <article class="Annoucement">
        <aside v-if="auth.userTypeIs(UserTypesKeys.DIRECTIVE, UserTypesKeys.DIRECTOR)">
            <HTMLButtonIcon classItem="fa-solid fa-xmark" :click="() => modal = true" />
        </aside>
        <div class="Annoucement__body">
            <header>
                <HTMLRich
                    :readOnly="true"
                    :haveBackground="false"
                    :body="annoucement.annoucement"
                />
            </header>
            <footer class="Annoucement__body--footer">
                <section v-for="(file, i) in annoucement?.files" :key="file._id.$oid">
                    <HomeFile :file="file" />
                    <span v-if="i + 1 < annoucement.files.length">┈</span>
                </section>
            </footer>
        </div>
        <footer>
            <small>
                Publicado por
                <span class="Annoucemenet__author">
                    {{ annoucement.user.name }}
                    {{ annoucement.user.first_lastname }}
                </span>
            </small>
            <small>
                {{ formatMiniDate(annoucement.upload_date) }}
                <span v-if="differentDates(annoucement.update_date, annoucement.upload_date)">
                    (editado)
                </span>
            </small>
        </footer>
    </article>

    <!-- Modals -->
    <Modal v-model:opened="modal">
        <template #title>
            <h2>Eliminar anuncio</h2>
        </template>
        <div class="Modal__content">
            <span>¿Est&aacute; seguro de eliminar el anuncio?</span>
        </div>
        <footer class="Modal__buttons">
            <HTMLButtonText :click="deleteAnnoucement" color="var(--color-danger)">
                Eliminar anuncio
            </HTMLButtonText>
            <HTMLButtonText :click="() => modal = false">
                No, no eliminar anuncio
            </HTMLButtonText>
        </footer>
    </Modal>
</template>

<style scoped lang="scss">
	aside {
		position: absolute;
		right: 10px;
		top: 10px;
		z-index: 9;
	}

	.Annoucement {
		position: relative;
		border: 2px solid var(--color-light);
		border-radius: 5px;
		padding: 10px;
	}

	.Annoucement__body {
		margin-bottom: 10px;
        header {
            border-bottom: 1px solid var(--color-light);
        }
	}

	.Annoucement__body--footer {
		display: flex;
		margin-top: 10px;
		flex-wrap: wrap;
	}

	.Annoucement footer {
		display: flex;
		justify-content: space-between;
	}

	.Annoucemenet__author {
		color: var(--color-main);
		font-weight: bold;
	}

	.Modal__content {
		display: flex;
		width: 100%;
		justify-content: center;
	}

	.Modal__buttons {
		display: flex;
		margin-top: 10px;
	}

    @media (max-width: 575.98px) {
        .Annoucement {
            padding: 5px;
        }

        footer small {
            font-size: 0.7rem;
            width: fit-content;
        }

        footer small:last-child {
            text-align: right;
        }
    }
</style>
