<template>
    <section class="Support">
        <SuppMenu />

        <div class="Support__content">
            <slot />
        </div>
    </section>
</template>

<style lang="scss">
    .Support {
        margin-top: 2px;
        display: grid;
        width: 100%;
        grid-template-columns: 300px 600px;
        gap: 30px;
        height: fit-content;
    }

    .Support__content {
        margin-bottom: 300px;
        padding-top: 10px;

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
</style>
