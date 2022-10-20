<script setup lang="ts">
// Types
type Link = {
    title: string
    link: string
}
type DeleteMe = (index: number) => void

// Props
const { link, edit, deleteMe, minimalist } = defineProps<{
    link: Link
    edit?: boolean
    deleteMe?: DeleteMe
    minimalist?: boolean
}>()
</script>

<template>
    <article v-if="!minimalist" class="Link">
        <NuxtLink
            class="LinkA"
            :to="link.link"
            target="_blank"
            rel="noopener noreferrer" 
        >
            <header>
                <i class="fa-solid fa-link" />
            </header>
            <div class="Link__content">
                <h3>{{ link.title }}</h3>
                <small>{{ link.link }}</small>
            </div>
        </NuxtLink>
        <aside v-if="edit">
            <HTMLButtonIcon :click="deleteMe" classItem="fa-solid fa-xmark" />
        </aside>
    </article>
    <NuxtLink
        v-else
        :to="link.link"
        target="_blank"
        rel="noopener noreferrer"
    >
        <article class="LinkMin">
            <span>┈</span>
            <i class="fa-solid fa-link" />
            <h4>{{ link.title }}</h4>
        </article>
    </NuxtLink>
</template>

<style scoped>
	.LinkA {
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
	}

	a {
		text-decoration: none;
		width: fit-content;
	}

	.Link {
		cursor: pointer;
		width: 100%;
		max-width: 500px;
		border: 2px solid var(--color-light);
		border-radius: 5px;
		position: relative;
	}

	a:hover h3 {
		color: var(--color-main);
	}

	header {
		padding: 14px;
		border-right: 2px solid var(--color-light);
	}

	h3 {
		transition: all 0.4s ease;
	}

	i {
		color: var(--color-main);
		font-size: 1.2rem;
	}

	.Link__content {
		display: flex;
		flex-direction: column;
		padding: 10px;
		width: 100%;
	}

	.Link__content small {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		max-width: 60ch;
	}

	aside {
		position: absolute;
		right: 10px;
		top: 20px;
	}

	.LinkMin {
		display: flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		width: fit-content;
	}

	.LinkMin i {
		font-size: 1rem;
	}

	.LinkMin:hover h4 {
		color: var(--color-main);
	}

	.LinkMin h4 {
		transition: all 0.4s;
	}
</style>
