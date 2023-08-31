import { Field } from '../../components/Form/Field'
import { Container, OeeCell, RecordsTable, SaveButtonCase, TableButton } from './styles'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/Form/Button'
import { CopyPlus, Pencil, Save, SaveAll, TrashIcon } from 'lucide-react'
import { Table } from '../../components/Table'
import { trpc, fetch } from '../../utils/api'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useLocalState } from '../../hooks/useLocalState'
import { useDialog } from '../../hooks/useDialog'
import { Modal } from './Modal'
import { z } from 'zod'
import { type ProductionEfficiencyRecord } from '../../../server/entities/ProductionEfficiencyRecord'

const registerOEEFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'selecione uma data'),
  time: z.coerce.number().min(1, 'precisar ser > 1'),
  turn: z.enum(['1', '2', '3', ''] as const).refine(entry => entry !== '', 'selecione o turno'),
  ute: z.enum(['UTE-1', 'UTE-2', 'UTE-3', 'UTE-4', 'UTE-5', ''] as const)
    .refine(entry => entry !== '', 'selecione a ute'),
  piecesQuantity: z.coerce.number().min(1, 'precisar ser > 1'),
  process: z.string().nonempty('selecione o porcesso')
})

type RegisterOEEForm = z.infer<typeof registerOEEFormSchema>

export interface ReasonsLoss {
  reasonsLossEfficiencyId: string
  lostTimeInMinutes: number
  machineSlug: string
  reasonsLossDescription: string
  machineId: string
  type: string
}

export interface EfficiencyRecords extends RegisterOEEForm {
  reasonsLosses: ReasonsLoss[]
  oeeValue: number
  description: string
  cycleTimeInSeconds: number
}

export interface ModalParams {
  isEditing: boolean
  processId: string
  localStateKey: string
  recordIndex?: number
}

