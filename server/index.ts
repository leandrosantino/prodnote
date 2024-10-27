process.stdin.setRawMode(true);
process.stdin.resume();
import path from 'node:path'
import { HttpServer } from './infra/server.ts'
import { backupService } from './services/BackupService/index.ts'
import { startControl } from './infra/startControl.ts'

const port = Number(Bun.env.PORT as string)
const isDev = (Bun.env.IS_DEV as string) === 'true'

if (!port) {
  throw Error('port is note defined')
}

const server = new HttpServer(
  backupService,
  {
    enableDatabaseBackup: !isDev,
    apiEndpoint: '/api',
    playgroundEndpoint: '/playground',
    port: port,
    staticsDirectory: path.join(process.cwd(), './static')
  }
)

if (!isDev) {
  await startControl(port)
}

server.listen()
  .catch(console.log)
