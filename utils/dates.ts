import moment from "moment";

export function differentDates(dateOne: string | Date, dateTwo: string | Date): boolean {
    return moment(dateOne).diff(moment(dateTwo)) === 0
}

export function dateIsAfter(dateOne: string | Date, dateTwo: string | Date): boolean {
    return moment(dateOne).isAfter(dateTwo)
}

export function dateIsBefore(dateOne: string | Date, dateTwo: string | Date): boolean {
    return moment(dateOne).isBefore(dateTwo)
}