export function RegisterOEE () {
  const { user } = useAuth()
  const dialog = useDialog()
  const localStateKey = `${user?.id as string}-OEE`

  const registerOEEForm = useForm<RegisterOEEForm>({
    resolver: zodResolver(registerOEEFormSchema)
  })

  const {
    handleSubmit,
    setValue
  } = registerOEEForm

  const processes = trpc.oee.getProcessesList.useQuery()

  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editingIndex, setEditingIndex] = useState<number>(0)
  const [efficiencyRecords, setEfficiencyRecords] = useLocalState<EfficiencyRecords[]>(localStateKey)
  const [loading, setLoading] = useState(false)

  // useEffect(() => {
  //   setValue('date', '2023-01-20')
  //   setValue('turn', '1')
  //   setValue('ute', 'UTE-1')
  //   setValue('process', 'clluzttl5002ym5jsj91hgi24')
  //   setValue('time', 12)
  //   setValue('piecesQuantity', 12)
  // }, [])

  async function handleRegister (data: RegisterOEEForm) {
    if (processes.data) {
      const process = processes.data.find(entry => entry.id === data.process)
      const cycleTimeInSeconds = process?.cycleTimeInSeconds as number
      const oeeValue = await fetch.oee.claculate.query({
        cycleTimeInSeconds,
        piecesQuantity: data.piecesQuantity,
        productionTimeInMinutes: data.time
      })

      if (isEditing && efficiencyRecords !== null) {
        if (!efficiencyRecords[editingIndex]) {
          setIsEditing(false)
          clearForm()
          return
        }
        setEfficiencyRecords(old => {
          if (old) {
            old[editingIndex] = {
              ...data,
              reasonsLosses: old[editingIndex].reasonsLosses,
              oeeValue,
              cycleTimeInSeconds,
              description: process?.description as string
            }
          }
          return old
        })
        setIsEditing(false)
        clearForm()
        return
      }

      dialog.custom({
        Child: Modal,
        params: {
          isEditing: false,
          localStateKey,
          processId: process?.id
        },
        async accept (reasonsLosses: ReasonsLoss[]) {
          setEfficiencyRecords(old => {
            const record = {
              ...data,
              reasonsLosses,
              oeeValue,
              cycleTimeInSeconds,
              description: process?.description as string
            }

            if (old) {
              return [...old, record]
            }
            return [record]
          })
          setIsEditing(false)
          clearForm()
        }
      })
    }
  }

  function handleDelete (index: number) {
    if (isEditing && index === editingIndex) {
      dialog.alert({
        title: 'Atenção!',
        message: 'Você está tentando excluir um registro que está sendo editado, salve as alterações antes de excluir!',
        error: true
      })
      return
    }
    setEfficiencyRecords(old => {
      if (old) {
        return old.filter((_, oldIndex) => oldIndex !== index)
      }
      return old
    })
  }

  function clearForm () {
    setValue('date', '')
    setValue('turn', '')
    setValue('ute', '')
    setValue('process', '')
    setValue('time', 0)
    setValue('piecesQuantity', 0)
  }

  function handleEditRecord (index: number) {
    if (efficiencyRecords) {
      setIsEditing(true)
      setEditingIndex(index)
      setValue('date', efficiencyRecords[index].date)
      setValue('turn', efficiencyRecords[index].turn)
      setValue('ute', efficiencyRecords[index].ute)
      setValue('process', efficiencyRecords[index].process)
      setValue('time', efficiencyRecords[index].time)
      setValue('piecesQuantity', efficiencyRecords[index].piecesQuantity)
    }
  }

  function handleEditLosses (index: number) {
    if (processes.data && efficiencyRecords !== null) {
      const { process } = efficiencyRecords[index]
      dialog.custom({
        Child: Modal,
        params: {
          isEditing: true,
          localStateKey,
          processId: process,
          recordIndex: index
        },
        async accept (reasonsLosses: ReasonsLoss[]) {
          setEfficiencyRecords(old => {
            if (old) {
              return old?.map((entry, i) => {
                if (i === index) {
                  const a = entry
                  a.reasonsLosses = reasonsLosses
                  return a
                }
                return entry
              })
            }
            return old
          })
          setIsEditing(false)
          clearForm()
        }
      })
    }
  }

  function convertDateStringtoDateObject (date: string) {
    const [year, month, day] = date.split('-').map(entry => Number(entry))
    return new Date(year, month - 1, day)
  }

  function handleSave () {
    if (efficiencyRecords !== null) {
      if (efficiencyRecords?.length <= 0) {
        dialog.alert({
          title: 'Atenção!',
          message: 'Nenhum lançamento encontrado!'
        })
        return
      }
      dialog.question({
        title: 'Atenção!',
        message: 'Realmente deseja salvar o laçamento?',
        async accept () {
          setLoading(true)
          const efficiencyRecordsFailed: EfficiencyRecords[] = []
          for (const index in efficiencyRecords) {
            const record = efficiencyRecords[index]
            try {
              console.log(index, record.description)
              await fetch.oee.registerProductionEfficiency.mutate({
                data: {
                  date: convertDateStringtoDateObject(record.date),
                  piecesQuantity: record.piecesQuantity,
                  productionProcessId: record.process,
                  productionTimeInMinutes: record.time,
                  turn: record.turn,
                  ute: record.ute as ProductionEfficiencyRecord['ute']
                },
                productionEfficiencyLosses: record.reasonsLosses.map(entry => ({
                  lostTimeInMinutes: entry.lostTimeInMinutes,
                  machineId: entry.machineId,
                  reasonsLossEfficiencyId: entry.reasonsLossEfficiencyId
                }))
              })
            } catch (err) {
              efficiencyRecordsFailed.push(record)
            }
          }
          if (efficiencyRecordsFailed.length > 0) {
            dialog.alert({
              title: 'Erro!',
              message: 'Alguns registros estão com informções inconsistentes, revise os dados e tente novamente.',
              error: true
            })
          } else {
            dialog.alert({
              title: 'Sucesso!',
              message: 'Lançamento finalizado!',
              error: false
            })
          }
          setEfficiencyRecords(efficiencyRecordsFailed)
          setLoading(false)
        },
        refuse () {}
      })
    }
  }

  return (
    <Container>
      <div>
        <h1>Lançamento de OEE</h1>

        <FormProvider {...registerOEEForm}>
          <form onSubmit={handleSubmit(handleRegister)}>
            <div>
              <Field.Root>
                <Field.Label htmlFor='date'>Data:</Field.Label>
                <Field.Input id='date' name='date' type='date' />
                <Field.ErrorMessage field='date'/>
              </Field.Root>

              <Field.Root>
                <Field.Label htmlFor='turn'>Turno:</Field.Label>
                <Field.Select id='turn' name='turn' >
                  <option value={''}>- Selecione o turno -</option>
                  <option value="1">1º truno</option>
                  <option value="2">2º truno</option>
                  <option value="3">3º truno</option>
                </Field.Select>
                <Field.ErrorMessage field='turn'/>
              </Field.Root>

              <Field.Root>
                <Field.Label htmlFor='ute'>UTE:</Field.Label>
                <Field.Select id='ute' name='ute' >
                  <option value={''}>- Selecione a UTE -</option>
                  <option value="UTE-1">UTE-1</option>
                  <option value="UTE-2">UTE-2</option>
                  <option value="UTE-3">UTE-3</option>
                  <option value="UTE-4">UTE-4</option>
                  <option value="UTE-5">UTE-5</option>
                </Field.Select>
                <Field.ErrorMessage field='ute'/>
              </Field.Root>
            </div>

            <div>
              <Field.Root id='processInputCase'>
                <Field.Label htmlFor='process'>Processo:</Field.Label>
                <Field.Select id='process' name='process'
                  placeholder={processes.isLoading ? 'Carregando...' : '' }
                >
                  <option value={''}>- Selecione o processo -</option>
                  {processes.data?.map(process => (
                    <option key={process.id} value={process.id}>{process.description}</option>
                  ))}
                </Field.Select>
                <Field.ErrorMessage field='process'/>
              </Field.Root>

              <Field.Root>
                <Field.Label htmlFor='time'>Tempo de Planejado:</Field.Label>
                <Field.Input id='time' name='time' type='number' />
                <Field.ErrorMessage field='time'/>
              </Field.Root>

              <Field.Root>
                <Field.Label htmlFor='piecesQuantity'>Quantidade de Peças Boas:</Field.Label>
                <Field.Input id='piecesQuantity' name='piecesQuantity' type='number' />
                <Field.ErrorMessage field='piecesQuantity'/>
              </Field.Root>

                <Button type='submit' disabled={loading}>
                  {isEditing ? <Save size={18} /> : <CopyPlus size={18} />}
                  {isEditing ? 'Salvar' : 'Adicionar'}
                </Button>
            </div>

          </form>
        </FormProvider>

      <RecordsTable>
        <Table.Head>
          <th>Data</th>
          <th>Processo</th>
          <th>OEE</th>
          <th>UTE</th>
          <th>Turno</th>
          <th>  </th>
          <th>  </th>
          <th>  </th>
        </Table.Head>
        <Table.Body>
          {efficiencyRecords?.map((record, index) => (
            <tr key={index} >
              <td>{convertDateStringtoDateObject(record.date).toLocaleDateString()}</td>
              <td>{record.description}</td>
              <td>
                <OeeCell
                  data-error={(record.oeeValue > 1.01 || record.oeeValue < 0) ? 'on' : 'off'}
                >
                  {`${(record.oeeValue * 100).toFixed(1)}%`}
                </OeeCell>
              </td>
              <td>{record.ute}</td>
              <td>{record.turn}</td>
              <td>
                <TableButton
                  disabled={loading}
                  onClick={() => { handleEditLosses(index) }}
                >
                  Alterar Perdas
                </TableButton>
              </td>
              <td>
                <TableButton
                  disabled={loading}
                  onClick={() => { handleEditRecord(index) }}
                >
                  <Pencil size={15}/>
                </TableButton>
              </td>
              <td>
                <TableButton
                  disabled={loading}
                  onClick={() => { handleDelete(index) }}
                >
                  <TrashIcon size={13} />
                </TableButton>
              </td>
            </tr>
          ))}
        </Table.Body>
      </RecordsTable>

      <SaveButtonCase>
        <Button
          disabled={loading}
          onClick={handleSave}
        >
          <SaveAll />
          Salvar Lançamento
        </Button>
      </SaveButtonCase>

      </div>
    </Container>
  )
}