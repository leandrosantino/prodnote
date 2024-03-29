import { initTRPC } from '@trpc/server'
import { type Context } from '../context'
import { authenticattionMiddleware } from '../middlewares/authenticattionMiddleware'
import { createUser } from '../../useCases/CreateUser'
import { updateUser } from '../../useCases/UpdateUser'
import { getUserInfo } from '../../useCases/GetUserInfo'
import { HttpError } from '../../utils/HttpError'
import { z } from 'zod'
import { systemPermissionList } from '../../entities/SystemPermission'
import { getUsers } from '../../useCases/GetUsers'
const t = initTRPC.context<Context>().create()

export const userRoutes = t.router({
  create: t.procedure.use(authenticattionMiddleware('OEE_ADMIN'))
    .input(z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
      permissions: z.array(z.enum(systemPermissionList))
    }))
    .mutation(async ({ input }) => {
      return await createUser.execute(input)
    }),

  update: t.procedure.use(authenticattionMiddleware('OEE_ADMIN'))
    .input(z.object({
      id: z.string(),
      data: z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
        permissions: z.array(z.enum(systemPermissionList))
      })
    }))
    .mutation(async ({ input }) => {
      return await updateUser.execute(input)
    }),

  getInfo: t.procedure.use(authenticattionMiddleware())
    .query(async ({ ctx }) => {
      const { user } = ctx
      try {
        return await getUserInfo.execute(user.id)
      } catch (err) {
        throw new HttpError({ code: 'BAD_REQUEST', message: (err as Error).message })
      }
    }),

  getAll: t.procedure.use(authenticattionMiddleware('OEE_ADMIN'))
    .query(async () => {
      return await getUsers.execute()
    })

})
