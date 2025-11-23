/**
 * Logger Utility
 * 
 * Provides centralized logging with different log levels.
 * Helps with debugging and monitoring application errors.
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface LogContext {
  [key: string]: any;
}

/**
 * Log an error with context
 * @param message - Error message
 * @param error - Error object or additional context
 * @param context - Additional context information
 */
export function logError(
  message: string,
  error?: unknown,
  context?: LogContext
): void {
  const timestamp = new Date().toISOString();
  const errorDetails = error instanceof Error ? {
    name: error.name,
    message: error.message,
    stack: error.stack,
  } : error;

  console.error(`[${timestamp}] [${LogLevel.ERROR}] ${message}`, {
    error: errorDetails,
    ...context,
  });
}

/**
 * Log a warning with context
 * @param message - Warning message
 * @param context - Additional context information
 */
export function logWarning(message: string, context?: LogContext): void {
  const timestamp = new Date().toISOString();
  console.warn(`[${timestamp}] [${LogLevel.WARN}] ${message}`, context);
}

/**
 * Log an info message with context
 * @param message - Info message
 * @param context - Additional context information
 */
export function logInfo(message: string, context?: LogContext): void {
  const timestamp = new Date().toISOString();
  console.info(`[${timestamp}] [${LogLevel.INFO}] ${message}`, context);
}

/**
 * Log a debug message with context
 * @param message - Debug message
 * @param context - Additional context information
 */
export function logDebug(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    console.debug(`[${timestamp}] [${LogLevel.DEBUG}] ${message}`, context);
  }
}

/**
 * Logger API
 */
export const logger = {
  error: logError,
  warn: logWarning,
  info: logInfo,
  debug: logDebug,
};
