/* eslint-disable import/no-named-as-default-member */
// eslint-disable-next-line import/default
import log4js from 'log4js'

interface Log {
	message: string
	context: string
	labels?: Array<string>
}

export class Logger {
	constructor() {
		log4js.shutdown()
		log4js.configure({
			appenders: {
				defaultLogs: {
					type: 'file',
					filename: './logs/default.log',
				},
				errorLogs: {
					type: 'file',
					filename: './logs/error.log',
				},
				httpLogs: {
					type: 'file',
					filename: './logs/http.log',
				},
			},
			categories: {
				default: {
					appenders: ['defaultLogs'],
					level: 'all',
				},
				errorLogs: {
					appenders: ['errorLogs'],
					level: 'error',
				},
				httpLogs: {
					appenders: ['httpLogs'],
					level: 'trace',
				},
			},
		})
	}

	private getDefaultLogger() {
		return log4js.getLogger('default')
	}

	private getErrorLogger() {
		return log4js.getLogger('errorLogs')
	}

	private getHttpLogger() {
		return log4js.getLogger('httpLogs')
	}

	private buildLabels(labels?: Array<string>) {
		return `[${labels?.join(', ')}]`
	}

	public trace(log: Log) {
		this.getHttpLogger().trace(
			`${this.buildLabels(log.labels)} ${log.context} - ${log.message}`,
		)
	}

	public debug(log: Log) {
		this.getDefaultLogger().debug(
			`${this.buildLabels(log.labels)} ${log.context} - ${log.message}`,
		)
	}

	public info(log: Log) {
		this.getDefaultLogger().debug(
			`${this.buildLabels(log.labels)} ${log.context} - ${log.message}`,
		)
	}

	public warn(log: Log) {
		this.getDefaultLogger().debug(
			`${this.buildLabels(log.labels)} ${log.context} - ${log.message}`,
		)
	}

	public error(log: Log) {
		this.getErrorLogger().error(
			`${this.buildLabels(log.labels)} ${log.context} - ${log.message}`,
		)
	}

	public fatal(log: Log) {
		this.getErrorLogger().debug(
			`${this.buildLabels(log.labels)} ${log.context} - ${log.message}`,
		)
	}
}
