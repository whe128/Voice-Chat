// utils/logger.ts

const getInitialValue = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  const stored = localStorage.getItem('log_enabled');

  return stored === 'true';
};

export const openLog: { value: boolean } = { value: getInitialValue() };

export const setLoggerEnabled = (enabled: boolean): void => {
  openLog.value = enabled;

  if (typeof window !== 'undefined') {
    localStorage.setItem('log_enabled', String(enabled));
  }
};

export const logger = {
  log: (...args: unknown[]): void => {
    if (openLog.value) {
      console.log(...args);
    }
  },

  warn: (...args: unknown[]): void => {
    if (openLog.value) {
      console.warn(...args);
    }
  },

  error: (...args: unknown[]): void => {
    if (openLog.value) {
      console.error(...args);
    }
  },
};
