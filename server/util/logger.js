const LogLevel = {
    TRACE: 'TRACE',
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
}

const timestamp = () => {
    const date = new Date()

    const year = date.getFullYear()
    const month = date.getMonth().toString().padStart(2, '0')
    const day = date.getDay().toString().padStart(2, '0')

    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    const ms = date.getMilliseconds().toString().padStart(3, '0')

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}.${ms}`
}

const formatLog = (level, tag, message, obj) => {
    const ts = timestamp().padEnd(24)
    const levelStr = level.padEnd(5)
    const tagStr = `[${tag}]:`.padEnd(10)

    return (`${ts} ${levelStr} - ${tagStr} ${message}` + (obj ? `\n\t${JSON.stringify(obj)}` : ''))
}

const consoleLogWriter = {
    log(level, tag, message, obj) {
        const logLine = formatLog(level, tag, message)

        switch (level) {
            case LogLevel.TRACE:
            case LogLevel.DEBUG:
            case LogLevel.INFO:
                // Avoid logging 'undefined'
                if (obj) console.log(logLine, obj)
                else console.log(logLine)
                break
            case LogLevel.WARN:
                if (obj) console.warn(logLine, obj)
                else console.warn(logLine)
                break
            case LogLevel.ERROR:
                if (obj) console.error(logLine, obj)
                else console.error(logLine)
        }
    }
}

class Logger {
    constructor(tag, writer) {
        this.tag = tag
        this.writer = writer || consoleLogWriter
    }

    trace(message, obj) {
        this.writer.log(LogLevel.TRACE, this.tag, message, obj)
    }

    debug(message, obj) {
        this.writer.log(LogLevel.DEBUG, this.tag, message, obj)
    }

    info(message, obj) {
        this.writer.log(LogLevel.INFO, this.tag, message, obj)
    }

    log(message, obj) {
        this.writer.log(LogLevel.INFO, this.tag, message, obj)
    }

    warn(message, obj) {
        this.writer.log(LogLevel.WARN, this.tag, message, obj)
    }

    error(message, obj) {
        this.writer.log(LogLevel.ERROR, this.tag, message, obj)
    }
}

module.exports.createLogger = (tag) => new Logger(tag)
module.exports.LogLevel = LogLevel
