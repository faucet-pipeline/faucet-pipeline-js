export enum LogLevel { Debug, Info, Critical }

export function log(level: LogLevel, msg: string) {
	if(level === LogLevel.Critical) {
		console.error(msg);
	} else {
		console.log(msg);
	}
}
