/* eslint-disable import/no-named-as-default-member */
import moment from 'moment'
// eslint-disable-next-line import/default
import pkg from 'roman-numerals'
import { UserTypes, UserTypesKeys } from '~~/models/user/user.model'
const { toRoman } = pkg

export function formatDate(date: string | Date) {
	return moment(date).locale('es').format('LLL')
}

export function formatMiniDate(date: string | Date) {
	return moment(date).locale('es').format('MM/DD HH:mm')
}

export function timeAgo(date: string | Date) {
	return moment(date).locale('es').fromNow()
}

export function removeTime(date: string | Date) {
	return moment(date).locale('es').startOf('day').format('YYYY-MM-DD')
}

export function getOnlyTime(date: string | Date) {
	return moment(date).locale('es').format('HH:mm')
}

export function secondsToHoursFormat(seconds: number) {
	const hours = seconds / 3600
	let hoursFormat = `${Math.trunc(hours)}:`
	if (hoursFormat.length === 2) hoursFormat = `0${hoursFormat}`
	hoursFormat += `${Number((hours % 1).toFixed(2)) * 60}`
	if (hoursFormat.length === 4) {
		const lastDigit = hoursFormat[3]
		const string = hoursFormat
		hoursFormat = ''
		for (let i = 0; i < 3; i++) hoursFormat += string[i]
		hoursFormat += `0${lastDigit}`
	}
	return hoursFormat
}

export function urlify(text: string) {
	const urlRegex = /(https?:\/\/[^\s]+)/g
	return text.replace(urlRegex, function (url) {
		return (
			'<p class="Link"><a target="_blank" class="Link" href="' +
			url +
			'">' +
			url +
			'</a></p>'
		)
	})
}

export function formatDateUTC(date: string | Date) {
	return moment(date).locale('es').format('YYYY-MM-DD HH:mm')
}

export function formateDateInput(date: string | Date) {
	return moment(date).format('YYYY-MM-DD')
}

export function intToChar(int: number) {
	const code = 'a'.charCodeAt(0)
	return String.fromCharCode(code + int)
}

export function isValidHttpUrl(string: string): boolean {
	let url: URL
	try {
		url = new URL(string)
	} catch (err) {
		return false
	}
	return url.protocol === 'http:' || url.protocol === 'https:'
}

export function formatGrade(grade: number) {
	const gradeArray = grade.toString().split('')
	const gradeString = `${gradeArray[0]}.${gradeArray[1]}`
	return gradeString
}

export function intToRoman(num: number) {
	return toRoman(num)
}

export function formatUserType(userType: keyof typeof UserTypes) {
	if (userType === UserTypesKeys.TEACHER) return 'Profesor'
	if (userType === UserTypesKeys.DIRECTIVE) return 'Directivo'
	if (userType === UserTypesKeys.DIRECTOR) return 'Director'
	if (userType === UserTypesKeys.LIBRARIAN) return 'Bibliotecario'
	if (userType === UserTypesKeys.STUDENT) return 'Estudiante'
	if (userType === UserTypesKeys.STUDENT_DIRECTIVE) return 'Estudiante'
	return ''
}

export function capitalizeFirstLetter(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1)
}
