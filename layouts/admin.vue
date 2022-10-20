<template>
    <section class="Admin">
        <AdminMenu />

        <slot />
    </section>
</template>

<style lang="scss" scoped>
	.Admin {
		width: 100%;
		box-sizing: border-box;
		padding: 30px;
		display: flex;
	}
</style>
