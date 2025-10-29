import winston from 'winston';
import { config } from '../config/environment.js';

const logLevel = config.NODE_ENV === 'production' ? 'info' : 'debug';

// Create Winston logger
export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'cargolume-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp, ...metadata }) => {
            let msg = `${timestamp} [${level}]: ${message}`;
            if (Object.keys(metadata).length > 0) {
              msg += ` ${JSON.stringify(metadata)}`;
            }
            return msg;
          }
        )
      ),
    }),
  ],
});

// Simplified log function for backwards compatibility
export function log(level: string, message: string, meta: Record<string, any> = {}): void {
  logger.log(level, message, meta);
}




