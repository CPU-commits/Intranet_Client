import type { ItemTypeEnum, QuestionTypeEnum } from "./form.model"

export type ItemQuestionType = {
    question: string
    type: keyof typeof QuestionTypeEnum
    answers: Array<string>
    points?: string | number
    correct?: number
    answer: string
}

export type ItemType = {
    title: string
    points_type: keyof typeof ItemTypeEnum
    points?: string | number
    questions: Array<ItemQuestionType & { _id: string }>
}
