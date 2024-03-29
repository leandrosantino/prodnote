import { type ProductionEfficiencyLoss } from '../entities/ProductionEfficiencyLoss'
import { type ProductionEfficiencyRecord } from '../entities/ProductionEfficiencyRecord'
import { type ProductionProcess } from '../entities/ProductionProcess'
import { type ReasonsLossEfficiency } from '../entities/ReasonsLossEfficiency'
import { type User } from '../entities/User'

export interface ProductionEfficiencyRecordRepositoryFilters {
  startsDate?: Date
  finishDate?: Date
  turn?: string
  technology?: ProductionProcess['technology']
  classification?: ReasonsLossEfficiency['classification']
  ute?: string
  process?: string
  machineSlug?: string
}

export interface ProductionEfficiencyRecordIncludedUser extends ProductionEfficiencyRecord {
  user: User
}

export interface IProductionEfficiencyRecordRepository {
  create: (
    data: Omit<
    ProductionEfficiencyRecord,
    'id' | 'productionProcess' | 'createdAt' | 'productionEfficiencyLosses'
    >,
    productionEfficiencyLosses: Array<Omit<
    ProductionEfficiencyLoss, 'id' | 'reasonsLossEfficiency' | 'machine'
    >>
  ) => Promise<ProductionEfficiencyRecord>
  findByFilters: (where: ProductionEfficiencyRecordRepositoryFilters) => Promise<ProductionEfficiencyRecordIncludedUser[]>
  getTotalOfLostTimeByFilters: (where: ProductionEfficiencyRecordRepositoryFilters) => Promise<number | null>
  getSumOfLostTimeGroupedByReasons: (where: ProductionEfficiencyRecordRepositoryFilters) => Promise<Array<{
    index: number
    reason: string
    lostTimeInMinutes: number
  }> | null>
  getTotalOfProductionTimeByFilters: (where: ProductionEfficiencyRecordRepositoryFilters) => Promise<number | null>
  getSumOfProductionTimeAndUsefulTimeGroupedByDate: (where: ProductionEfficiencyRecordRepositoryFilters) => Promise<Array<{
    date: Date
    productionTimeInMinutes: number
    usefulTimeInMunites: number
  }>>
  getSumOfProductionTimeAndUsefulTimeByFilters: (where: ProductionEfficiencyRecordRepositoryFilters) => Promise<{
    productionTimeInMinutes: number
    usefulTimeInMunites: number
  }>
}
