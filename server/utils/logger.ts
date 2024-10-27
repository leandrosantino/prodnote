import chalk from 'chalk'
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
dotenv.config()

const LOG_DIR = Bun.env.LOG_DIR as string

if (!LOG_DIR) {
  throw new Error('log directory is not defined')
}

class Logger {
  success(msg: string) {
    console.log(chalk.greenBright(msg))
  }

  info(msg: string) {
    console.log(chalk.blueBright(msg))
  }

  error(msg: string) {
    console.log(chalk.redBright(msg))

    const logFilePath = path.join(LOG_DIR, '/log.txt')
    let logs = ''
    if (fs.existsSync(logFilePath)) {
      logs = fs.readFileSync(logFilePath).toString()
    }
    const logMessage = `${logs}${new Date().toLocaleString()} - ${msg};\n`
    fs.writeFileSync(logFilePath, logMessage)
  }
}

export const logger = new Logger()
