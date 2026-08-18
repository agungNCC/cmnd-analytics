import { createClient } from 'redis'

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD || undefined,
})

client.on('error', (err) => console.error('Redis client error:', err))

await client.connect()

export default client
