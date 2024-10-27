import { type IPassProvider } from '../interfaces/IPassProvider'
import crypto from 'node:crypto'

export class PassProvider implements IPassProvider {
  private readonly algorithm = 'sha512'

  generate(loginPass: string): string {
    const hash = crypto.createHmac(this.algorithm, loginPass)
    return hash.digest('hex')
  }

  verify(loginPass: string, registeredHash: string): boolean {
    const loginHash = crypto.createHmac(this.algorithm, loginPass)
    return loginHash.digest('hex') === registeredHash
  }
}

// console.log(new PassProvider().generate('PROD@adler'))
