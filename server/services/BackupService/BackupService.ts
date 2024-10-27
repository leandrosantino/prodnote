
import { type IDatabaseBackupHistoryRepository } from '../../interfaces/IDatabaseBackupHistoryRepository'
import fs from 'node:fs'
import path from 'node:path'

const SECONDS_IN_ONE_HOUR = 3600
const SECONDS_IN_ONE_MILISECONDS = 1000
const HOURS_IN_ONE_DAY = 24

export class BackupService {
  constructor(
    private readonly databaseBackupHistoryRepository: IDatabaseBackupHistoryRepository,
    private readonly databaseBackupDir: string,
    private readonly databaseDir: string,
    backupFrequencyInDays: number,
    private readonly callback: () => void,
    private readonly error: (err: Error) => void
  ) {
    this.backupIntervalInMiliseconds =
      SECONDS_IN_ONE_MILISECONDS *
      SECONDS_IN_ONE_HOUR *
      HOURS_IN_ONE_DAY *
      backupFrequencyInDays
  }

  backupIntervalInMiliseconds: number

  async init() {
    const history = await this.databaseBackupHistoryRepository.findMany()

    if (history.length === 0) {
      setInterval(async () => {
        await this.runBackup()
      }, this.backupIntervalInMiliseconds)
      return
    }

    const lasBackup = await this.databaseBackupHistoryRepository.findLast()
    const lasBackupDateInMileseconds = lasBackup.date.getTime()
    const nowInMileseconds = new Date().getTime()
    const diffInMiliseconds = Math.abs(nowInMileseconds - lasBackupDateInMileseconds)

    if (diffInMiliseconds >= this.backupIntervalInMiliseconds) {
      await this.runBackup()
      setInterval(async () => {
        await this.runBackup()
      }, this.backupIntervalInMiliseconds)
      return
    }

    setTimeout(async () => {
      await this.runBackup()
      setInterval(async () => {
        await this.runBackup()
      }, this.backupIntervalInMiliseconds)
    }, this.backupIntervalInMiliseconds - diffInMiliseconds)
  }

  async runBackup() {
    try {
      const backupFilePath = path.join(
        this.databaseBackupDir,
        `database_backup_${new Date().toLocaleString()
          .replace(', ', 'T')
          .replace('/', '-')
          .replace('/', '-')
          .replace(':', '-')
          .replace(':', '-')
        }.db`
      )

      fs.copyFileSync(this.databaseDir, backupFilePath)

      await this.databaseBackupHistoryRepository.create({
        date: new Date(),
        local: this.databaseBackupDir
      })
      this.callback()
    } catch (err) {
      this.error(err as Error)
    }
  }
}
