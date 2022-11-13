<script setup lang="ts">
const menu = ref(false)
</script>

<template>
    <section class="Support">
        <HTMLButtonIcon
            :class-item="'fa-solid fa-circle-info'"
            :click="() => menu = !menu"
        >
            Menu
        </HTMLButtonIcon>
        <br />
        <SuppMenu @menu-close="() => menu = false" :menu="menu" />

        <div class="Support__content">
            <slot />
        </div>
    </section>
</template>

<style lang="scss">
    .Support {
        padding: 15px;
    }

    .Support button {
        width: min-content;
    }

    .Support__content {
        margin-bottom: 300px;

        h1 {
            color: var(--color-main);
            font-size: 1.8rem;
        }

        h2 {
            font-size: 1.2rem;
        }

        h3 {
            font-size: 1.1rem;
        }

        p {
            margin: 10px 0;
        }

        hr {
            margin-top: 5px;
            border-top: 1px solid var(--color-main);
        }

        a {
            color: var(--color-main);
        }

        ul {
            padding-left: 18px;
        }

        code {
            background-color: var(--color-light);
            border-radius: 10px;
            padding: 3px 5px;
        }

        table {
            width: 100%;
            th {
                color: var(--color-main);
                font-weight: 700;
            }
            thead {
                border-bottom: 2px solid var(--color-main);
            }
            tbody tr {
                border-bottom: 1px solid var(--color-light) ;
            }
            td {
                text-align: center;
                padding: 5px;
            }
        }
        li {
            padding: 5px;
        }
    }

    @media (max-width: 767.98px) {
        .Support__content {
            font-size: 0.9rem;

            h1 {
                font-size: 1.6rem;
            }
        }
    }

    @media (max-width: 575.98px) {
        .Support__content {
            font-size: 0.85rem;
        }
    }
</style>
