import cron from 'node-cron';
import { getNews } from './news';
import { publishToFacebook } from '@/app/actions/facebook';
import { checkIsPublished, saveToPublished, getCronStatus, cleanupOldPosts } from '@/app/actions/db';

let cronJob: cron.ScheduledTask | null = null;
let scheduledPublishTimes: Set<string> = new Set();

function generateRandomSchedule() {
    // Generate 4 random publish times spread throughout the day with random minutes
    const times = new Set<string>();
    const intervals = [6, 12, 18]; // Hours of day for roughly 6-hour intervals
    
    intervals.forEach(hour => {
        const randomMinute = Math.floor(Math.random() * 60); // Random minute (0-59)
        const timeKey = `${hour}:${randomMinute.toString().padStart(2, '0')}`;
        times.add(timeKey);
    });
    
    // Add a 4th publication time for balance
    const randomHour = Math.floor(Math.random() * 24);
    const randomMinute = Math.floor(Math.random() * 60);
    const timeKey = `${randomHour}:${randomMinute.toString().padStart(2, '0')}`;
    times.add(timeKey);
    
    return Array.from(times);
}

function buildCronExpression(times: string[]) {
    // Build a cron expression from time strings
    // Format: 'minute hour * * *'
    // We'll use multiple expressions combined with '|' (OR is not possible in single cron, so we need multiple schedules)
    
    const expressions: string[] = [];
    times.forEach(time => {
        const [hour, minute] = time.split(':');
        expressions.push(`${minute} ${hour} * * *`);
    });
    
    return expressions;
}

export function startCronJob() {
    if (cronJob) {
        console.log('[Cron] Job already running');
        return;
    }

    // Generate initial random schedule
    const scheduleTimes = generateRandomSchedule();
    scheduledPublishTimes = new Set(scheduleTimes);
    
    console.log(`[Cron] Generated random schedule for: ${Array.from(scheduledPublishTimes).join(', ')}`);
    
    // Create multiple cron jobs for each scheduled time or use a single frequent check
    // We'll use a single cron that checks every hour and decides to publish based on schedule
    
    cronJob = cron.schedule('0 * * * *', async () => {
        // Run every hour at minute 0
        const now = new Date();
        const currentTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const isTimeToPublish = Array.from(scheduledPublishTimes).some(scheduledTime => {
            const [schedHour, schedMinute] = scheduledTime.split(':');
            const schedHourNum = parseInt(schedHour);
            const schedMinuteNum = parseInt(schedMinute);
            
            // Check if current time matches scheduled time (within a few minutes tolerance)
            return now.getHours() === schedHourNum && 
                   now.getMinutes() >= schedMinuteNum && 
                   now.getMinutes() < schedMinuteNum + 5;
        });
        
        if (isTimeToPublish) {
            console.log(`[Cron] Scheduled trigger at ${new Date().toISOString()}`);
            await publishNewsAutomatically();
        }
    });

    console.log(`[Cron] News publishing scheduled with randomized times: ${Array.from(scheduledPublishTimes).join(', ')}`);
}

export function stopCronJob() {
    if (cronJob) {
        cronJob.stop();
        cronJob = null;
        console.log('[Cron] Job stopped');
    }
}

async function publishNewsAutomatically() {
    try {
        // Check if cron is enabled in Firebase
        const isEnabled = await getCronStatus();
        if (!isEnabled) {
            console.log('[Cron] Cron is disabled in settings');
            return;
        }

        const categories = ['general', 'technology', 'business', 'science'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];

        console.log(`[Cron] Fetching news from category: ${randomCategory}`);
        const articles = await getNews(randomCategory);

        if (!articles || articles.length === 0) {
            console.log('[Cron] No articles found');
            return;
        }

        // Find first unpublished article
        let articleToPublish = null;
        for (const article of articles) {
            const isPublished = await checkIsPublished(article.url);
            if (!isPublished) {
                articleToPublish = article;
                break;
            }
        }

        if (!articleToPublish) {
            console.log('[Cron] All articles already published');
            return;
        }

        // Publish to Facebook
        try {
            const result = await publishToFacebook({
                title: articleToPublish.title,
                url: articleToPublish.url,
                description: articleToPublish.description,
                urlToImage: articleToPublish.urlToImage,
            });

            if (result.success) {
                const saveResult = await saveToPublished({
                    title: articleToPublish.title,
                    url: articleToPublish.url,
                    fbPostId: result.postId,
                    category: randomCategory
                });
                
                if (saveResult.success) {
                    console.log(`[Cron] ✓ Published & saved: ${articleToPublish.title}`);
                    
                    // Run cleanup after successful publish
                    // Cleanup runs only once daily to avoid excessive database queries
                    const now = new Date();
                    if (now.getHours() === 0 && now.getMinutes() < 5) {
                        // Run cleanup at midnight
                        const cleanupResult = await cleanupOldPosts();
                        if (cleanupResult.success) {
                            console.log(`[Cleanup] Deleted ${cleanupResult.deleted} old posts`);
                        }
                    }
                } else {
                    console.error('[Cron] Failed to save to DB:', saveResult.error);
                }
            } else {
                console.error('[Cron] Failed to publish to Facebook');
            }
        } catch (error) {
            console.error('[Cron] Error publishing to Facebook:', error);
        }
    } catch (error) {
        console.error('[Cron] Error in publishNewsAutomatically:', error);
    }
}
