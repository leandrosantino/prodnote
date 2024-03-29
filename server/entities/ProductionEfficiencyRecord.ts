import { type ProductionEfficiencyLoss } from '../entities/ProductionEfficiencyLoss'
import { type ProductionProcess } from './ProductionProcess'

export const uteKeysList = ['UTE-1', 'UTE-2', 'UTE-3', 'UTE-4', 'UTE-5'] as const

export type UteKeys = typeof uteKeysList[number]

export interface ProductionEfficiencyRecord {
  id: string
  createdAt: Date
  date: Date
  turn: string
  ute: UteKeys
  productionTimeInMinutes: number
  usefulTimeInMunites: number
  piecesQuantity: number
  oeeValue: number
  productionEfficiencyLosses: ProductionEfficiencyLoss[]
  productionProcessId: string
  productionProcess: ProductionProcess
  userId: string
}
