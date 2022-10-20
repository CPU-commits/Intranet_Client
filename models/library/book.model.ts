import type { UserFile } from '../file/file.model'
import type { Author } from "./author.model"
import type { Editorial } from './editorial.model'
import type { Tag } from './tag.model'

export type Book = {
    _id: string
    name: string
    synopsis: string
    tags: Array<Tag> | Array<string>
    author: Author | string
    ranking?: number
    image: UserFile
    book?: UserFile
    slug?: string
    editorial: Editorial | string
    date_upload?: string
    date_update?: string
    is_saved?: boolean
}
