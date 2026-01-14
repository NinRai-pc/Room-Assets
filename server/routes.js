module.exports = async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    return { message: 'Room Assets API', version: '0.1.0', docs: '/documentation' };
  });

  fastify.get('/api/health', async (request, reply) => {
    return { status: 'ok', timestamp: Date.now() };
  });

  fastify.get('/api/rooms', async (request, reply) => {
    return [
      { id: 1, name: 'Conference A', capacity: 8 },
      { id: 2, name: 'Huddle B', capacity: 4 }
    ];
  });

  fastify.post('/api/echo', async (request, reply) => {
    return { body: request.body };
  });
};
