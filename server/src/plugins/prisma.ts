import fp from 'fastify-plugin'
import { PrismaClient } from '../generated/prisma/client.js'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

export default fp(async (app) => {
  const prisma = new PrismaClient()
  
  app.decorate('prisma', prisma)

  app.addHook('onClose', async (inst) => {
    await inst.prisma.$disconnect()
  })
})
