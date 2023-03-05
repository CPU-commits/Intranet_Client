import dayjs from 'dayjs'

export function differentDates(
	dateOne: string | Date,
	dateTwo: string | Date,
): boolean {
	return dayjs(dateOne).diff(dateTwo) !== 0
}

export function dateIsAfter(
	dateOne: string | Date,
	dateTwo: string | Date,
): boolean {
	return dayjs(dateOne).isAfter(dateTwo)
}

export function dateIsBefore(
	dateOne: string | Date,
	dateTwo: string | Date,
): boolean {
	return dayjs(dateOne).isAfter(dateTwo)
}
