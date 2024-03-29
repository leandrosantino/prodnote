import { type IProductionEfficiencyRecordRepository } from '../../interfaces/IProductionEfficiencyRecordRepository'
import { type IProductionProcessRepository } from '../../interfaces/IProductionProcessRepository'
import { type RegisterProductionEfficiencyRequestDTO } from './RegisterProductionEfficiencyDTO'

export class RegisterProductionEfficiency {
  constructor (
    private readonly productionEfficiencyRecordRepository: IProductionEfficiencyRecordRepository,
    private readonly productionProcessRepository: IProductionProcessRepository,
    private readonly CUTOFF: number
  ) {}

  async execute ({ data, productionEfficiencyLosses }: RegisterProductionEfficiencyRequestDTO) {
    const productionProcess = await this.productionProcessRepository
      .findById(data.productionProcessId)

    if (!productionProcess) throw new Error('production process not found')

    let lostTimeInMinutes = 0

    productionEfficiencyLosses.forEach(entry => { lostTimeInMinutes += entry.lostTimeInMinutes })

    const coerency = this.verifyCoerency({
      piecesQuantity: data.piecesQuantity,
      productionTimeInMinutes: data.productionTimeInMinutes,
      cycleTimeInSeconds: productionProcess.cycleTimeInSeconds,
      lostTimeInMinutes,
      cavitiesNumber: productionProcess.cavitiesNumber
    })

    if (coerency !== 'ok') {
      throw new Error(`time ${coerency}`)
    }

    const oeeValue = this.calculateOEE({
      piecesQuantity: data.piecesQuantity,
      productionTimeInMinutes: data.productionTimeInMinutes,
      cycleTimeInSeconds: productionProcess.cycleTimeInSeconds,
      cavitiesNumber: productionProcess.cavitiesNumber
    })

    const usefulTimeInMunites = (
      data.piecesQuantity *
      (productionProcess.cycleTimeInSeconds / productionProcess.cavitiesNumber)
    ) / 60

    const register = await this.productionEfficiencyRecordRepository
      .create({ ...data, oeeValue, usefulTimeInMunites }, productionEfficiencyLosses)

    return register
  }

  calculateOEE ({ cycleTimeInSeconds, piecesQuantity, productionTimeInMinutes, cavitiesNumber }: {
    piecesQuantity: number
    cycleTimeInSeconds: number
    productionTimeInMinutes: number
    cavitiesNumber: number
  }) {
    const cycleTimeInMinutes = cycleTimeInSeconds / 60
    return (piecesQuantity * (cycleTimeInMinutes / cavitiesNumber)) / productionTimeInMinutes
  }

  verifyCoerency (props: {
    piecesQuantity: number
    cycleTimeInSeconds: number
    productionTimeInMinutes: number
    lostTimeInMinutes: number
    cavitiesNumber: number
  }) {
    const piecesQuantityInMinutes = (props.piecesQuantity * (props.cycleTimeInSeconds / props.cavitiesNumber)) / 60
    const productionTimePointer = piecesQuantityInMinutes + props.lostTimeInMinutes
    const diff = props.productionTimeInMinutes - productionTimePointer
    const diffInPercent = diff / props.productionTimeInMinutes

    if (Math.abs(diffInPercent) > this.CUTOFF) {
      if (diffInPercent >= 0) {
        return 'missing'
      }
      if (diffInPercent < 0) {
        return 'exdent'
      }
    }

    return 'ok'
  }

  getCutOff () {
    return this.CUTOFF
  }
}
