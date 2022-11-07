// Types
import type { DefaultResponse } from "~~/common/fetchModule"
import type { BodyFetch } from "~~/models/body.model"
import { Author } from "~~/models/library/author.model"
import type { Book } from "~~/models/library/book.model"
import type { Editorial } from "~~/models/library/editorial.model"
import type { Tag } from "~~/models/library/tag.model"
import type { User } from "~~/models/user/user.model"

export type BookFilters = {
    alphebet?: 'asc' | 'desc'
    ranking?: string
    added?: 'desc' | 'asc'
    author?: string
    category?: string
    editorial?: string
    saved?: boolean
}
// Modules
import { serialize } from 'object-to-formdata'
// Utils
import validator from "~~/utils/validator"

export class LibraryService {
    private readonly authStore = useAuthStore()
    private readonly toastStore = useToastsStore()
    private readonly nuxtApp = useNuxtApp()
    private readonly LIMIT = 20

    async getTags() {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            tags: Array<Tag>
        }> & DefaultResponse>({
            method: 'get',
            URL: `/api/l/tags/get_tags`,
            token: this.authStore.getToken,
            spinnerStatus: true,
        })
        return dataFetch.body.tags
    }

    async getLibrarians() {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            librarians: {
                users: Array<User>
            }
        }> & DefaultResponse>({
            method: 'get',
            URL: `/api/library/get_librarians`,
            token: this.authStore.getToken,
            spinnerStatus: true,
        })
        
        return dataFetch.body.librarians.users
    }

    async getEditorials() {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            editorials: Array<Editorial>
        }> & DefaultResponse>({
            method: 'get',
            URL: `/api/l/editorials/get_editorials`,
            token: this.authStore.getToken,
            spinnerStatus: true,
        })
        return dataFetch.body.editorials
    }

    async getBooks(
        total = false,
        skip?: number,
        search?: string,
        filters?: BookFilters,
    ) {
        let URL = `/api/l/books/get_books?total=${total}&limit=${this.LIMIT}`
        if (search) URL += `&search=${search}`
        if (skip && skip >= 0) URL += `&skip=${skip}`
        if (filters?.alphebet) URL += `&alphabet=${filters.alphebet}`
        if (filters?.ranking) URL += `&ranking=${filters.ranking}`
        if (filters?.added) URL += `&added=${filters.added}`
        if (filters?.author) URL += `&author=${filters.author}`
        if (filters?.category) URL += `&category=${filters.category}`
        if (filters?.editorial) URL += `&editorial=${filters.editorial}`
        if (filters?.saved) URL += `&saved=true`
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            books: { total: number; books: Array<Book> }
        }> & DefaultResponse>({
                method: 'get',
                URL,
                token: this.authStore.getToken,
                spinnerStatus: true,
                abort: {
                    url: 'same',
                },
            })
        return dataFetch.body.books
    }

    async getBook(idBook: string) {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            book: Book
        }> & DefaultResponse>({
            method: 'get',
            URL: `/api/l/books/get_book/${idBook}`,
            token: this.authStore.getToken,
        })
        return dataFetch.body.book
    }

    async getAuthors() {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            authors: Array<Author>
        }> & DefaultResponse>({
            method: 'get',
            URL: `/api/l/authors/get_authors`,
            token: this.authStore.getToken,
        })
        return dataFetch.body.authors
    }

    async getAuthor(idAuthor: string) {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            author: Author
        }> & DefaultResponse>({
            method: 'get',
            URL:`/api/l/authors/get_author/${idAuthor}`,
            token: this.authStore.getToken,
        })
        return dataFetch.body.author
    }
    // Librarian
    private validatorsLibrarian(formDirective: User) {
        if (formDirective.name === '' || formDirective.name.length > 100)
            throw new Error('Debe existir un nombre de máx. 100 carac.')
        if (formDirective.first_lastname === '' || formDirective.first_lastname.length > 100)
            throw new Error('Debe existir un apellido paterno de máx. 100 carac.')
        if (formDirective.second_lastname === '' || formDirective.second_lastname.length > 100)
            throw new Error('Debe existir un apellido materno de máx. 100 carac.')
        if (formDirective.rut.length < 10 || !validator.rutValidator(formDirective.rut))
            throw new Error('Debe existir un RUT en formato 12345678-9 (Mín. 10 carac.)')
    }

    async uploadLibrarian(librarian: User) {
        try {
            this.validatorsLibrarian(librarian)
            const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
                librarian: User
            }> & DefaultResponse>({
                method: 'post',
                URL: `/api/library/new_librarian`,
                body: librarian,
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            
            this.toastStore.addToast({
                message: 'Se ha agregado el bibliotecario exitosamente',
                type: 'success',
            })
            return dataFetch.body.librarian
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
        }
    }
    
    async editLibrarian(librarian: User, idLibrarian: string) {
        try {
            this.validatorsLibrarian(librarian)
            await this.nuxtApp.$fetchModule.fetchData({
                method: 'put',
                URL: `/api/library/edit_librarian/${idLibrarian}`,
                body: librarian,
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            
            this.toastStore.addToast({
                message: 'Se ha editado con éxito el bibliotecario',
                type: 'success',
            })
            return librarian
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
        }
    }
    // Books
    private validateBook(book: Book | Omit<Omit<Book & { tags: Array<string> }, '_id'>, 'image'>) {
        if (book.name === '' || book.name.length > 150)
            throw new Error('Debe existir un nombre de libro de máx. 150 cárac.')
        if (book.synopsis === '' || book.synopsis.length > 500)
            throw new Error('Debe existir una sinopsis de máx. 150 cárac.')
        if (book.tags.length === 0)
            throw new Error('Tiene que seleccionar al menos una categoria')
        if (book.author === '')
            throw new Error('Tiene que seleccionar un autor')
        if (book.editorial === '')
            throw new Error('Tiene que seleccionar una editorial')
    }

    private buildDataBook(
        book: Book,
        filesImg: FileList | null,
        filesBook: FileList | null,
    ) {
        let form = new FormData()
        form.append('name', book.name)
        form.append('synopsis', book.synopsis)
        form = serialize(
            (book.tags as Array<Tag>).map((t) => t._id),
            { indices: true },
            form,
            'tags',
        )
        form.append('author', (book.author as Author)._id)
        form.append('editorial', (book.editorial as Editorial)._id)
        if (filesImg && filesImg?.length > 0)
            form.append('image', filesImg[0])
        if (filesBook && filesBook?.length > 0) form.append('book', filesBook[0])
        return form
    }

    private buildDataUploadBook(
        book: Omit<Omit<Book & { tags: Array<string> }, '_id'>, 'image'>,
        filesImg: FileList | null,
        filesBook: FileList | null,
    ) {
		let form = new FormData()
		form.append('name', book.name)
		form.append('synopsis', book.synopsis)
		form = serialize(book.tags, { indices: true }, form, 'tags')
		form.append('author', book.author.toString())
		form.append('editorial', book.editorial.toString())
		if (filesImg) form.append('image', filesImg[0])
		if (filesBook) form.append('book', filesBook[0])
		return form
	}

    async uploadBook(
        book: Omit<Omit<Book & { tags: Array<string> }, '_id'>, 'image'>,
        filesImg: FileList | null,
        filesBook: FileList | null,
    ) {
        try {
            if (!filesImg || filesImg.length === 0)
                throw new Error('Debe seleccionar una imagen para el libro')
            if (filesBook?.length === 0)
                throw new Error('Debe seleccionar un PDF Con el libro')
            this.validateBook(book)
            await this.nuxtApp.$fetchModule.fetchData({
                method: 'post',
                token: this.authStore.getToken,
                URL: `/api/l/books/upload_book`,
                body: this.buildDataUploadBook(
                    book,
                    filesImg,
                    filesBook,
                ),
                spinnerStatus: true,
            })
            this.toastStore.addToast({
                message: 'Se ha subido el libro exitosamente',
                type: 'success',
            })
            return true
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
            return false
        }
    }

    async updateBook(
        book: Book,
        filesImg: FileList | null,
        filesBook: FileList | null,
    ) {
        try {
            this.validateBook(book)
            await this.nuxtApp.$fetchModule.fetchData({
                method: 'post',
                URL: `/api/l/books/update_book/${book._id}`,
                body: this.buildDataBook(book, filesImg, filesBook),
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            this.toastStore.addToast({
                message: 'Se ha editado el libro exitosamente',
                type: 'success',
            })
            return true
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
            return false
        }
    }

    async deleteBook(idBook: string) {
        try {
            await this.nuxtApp.$fetchModule.fetchData({
                method: 'delete',
                URL: `/api/l/books/delete_book/${idBook}`,
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            this.toastStore.addToast({
                message: 'Se ha eliminado el libro exitosamente',
                type: 'success',
            })
            return true
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
            return false
        }
    }
    // Tags
    async uploadCategory(tag: string) {
        try {
            if (tag === '' || tag.length > 100)
                throw new Error('Debe existir una categoria de máx. 100 cárac.')
            const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
                tag: Tag
            }> & DefaultResponse>({
                method: 'post',
                URL: `/api/l/tags/new_tag`,
                body: { tag },
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            
            this.toastStore.addToast({
                message: 'Se ha subido la categoria exitosamente',
                type: 'success',
            })
            return dataFetch.body.tag
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
        }
    }

    async deleteTag(idTag: string) {
        try {
            await this.nuxtApp.$fetchModule.fetchData({
                method: 'delete',
                URL: `/api/l/tags/delete_tag/${idTag}`,
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            
            this.toastStore.addToast({
                message: 'Se ha eliminado la categoria exitosamente',
                type: 'success',
            })
            return true
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
            return false
        }
    }
    // Editorial
    async uploadEditorial(editorial: string, files: FileList | null) {
        try {
            if (editorial === '' || editorial.length > 100)
                throw new Error('Debe existir una editorial de máx. 100 cárac.')
            if (!files || files.length === 0) throw new Error('Debe seleccionar una imágen')
            const form = new FormData()
            form.append('editorial', editorial)
            form.append('image', files[0])

            const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
                editorial: Editorial
            }> & DefaultResponse>({
                method: 'post',
                URL: `/api/l/editorials/upload_editorial`,
                body: form,
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            
            this.toastStore.addToast({
                message: 'Se ha agregado la editorial exitosamente',
                type: 'success',
            })
            return dataFetch.body.editorial
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
        }
    }

    async updateEditorial(editorial: string, files: FileList | null, idEditorial: string) {
        try {
            console.log(idEditorial)
            if (editorial.length > 100) throw new Error('La editorial debe tener máx. 100 cárac.')
            const form = new FormData()
            form.append('editorial', editorial)
            if (files && files?.length > 0) form.append('image', files[0])
            const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
                image: string
            }> & DefaultResponse>({
                method: 'put',
                URL: `/api/l/editorials/update_editorial/${idEditorial}`,
                body: form,
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            this.toastStore.addToast({
                message: 'Se ha actualizado la editorial exitosamente',
                type: 'success',
            })
            
            return dataFetch.body.image
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
        }
    }

    async deleteEditorial(idEditorial: string) {
        try {
            await this.nuxtApp.$fetchModule.fetchData({
                method: 'delete',
                URL: `/api/l/editorials/delete_editorial/${idEditorial}`,
                token: this.authStore.getToken,
                spinnerStatus: true,
            })
            this.toastStore.addToast({
                message: 'Se ha eliminado la editorial exitosamente',
                type: 'success',
            })
            return true
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
            return false
        }
    }
    // Authors
    private validateAuthor(author: Omit<Omit<Author, '_id'>, 'date_update'>) {
        if (author.name === '' || author.name.length > 200)
            throw new Error('Debe existir un nombre de autor de máx. 200 cárac.')
        if (author.biography === '' || author.biography.length > 1500)
            throw new Error('Debe existir una biografía de máx. 1500 cárac.')
        if (author.table_info.length === 0)
            throw new Error('La tabla de información no puede estar vacía')
        author.table_info.forEach((item, i) => {
            if (item.key === '' || item.key.length > 50)
                throw new Error(`Debe existir un titulo para la tabla de información ${i+1} de máx. 50 cárac.`)
            if (item.value === '' || item.value.length > 100)
                throw new Error(`Debe existir un valor para la tabla de información ${i+1} de máx. 100 cárac.`)
        })
        if (author.fun_facts.length === 0)
            throw new Error('La sección de datos curiosos no puede estar vacía')
        author.fun_facts.forEach((fact, i) => {
            if (fact.title === '' || fact.title.length > 100)
                throw new Error(`Debe existir un titulo para los datos curiosos ${i+1} de máx. 100 cárac.`)
            if (fact.fact === '' || fact.fact.length > 500)
                throw new Error(`Debe existir un dato curioso para los datos curiosos ${i+1} de máx. 500 cárac.`)
        })
        author.references.forEach((reference, i) => {
            if (reference === '')
                throw new Error(`La referencia ${i+1} no puede estar vacía`)
        })
    }

    private buildDataAuthor(author: Omit<Omit<Author, '_id'>, 'date_update'>, files: FileList | null) {
        let form = new FormData()
        form.append('name', author.name)
        form.append('biography', author.biography)
        form = serialize(author.table_info, { indices: true }, form, 'table_info')
        form = serialize(author.fun_facts, { indices: true }, form, 'fun_facts')
        if (author.references.length > 0)
            form = serialize(author.references, { indices: true }, form, 'references')
        if (files) form.append('image', files[0])
        return form
    }

    async uploadAuthor(author: Omit<Omit<Author, '_id'>, 'date_update'>, files: FileList | null) {
        try {
            if (!files || files.length === 0)
                throw new Error('Debe seleccionar una imagen para el autor')
            this.validateAuthor(author)
            await this.nuxtApp.$fetchModule.fetchData({
                method: 'post',
                URL: `/api/l/authors/upload_author`,
                body: this.buildDataAuthor(author, files),
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            this.toastStore.addToast({
                message: 'Se ha subido el autor exitosamente',
                type: 'success',
            })
            return true
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
            return false
        }
    }

    private buildDataUpdateAuthor(author: Author, files: FileList | null) {
        let form = new FormData()
        form.append('name', author.name)
        form.append('biography', author.biography)
        form = serialize(author.table_info, { indices: true }, form, 'table_info')
        form = serialize(author.fun_facts, { indices: true }, form, 'fun_facts')
        if (author.references.length > 0)
            form = serialize(author.references, { indices: true }, form, 'references')
        if (files && files.length > 0) form.append('image', files[0])
        return form
    }
    
    async updateAuthor(author: Author, files: FileList | null) {
        try {
            this.validateAuthor(author)
            await this.nuxtApp.$fetchModule.fetchData({
                method: 'put',
                URL: `/api/l/authors/update_author/${author._id}`,
                body: this.buildDataUpdateAuthor(author, files),
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            
            this.toastStore.addToast({
                message: 'Se ha editado el autor exitosamente',
                type: 'success',
            })
            return true
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
            return false
        }
    }

    async saveBook(idBook: string) {
        try {
            await this.nuxtApp.$fetchModule.fetchData({
                method: 'post',
                URL: `/api/l/books/save_book/${idBook}`,
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            return true
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
            return false
        }
    }

    async uploadRanking(opinion: string, idBook: string) {
        try {
            await this.nuxtApp.$fetchModule.fetchData({
                method: 'post',
                URL: `/api/l/books/rank_book/${idBook}`,
                spinnerStatus: true,
                body: { ranking: opinion },
                token: this.authStore.getToken,
            })
            this.toastStore.addToast({
                message: '¡Gracias por tu opinión!',
                type: 'success',
            })
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
        }
    }

    async deleteAuthor(idAuthor: string) {
        try {
            await this.nuxtApp.$fetchModule.fetchData({
                method: 'delete',
                URL: `/api/l/authors/delete_author/${idAuthor}`,
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            this.toastStore.addToast({
                message: 'Se ha eliminado el autor exitosamente',
                type: 'success',
            })
            return true
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
            return false
        }
    }
}
