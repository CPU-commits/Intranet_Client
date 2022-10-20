<script setup lang="ts">
// Types
import { UserTypesKeys } from '~~/models/user/user.model'
// Stores
const auth = useAuthStore()
// Router
const route = useRoute()
</script>

<template>
    <section class="User">
        <section class="Menu">
            <ul>
                <li>
                    <HTMLAIcon
                        :active="route.path === '/usuario'"
                        href="/usuario"
                        classItem="fa-solid fa-address-card"
                    />
                </li>
                <li v-if="auth.userTypeNotIs(
                    UserTypesKeys.STUDENT,
                    UserTypesKeys.ATTORNEY,
                    UserTypesKeys.STUDENT_DIRECTIVE,
                )">
                    <HTMLAIcon
                        href="/usuario/archivos"
                        classItem="fa-solid fa-cloud"
                        :active="route.path === '/usuario/archivos'"
                    />
                </li>
                <li v-if="auth.userTypeIs(
                    UserTypesKeys.STUDENT,
                    UserTypesKeys.STUDENT_DIRECTIVE,
                )">
                    <HTMLAIcon
                        href="/usuario/calificaciones"
                        classItem="fa-solid fa-ranking-star"
                        :active="route.path === '/usuario/calificaciones'"
                    />
                </li>
            </ul>
        </section>
        <section class="Content">
            <slot name="title" />
            <br />
            <slot />
        </section>
    </section>
</template>

<style scoped>
	.User {
		display: flex;
		flex-direction: column;
		margin: 20px;
		box-sizing: border-box;
        width: 100%;
	}

	.Menu ul {
		display: flex;
		list-style: none;
		gap: 50px;
		width: 100%;
		justify-content: center;
		padding: 10px;
		box-sizing: border-box;
	}

	.Content {
		background-color: white;
		padding: 20px;
		box-shadow: var(--box-shadow);
	}
</style>
