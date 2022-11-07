<script setup lang="ts">
import { UserTypesKeys } from '~~/models/user/user.model';

const { toggleMenu } = defineProps<{
    toggleMenu: () => void
}>()
// Stores
const auth = useAuthStore()
// Router
const route = useRoute()

const url = ref(route.path)
watch(() => route.path, (newValue) => {
	url.value = newValue
})
</script>

<template>
    <nav class="Header" :class="url.startsWith('/noticias') ? 'News' : ''">
        <section class="Header__content">
            <div class="Header__content--left">
                <button v-if="auth.getIsAuth" @click="toggleMenu" class="InvisibleButton">
                    <i class="fa-solid fa-bars" />
                </button>
                <NuxtLink class="NuxtLink" :to="auth.getIsAuth ? '/inicio' : '/'">
                    <h2>CSAH Intranet</h2>
                </NuxtLink>
            </div>
            <div class="Header__content--main" v-if="auth.isAuth">
                <ul>
                    <li v-if="(
                        auth.getUserType === UserTypesKeys.TEACHER ||
                        auth.getUserType === UserTypesKeys.STUDENT ||
                        auth.getUserType === UserTypesKeys.STUDENT_DIRECTIVE
                    )">
                        <NuxtLink class="NuxtLink" to="/aula_virtual">
                            Aula virtual
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink class="NuxtLink" to="/noticias">
                            Noticias
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink class="NuxtLink" to="/biblioteca">
                            Biblioteca
                        </NuxtLink>
                    </li>
                </ul>
            </div>
            <div class="Header__content--right">
                <Notifications v-if="auth.isAuth" />
                <NuxtLink v-if="auth.isAuth" class="NuxtLink" to="/usuario">
                    <i class="fa-solid fa-user" />
                </NuxtLink>
                <NuxtLink
                    v-if="(
                        auth.getUserType === UserTypesKeys.DIRECTOR ||
                        auth.getUserType === UserTypesKeys.DIRECTIVE ||
                        auth.getUserType === UserTypesKeys.LIBRARIAN
                    )"
                    class="NuxtLink" to="/admin"
                >
                    <i class="fa-solid fa-gear" />
                </NuxtLink>
            </div>
        </section>
    </nav>
</template>

<style lang="scss" scoped>
    .Header {
		width: 100%;
		height: 60px;
		box-shadow: rgb(71 75 255 / 10%) 0px 2px 4px;
		z-index: 10;
		background-color: white;
	}
	/* News */
	.News {
		background-color: var(--color-news-black);
		h2,
		i,
		a {
			color: white;
		}
	}

	h2,
	i {
		color: var(--color-main);
	}

	.Header__content {
		box-sizing: border-box;
		padding: 0 20px;
		width: 100%;
		height: 100%;
		justify-content: space-around;
		display: flex;
	}

	.Header__content--left {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 10px;
		width: 200px;
	}

	.Header__content--main {
		display: flex;
	}

	.Header__content--main ul {
		align-items: center;
		gap: 20px;
		list-style: none;
		display: flex;
	}

	.NuxtLink,
	button {
		background-color: transparent;
		border: none;
		font-family: 'Karla', sans-serif;
		color: var(--color-dark);
		text-decoration: none;
		i {
			font-size: 1rem;
		}
	}

	.Header__content--right {
		display: flex;
		align-items: center;
		gap: 20px;
		width: 200px;
	}

	button {
		color: var(--color-main);
		font-size: 1.1rem;
		cursor: pointer;
	}

	// Media queries
	@media (max-width: 767.98px) {
		.Header {
			height: 55px;
		}

		h2 {
			font-size: 1.4rem;
		}

		a {
			font-size: 0.95rem;
		}
	}
</style>