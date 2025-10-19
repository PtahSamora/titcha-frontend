/**
 * Room debugging logger
 * Only logs in development mode
 */
export const log = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[ROOM]', ...args);
  }
};

export const logError = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ROOM ERROR]', ...args);
  }
};

export const logWarning = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[ROOM WARN]', ...args);
  }
};
