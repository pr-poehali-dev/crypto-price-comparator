const CRON_URL = 'https://functions.poehali.dev/8f458e25-5c18-45c7-bb0f-00be10d4213b';
const CRON_INTERVAL = 24 * 60 * 60 * 1000;

let cronTimer: NodeJS.Timeout | null = null;

export const startCronScheduler = () => {
  console.log('⏰ CRON scheduler disabled');
};

export const stopCronScheduler = () => {
  if (cronTimer) {
    clearInterval(cronTimer);
    cronTimer = null;
    console.log('⏰ CRON scheduler stopped');
  }
};