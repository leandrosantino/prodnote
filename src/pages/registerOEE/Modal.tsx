import { zodResolver } from '@hookform/resolvers/zod'
import { type DialogProps } from '../../contexts/dialogContext'
import { LossesTable, ModalContent, SaveButtonCase } from './styles'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Field } from '../../components/Form/Field'
import { Button } from '../../components/Form/Button'
import { CopyPlus, SaveAll, Trash } from 'lucide-react'
import { Table } from '../../components/Table'
import { trpc } from '../../utils/api'
import { useEffect, useState } from 'react'
import { type ReasonsLoss, type EfficiencyRecords, type ModalParams } from '.'
import { useLocalState } from '../../hooks/useLocalState'

const efficiencyLossesSchema = z.object({
  type: z.string().nonempty('obigatório!'),
  reason: z.string().nonempty('obigatório!'),
  machine: z.string().nonempty('obigatório!'),
  lostTime: z.coerce.number().min(1, 'requer >1')
})
const typeReasonsLoss = ['scrap', 'rework', 'stoppages'] as const
type EfficiencyLosses = z.infer<typeof efficiencyLossesSchema>
type TypeReasonsLoss = typeof typeReasonsLoss[number]

interface ModalProps extends DialogProps {
  params?: ModalParams
}

export function Modal ({ params, accept, finally: end }: ModalProps) {
  const [efficiencyRecords] = useLocalState<EfficiencyRecords[]>(params?.localStateKey as string)
  const [reasonsLossEfficiencyList, setReasonsLossEfficiencyList] = useState<ReasonsLoss[]>([])

  useEffect(() => {
    if (params && efficiencyRecords && params.recordIndex !== undefined && params.isEditing) {
      setReasonsLossEfficiencyList(efficiencyRecords[params.recordIndex].reasonsLosses)
    }
  }, [])

  const efficiencyLossesForm = useForm<EfficiencyLosses>({
    resolver: zodResolver(efficiencyLossesSchema)
  })
  const {
    handleSubmit,
    setValue,
    watch
  } = efficiencyLossesForm

  const reasonLosses = trpc.oee.getReasonsLossList.useQuery({ type: (watch().type as TypeReasonsLoss) || 'scrap' })

  useEffect(() => {
    if (reasonLosses.data) {
      setValue('reason', reasonLosses.data[0].id)
    }
  }, [reasonLosses.data])

  const machines = trpc.oee.getProductionProcessMachines.useQuery({ id: params?.processId as string })

  function handleSave (data: EfficiencyLosses) {
    if (machines.data && reasonLosses.data) {
      const reason = reasonLosses.data?.find(entry => entry.id === data.reason)
      const machine = machines.data?.find(entry => entry.id === data.machine)

      setReasonsLossEfficiencyList(old => [...old, {
        reasonsLossEfficiencyId: data.reason,
        machineId: data.machine,
        lostTimeInMinutes: data.lostTime,
        machineSlug: machine?.slug as string,
        reasonsLossDescription: reason?.description as string,
        type: data.type
      }])
    }
  }

  function handleDelete (index: number) {
    setReasonsLossEfficiencyList(old => {
      if (old) {
        return old.filter((_, oldIndex) => oldIndex !== index)
      }
      return old
    })
  }

  function handleRegister () {
    if (accept) {
      accept(reasonsLossEfficiencyList)
      end()
    }
  }

  return (
    <ModalContent>

      <h1>Lançar Perdas de Eficiência</h1>

      <FormProvider {...efficiencyLossesForm} >
        <form onSubmit={handleSubmit(handleSave)}>

          <Field.Root>
            <Field.Label htmlFor='type'>Tipo:</Field.Label>
            <Field.Select id='type' name='type' >
                <option value="scrap">Scrap</option>
                <option value="rework">Retrabalho</option>
                <option value="stoppages">Parada</option>
            </Field.Select>
            <Field.ErrorMessage field='type' />
          </Field.Root>

          <Field.Root>
            <Field.Label htmlFor='reason'>Motivo:</Field.Label>
            <Field.Select id='reason' name='reason' >
                <option value=""> - Selecione o motivo -</option>
                {reasonLosses.data?.map(entry => (
                  <option key={entry.id} value={entry.id}>{entry.description}</option>
                ))}
            </Field.Select>
            <Field.ErrorMessage field='reason' />
          </Field.Root>

          <Field.Root>
            <Field.Label htmlFor='machine'>Máquina:</Field.Label>
            <Field.Select id='machine' name='machine' >
              <option value=""> - </option>
              {machines.data?.map(entry => (
                <option key={entry.id} value={entry.id}>{entry.slug}</option>
              ))}
            </Field.Select>
            <Field.ErrorMessage field='machine' />
          </Field.Root>

          <Field.Root>
            <Field.Label htmlFor='lostTime'>Tempo(min):</Field.Label>
            <Field.Input id='lostTime' name='lostTime' type='number'/>
            <Field.ErrorMessage field='lostTime' />
          </Field.Root>

          <Button>
            <CopyPlus size={20}/>
          </Button>

        </form>
      </FormProvider>
      <LossesTable>
        <Table.Head>
          <th>Tipo</th>
          <th>Motivo</th>
          <th>Máquina</th>
          <th>Tempo</th>
          <th> - </th>
        </Table.Head>
        <Table.Body>
          {reasonsLossEfficiencyList.map((entry, index) => (
            <tr key={index} >
              <td>{entry.type}</td>
              <td>{entry.reasonsLossDescription}</td>
              <td>{entry.machineSlug}</td>
              <td>{entry.lostTimeInMinutes}</td>
              <td>
                <button
                  onClick={() => { handleDelete(index) }}
                >
                  <Trash size={15} />
                </button>
              </td>
            </tr>
          ))}
        </Table.Body>
      </LossesTable>

      <SaveButtonCase>
        <Button
          onClick={() => { handleRegister() }}
        >
            <SaveAll size={20} />
            Salvar
        </Button>
      </SaveButtonCase>

    </ModalContent>
  )
}