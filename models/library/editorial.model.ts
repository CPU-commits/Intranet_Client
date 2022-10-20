import type { UserFile } from '../file/file.model'

export type Editorial = {
    _id: string
    editorial: string
    slug: string
    image: UserFile
    status: boolean
    date: string
}
