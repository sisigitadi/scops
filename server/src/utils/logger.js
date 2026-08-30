/**
 * Structured Logger for SOC OPS BFF
 * Provides consistent log formatting with timestamps, levels, and context.
 * Output is JSON Lines format for easy parsing by log aggregators.
 */

const LOG_LEVELS = { ERROR: 'ERROR', WARN: 'WARN', INFO: 'INFO', DEBUG: 'DEBUG' }

function formatLog(level, category, message, meta = null) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    ...(meta && { meta })
  }
  return JSON.stringify(entry)
}

export const logger = {
  error(category, message, meta = null) {
    console.error(formatLog(LOG_LEVELS.ERROR, category, message, meta))
  },
  warn(category, message, meta = null) {
    console.warn(formatLog(LOG_LEVELS.WARN, category, message, meta))
  },
  info(category, message, meta = null) {
    console.log(formatLog(LOG_LEVELS.INFO, category, message, meta))
  },
  debug(category, message, meta = null) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(formatLog(LOG_LEVELS.DEBUG, category, message, meta))
    }
  }
}

/**
 * Generate a short unique request correlation ID.
 * Used to trace a request through the entire handling pipeline.
 */
let requestCounter = 0
export function generateRequestId() {
  requestCounter = (requestCounter + 1) % 999999
  return `req-${Date.now().toString(36)}-${requestCounter.toString(36).padStart(4, '0')}`
}

/**
 * Express middleware: Attach requestId and log incoming requests
 */
export function requestLogger(req, res, next) {
  req.requestId = generateRequestId()
  const start = Date.now()

  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - start
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'
    logger[level]('HTTP', `${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`, {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration
    })
  })

  next()
}

/**
 * Express middleware: Global error handler (must be registered LAST)
 * Catches unhandled errors and returns a consistent JSON response.
 */
export function globalErrorHandler(err, req, res, _next) {
  const requestId = req.requestId || 'unknown'
  const statusCode = err.statusCode || err.status || 500
  const isServerError = statusCode >= 500

  // Always log server errors with full stack
  if (isServerError) {
    logger.error('UNHANDLED', err.message, {
      requestId,
      path: req.path,
      method: req.method,
      stack: err.stack
    })
  } else {
    logger.warn('CLIENT_ERROR', err.message, {
      requestId,
      path: req.path,
      status: statusCode
    })
  }

  res.status(statusCode).json({
    message: isServerError ? 'Internal server error' : err.message,
    requestId,
    ...(process.env.NODE_ENV !== 'production' && isServerError && { debug: err.message })
  })
}

/**
 * Async route wrapper — catches Promise rejections in Express routes
 * Usage: app.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
