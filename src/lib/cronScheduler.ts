const CRON_URL = 'https://functions.poehali.dev/8f458e25-5c18-45c7-bb0f-00be10d4213b';
const CRON_INTERVAL = 24 * 60 * 60 * 1000;

let cronTimer: NodeJS.Timeout | null = null;

export const startCronScheduler = () => {
  if (cronTimer) {
    console.log('⏰ CRON scheduler already running');
    return;
  }

  const runCron = async () => {
    try {
      console.log('⏰ [CRON] Starting automatic schemes update...');
      const response = await fetch(CRON_URL);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ [CRON] ${data.message}`);
        console.log(`📊 [CRON] New: ${data.new_schemes}, Deleted: ${data.deleted_schemes}`);
      } else {
        console.error('❌ [CRON] Update failed:', data);
      }
    } catch (error) {
      console.error('❌ [CRON] Error:', error);
    }
  };

  runCron();

  cronTimer = setInterval(runCron, CRON_INTERVAL);
  console.log(`⏰ CRON scheduler started: updating every 24 hours`);
};

export const stopCronScheduler = () => {
  if (cronTimer) {
    clearInterval(cronTimer);
    cronTimer = null;
    console.log('⏰ CRON scheduler stopped');
  }
};
