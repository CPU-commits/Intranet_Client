const validator = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	dv: (T: any) => {
		let M = 0
		let S = 1
		for (; T; T = Math.floor(T / 10))
			S = (S + (T % 10) * (9 - (M++ % 6))) % 11
		return S ? S - 1 : 'k'
	},
	rutValidator: (rut: string) => {
		if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rut)) return false
		const tmp = rut.split('-')
		const digv = tmp[1].toLowerCase()
		const body = tmp[0]
		// eslint-disable-next-line eqeqeq
		return validator.dv(body) == digv
	},
}

export default validator
