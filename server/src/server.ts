import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import prismaPlugin from './plugins/prisma.js'
import { roomRoutes, bookingRoutes } from './routes.js'

async function start() {
  const fastify = Fastify({ logger: true })

  // Register plugins
  await fastify.register(cors, { origin: true })
  await fastify.register(helmet)
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes'
  })
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Room Assets API',
        description: 'API for managing rooms and bookings',
        version: '0.1.0'
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server'
        }
      ]
    }
  })

  // Register prisma plugin
  await fastify.register(prismaPlugin)

  // Root endpoint
  fastify.get('/', async (request, reply) => {
    return { message: 'Room Assets API', version: '0.1.0', docs: '/documentation' }
  })

  // Health check endpoint
  fastify.get('/api/health', async (request, reply) => {
    try {
      // Verify database is connected
      await fastify.prisma.$queryRaw`SELECT 1`
      return { status: 'ok', timestamp: new Date().toISOString() }
    } catch (error) {
      reply.status(503)
      return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  // Register routes
  await fastify.register(roomRoutes)
  await fastify.register(bookingRoutes)

  // Serve OpenAPI schema
  fastify.get('/openapi.json', async (request, reply) => {
    return fastify.swagger()
  })

  const PORT = parseInt(process.env.PORT || '3000', 10)
  const HOST = process.env.HOST || '0.0.0.0'

  try {
    await fastify.listen({ port: PORT, host: HOST })
    fastify.log.info(`Server listening on ${HOST}:${PORT}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
