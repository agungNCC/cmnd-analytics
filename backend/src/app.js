import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import { requestLogger } from './middleware/requestLogger.js'
import { errorHandler } from './middleware/errorHandler.js'
import authRouter   from './routes/auth.js'
import dataRouter   from './routes/data.js'
import uploadRouter from './routes/upload.js'
import exportRouter from './routes/export.js'
import adminRouter  from './routes/admin.js'

const app = express()

// Behind Nginx in production: trust one hop so rate-limit and req.ip work.
app.set('trust proxy', 1)

// Security & parsing
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(requestLogger)

// Rate limit login saja — /me dan /logout tidak ikut dihitung
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait a few minutes.' },
}))

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// Routes
app.use('/api/auth',   authRouter)
app.use('/api/data',   dataRouter)
app.use('/api',        uploadRouter)
app.use('/api/export', exportRouter)
app.use('/api/admin',  adminRouter)

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

// Error handler
app.use(errorHandler)

export default app
