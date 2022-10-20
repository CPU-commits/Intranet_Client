import { Attached } from "../file/attached.model"

export type ContentPublication = {
    author: string
    content: string
    published?: string
}

export type Publication = {
    _id: string
    content: ContentPublication
    attached: Array<Attached>
    update_date: string | Date
    upload_date: string | Date
}
