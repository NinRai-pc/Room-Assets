import { Type } from '@sinclair/typebox'
import { FastifyInstance } from 'fastify'

export const roomSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  capacity: Type.Number(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
})

export const createRoomSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  capacity: Type.Number({ minimum: 1 })
})

export const bookingSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  roomId: Type.String(),
  startTime: Type.String({ format: 'date-time' }),
  endTime: Type.String({ format: 'date-time' }),
  notes: Type.Optional(Type.String()),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
})

export const createBookingSchema = Type.Object({
  roomId: Type.String(),
  startTime: Type.String({ format: 'date-time' }),
  endTime: Type.String({ format: 'date-time' }),
  notes: Type.Optional(Type.String())
})

export async function roomRoutes(fastify: FastifyInstance) {
  // List all rooms
  fastify.get(
    '/api/rooms',
    {
      schema: {
        description: 'Get all rooms',
        response: {
          200: Type.Array(roomSchema)
        }
      }
    },
    async (request, reply) => {
      return fastify.prisma.room.findMany()
    }
  )

  // Get room by ID
  fastify.get(
    '/api/rooms/:id',
    {
      schema: {
        description: 'Get room by ID',
        params: Type.Object({ id: Type.String() }),
        response: { 200: roomSchema }
      }
    },
    async (request, reply) => {
      const room = await fastify.prisma.room.findUnique({
        where: { id: (request.params as { id: string }).id }
      })
      if (!room) {
        reply.code(404).send({ error: 'Room not found' })
      }
      return room
    }
  )

  // Create room
  fastify.post(
    '/api/rooms',
    {
      schema: {
        description: 'Create a new room',
        body: createRoomSchema,
        response: { 201: roomSchema }
      }
    },
    async (request, reply) => {
      const room = await fastify.prisma.room.create({
        data: request.body as { name: string; capacity: number }
      })
      reply.code(201)
      return room
    }
  )

  // Delete room
  fastify.delete(
    '/api/rooms/:id',
    {
      schema: {
        description: 'Delete room by ID',
        params: Type.Object({ id: Type.String() })
      }
    },
    async (request, reply) => {
      await fastify.prisma.room.delete({
        where: { id: (request.params as { id: string }).id }
      })
      reply.code(204)
    }
  )
}

export async function bookingRoutes(fastify: FastifyInstance) {
  // List all bookings
  fastify.get(
    '/api/bookings',
    {
      schema: {
        description: 'Get all bookings',
        response: { 200: Type.Array(bookingSchema) }
      }
    },
    async (request, reply) => {
      return fastify.prisma.booking.findMany()
    }
  )

  // Create booking
  fastify.post(
    '/api/bookings',
    {
      schema: {
        description: 'Create a new booking',
        body: createBookingSchema,
        response: { 201: bookingSchema }
      }
    },
    async (request, reply) => {
      const booking = await fastify.prisma.booking.create({
        data: request.body as {
          roomId: string
          startTime: string
          endTime: string
          notes?: string
        }
      })
      reply.code(201)
      return booking
    }
  )
}
