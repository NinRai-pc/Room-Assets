const Fastify = require('fastify');
const path = require('path');

const fastify = Fastify({ logger: true });

fastify.register(require('@fastify/cors'), { origin: true });

fastify.register(require('./routes'));

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const start = async () => {
  try {
    await fastify.listen({ port: Number(PORT), host: HOST });
    fastify.log.info(`Server listening on ${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
