import { HTMLTableSmall } from "#components"
import type { Author } from "~~/models/library/author.model"
import { urlify } from "~~/utils/format"

export default defineComponent({
    data() {
        return {
            author: null as Author | null,
            Author: {
                margin: '20px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '15px',
                boxShadow: 'var(--box-shadow)',
            },
            H1: {
                fontSize: '1.7rem',
            },
            H3: {
                marginTop: '10px',
            },
            AuthorTop: {
                display: 'grid',
                gridTemplateColumns: '1fr 200px',
                gap: '20px',
            },
            Img: {
                width: '200px',
                border: '2px solid var(--color-light)',
                height: '200px',
		        objectFit: 'cover' as 'cover',
            },
        }
    },
    async setup() {
        const { $fetchModule, $libraryService } = useNuxtApp()
        const route = useRoute()

        const authorParam = route.params.author
        if (typeof authorParam !== 'string')
            throw createError({
                message: '[author] must be a string',
                statusCode: 400,
            })
        // Data
        try {
            const dataFetch = await $libraryService.getAuthor(authorParam)

            return {
                author: dataFetch,
            }
        } catch (err) {
            const _err = $fetchModule.handleError(err)
            throw createError(_err)
        }
    },
    render () {
        return (
            <section style={{
                ...this.Author,
                boxSizing: 'border-box',
            }}>
                <section style={this.AuthorTop}>
                    <header style={{ width: '100%' }}>
                        <h1 style={this.H1}>{this.author.name}</h1>
                        <pre>{this.author.biography}</pre>
                    </header>
                    <picture>
                        <img style={this.Img} src={this.author.image?.url} alt={this.author.name} />
                        <HTMLTableSmall>
                            {this.author.table_info.map(({ key, value }, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{key}</td>
                                        <td>{value}</td>
                                    </tr>
                                )
                            })}
                        </HTMLTableSmall>
                    </picture>
                </section>
                <h3 style={this.H3}>Datos curiosos</h3>
                {this.author.fun_facts.map((fact, i) => {
                    return (
                        <details style={{ padding: '8px' }} key={i}>
                            <summary>{fact.title}</summary>
                            <pre style={{
                                padding: '10px',
                                borderBottom: '2px solid var(--color-light)',
                            }}>{fact.fact}</pre>
                        </details>
                    )
                })}
                <h3 style={this.H3}><i class="fa-solid fa-book-atlas" /> Referencias</h3>
                <ol style={{ padding: '15px' }}>
                    {this.author.references.map((reference, i) => {
                        return (
                            <li innerHTML={urlify(reference)} />
                        )
                    })}
                    {this.author.references?.length === 0
                        ? <span>Sin referencias...</span>
                        : ''
                    }
                </ol>
            </section>
        )
    },
})
