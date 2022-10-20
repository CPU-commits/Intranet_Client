export interface Semester {
    _id: string
    year: number
    semester: number | string
    status: number
}

export type FinishSemester = {
    close_date_semester: Date | null
    semester_status: {
        value: 'ending' | 'working'
    }
}
