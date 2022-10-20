import { User } from "../user/user.model"

export type EvaluateAnswer = {
    _id: string
    question: string
    student: string
    work: string
    evaluator: string | User
    points: number
    date: Date
}
