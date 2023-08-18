import { type ProductionRecord } from '../../../entities/ProductionRecord'
import { type IProductionRecordRepository } from '../../../interfaces/IProductionRecordRepository'
import { prisma } from './connection'

export class ProductionRecordRepository implements IProductionRecordRepository {
  async create (data: Omit<ProductionRecord, 'product' | 'user' | 'date'>) {
    const record = await prisma.productionRecord.create({
      data
    })
    return record as ProductionRecord
  }

  async findById (id: string) {
    const record = await prisma.productionRecord.findUnique({
      where: {
        id
      }
    })
    if (record) {
      return record as ProductionRecord
    }
    return null
  }
}
