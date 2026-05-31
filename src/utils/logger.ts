export const logger = {
  info: (msg: string) => {
    console.log(`ℹ️ [INFO] [${new Date().toISOString()}]: ${msg}`);
  },
  warn: (msg: string) => {
    console.warn('\x1b[33m%s\x1b[0m', `⚠️ [WARN] [${new Date().toISOString()}]: ${msg}`);
  },
  error: (msg: string, err?: any) => {
    console.error('\x1b[31m%s\x1b[0m', `🔥 [ERROR] [${new Date().toISOString()}]: ${msg}`, err || '');
  },
  success: (msg: string) => {
    console.log('\x1b[32m%s\x1b[0m', `✅ [SUCCESS] [${new Date().toISOString()}]: ${msg}`);
  }
};
