<template>
    <section class="Admin">
        <AdminMenu />

        <slot />
    </section>
</template>

<style lang="scss">
	.Admin {
		width: 100%;
		box-sizing: border-box;
		padding: 30px;
		display: flex;
	}

	// Media queries
	@media (max-width: 767.98px) {
		.Admin {
			padding: 10px;
		}

		h2 {
			font-size: 1.2rem;
		}

		h3 {
			font-size: 1.1rem;
		}

		h4 {
			font-size: 0.95rem;
		}
	}

	@media (max-width: 575.98px) {
		.Admin {
			padding: 5px;
		}

		h2 {
			font-size: 1.15rem;
		}

		h3 {
			font-size: 1rem;
		}

		h4 {
			font-size: 0.9rem;
		}
	}
</style>
