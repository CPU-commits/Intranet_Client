import { z } from 'zod'

// Messages
export const messages = {
	minLengthString: (name: string, min: number) =>
		min === 1
			? `${name} no puede estar vacío`
			: `${name} debe tener mín. ${min} cárac.`,
	maxLenghtString: (name: string, max: number) =>
		`${name} debe tener máx. ${max} cárac.`,
	minValueNumber: (name: string, min: number) =>
		`${name} debe valer mín. ${min}`,
	maxValueNumber: (name: string, max: number) =>
		`${name} debe valer máx. ${max}`,
	isEmail: (name: string) => `${name} debe ser un email válido`,
	isRut: (name: string) => `${name} debe ser un RUT válido (Ej: 11111111-1)`,
	isAddress: (name: string) => `${name} no puede estar vacía`,
	required: (name: string) => `${name} es requerido`,
	isInt: (name: string) => `${name} debe ser un número entero`,
}

// Custom error
export class ValidatorsError extends Error {
	constructor(err: z.ZodError) {
		super(err.errors[0].message)
	}
}

interface Rules {
	type: 'string' | 'date' | 'number' | 'object' | 'address' | 'file'
	custom_name: string
	min?: number
	max?: number
	is_int?: boolean
	is_rut?: boolean
	is_email?: boolean
	object_schema?: { [key: string]: z.ZodTypeAny }
}

function convertRuleToZodType(rule: Rules): z.ZodTypeAny {
	if (rule.type === 'string') {
		let zodType = z.string({
			required_error: messages.required(rule.custom_name),
		})

		if (rule.min !== undefined)
			zodType = zodType.min(rule.min, {
				message: messages.minLengthString(rule.custom_name, rule.min),
			})
		if (rule.max !== undefined)
			zodType = zodType.max(rule.max, {
				message: messages.maxLenghtString(rule.custom_name, rule.max),
			})
		if (rule.is_email)
			zodType = zodType.email({
				message: messages.isEmail(rule.custom_name),
			})
		if (rule.is_rut)
			return zodType.refine((rut) => validator.rutValidator(rut), {
				message: messages.isRut(rule.custom_name),
			})

		return zodType
	} else if (rule.type === 'date') {
		const zodType = z.date({
			required_error: messages.required(rule.custom_name),
		})

		return zodType
	} else if (rule.type === 'address') {
		return z.object(
			{
				street_number_name: z
					.string()
					.min(1, { message: messages.isAddress(rule.custom_name) }),
				building_site_number: z
					.string()
					.min(1, { message: messages.isAddress(rule.custom_name) }),
			},
			{ required_error: messages.required(rule.custom_name) },
		)
	} else if (rule.type === 'file') {
		return z.instanceof(File, {
			message: messages.required(rule.custom_name),
		})
	} else if (rule.type === 'object') {
		return z.object(rule.object_schema as {}, {
			required_error: messages.required(rule.custom_name),
		})
	} else {
		let zodType = z.number({
			required_error: messages.required(rule.custom_name),
		})

		if (rule.is_int !== undefined)
			zodType = zodType.int({ message: messages.isInt(rule.custom_name) })
		if (rule.min !== undefined)
			zodType = zodType.min(rule.min, {
				message: messages.minLengthString(rule.custom_name, rule.min),
			})
		if (rule.max !== undefined)
			zodType = zodType.max(rule.max, {
				message: messages.maxValueNumber(rule.custom_name, rule.max),
			})
		return zodType
	}
}

function schemaToZodSchema(schema: { [key: string]: Rules }): z.Schema {
	const obectSchema: { [k: string]: z.ZodTypeAny } = {}
	// Iterate schema
	for (const [key, value] of Object.entries(schema)) {
		obectSchema[key] = convertRuleToZodType(value)
	}

	return z.object(obectSchema)
}

export default function validators<T extends object>(
	schema: { [key: string]: Rules },
	toValidate: T,
) {
	const zodSchema = schemaToZodSchema(schema)
	try {
		zodSchema.parse(toValidate)
		return {
			transform: function (): T {
				return Object.entries(toValidate).reduce(
					(newObject, [key, value]) => {
						if (
							Object.entries(schema).some(
								([keySchema, _]) => keySchema === key,
							)
						)
							newObject[key] = value

						return newObject
					},
					{},
				) as T
			},
		}
	} catch (err) {
		const error = err as z.ZodError
		throw new ValidatorsError(error)
	}
}
