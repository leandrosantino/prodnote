import { RegisterProductionEfficiency } from './RegisterProductionEfficiency'
import { Repositories } from '../../infra/repositories'
import dotenv from 'dotenv'
dotenv.config()

const CUTOFF = Bun.env.CUTOFF

if (!CUTOFF) {
  throw new Error('CUTOFF is not defined')
}

export const registerProductionEfficiency = new RegisterProductionEfficiency(
  new Repositories.ProductionEfficiencyRecord(),
  new Repositories.ProductionProcess(),
  Number(CUTOFF)
)
