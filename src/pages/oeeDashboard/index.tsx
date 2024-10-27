import { useState } from 'react'
import { ClassChart } from './ClassChart'
import { DailyChart } from './DailyChart'
import { TrunChart } from './TurnChart'
import { ChartsArea, Container, Content, FiltersCase, Header, OeeValueCase } from './styles'
import { trpc } from '../../utils/api'
import { Button } from '../../components/Form/Button'
import { FilterIcon } from 'lucide-react'
import { useDialog } from '../../hooks/useDialog'
import { SelectFilters } from './SelectFilters'
import { type TechnologyKeys } from '../../../server/entities/ProductionProcess'

export interface Filters {
  day?: number
  mouth: number
  year: number
  processId?: string
  processDescription?: string
  turn?: string
  ute?: string
  technology?: TechnologyKeys
}

const MONTH_NAMES = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez'
]

export function OeeDashboard () {
  const now = new Date()

  const [filters, setFilters] = useState<Filters>({
    mouth: now.getMonth() + 1,
    year: now.getFullYear()
  })

  const dialog = useDialog()

  const { data, isLoading } = trpc.oee.getGeneralOeeValue.useQuery({
    date: {
      day: filters.day,
      mouth: filters.mouth,
      year: filters.year
    },
    process: filters.processId,
    turn: filters.turn,
    ute: filters.ute,
    technology: filters.technology
  })

  function handleSelectFilters () {
    dialog.custom({
      Child: SelectFilters,
      params: filters,
      accept (data: Filters) {
        setFilters(data)
      }
    })
  }

  return (
    <Container>
      <Content>
        <Header>
          <h2>Eficiencia de Produção</h2>
          <div>
            <OeeValueCase>
              <span>OEE do {filters.day === 0 ? 'Mês' : 'Dia'}</span>
              <span>{isLoading ? '00.0%' : (`${data?.oeeValue || '0.00'}%` || '00.0%')}</span>
            </OeeValueCase>
          </div>
          <FiltersCase>
            <div>
              <p>
                {filters.day ? `${filters.day.toString().padStart(2, '0')} de ` : ''}
                {MONTH_NAMES[filters.mouth - 1]} de {filters.year}
                {filters.turn ? ` , ${filters.turn}º Turno` : ''}
                {filters.ute ? ` , ${filters.ute}` : ''}
              </p>
              <p>{filters.processDescription}</p>
              <p>{filters.technology}</p>
            </div>
            <Button
              onClick={() => { handleSelectFilters() }}
            >
              <FilterIcon size={15}/>
              Filtrar
            </Button>
          </FiltersCase>
        </Header>

        <ChartsArea>
          <TrunChart {...{ filters }} />
          <ClassChart {...{ filters }} />
          <DailyChart {...{ filters }} />
        </ChartsArea>
      </Content>
    </Container>
  )
}
