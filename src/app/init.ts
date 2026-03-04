import { startCronJob } from '@/lib/cron';

// Initialize cron job when the app starts
if (typeof window === 'undefined') {
    // Only run on server
    startCronJob();
}

export {};
