import { CronJob } from 'cron';
import { SavedSearch } from '../models/SavedSearch.model.js';
import { Load } from '../models/Load.model.js';
import { emailService } from './email.service.js';
import { logger } from '../utils/logger.js';

class AlertCronService {
  private cronJob: CronJob | null = null;

  /**
   * Start alert cron job
   */
  start(): void {
    // Run every hour
    this.cronJob = new CronJob('0 * * * *', async () => {
      await this.processAlerts();
    });
    
    this.cronJob.start();
    logger.info('Alert cron job started - running every hour');
  }

  /**
   * Stop alert cron job
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      logger.info('Alert cron job stopped');
    }
  }

  /**
   * Process all saved searches and send alerts
   */
  private async processAlerts(): Promise<void> {
    try {
      logger.info('Running alert processing job');

      // Get all active saved searches
      const searches = await SavedSearch.find({ alertEnabled: true }).populate('userId', 'email company');

      for (const search of searches) {
        // Determine if alert should be sent based on frequency
        const shouldSend = this.shouldSendAlert(search);
        if (!shouldSend) continue;

        // Find matching loads
        const matchingLoads = await this.findMatchingLoads(search);
        
        if (matchingLoads.length > 0) {
          await this.sendAlert(search, matchingLoads);
          
          // Update last alert sent time
          search.lastAlertSent = new Date();
          await search.save();
        }
      }

      logger.info('Alert processing completed');
    } catch (error: any) {
      logger.error('Error processing alerts', { error: error.message });
    }
  }

  /**
   * Check if alert should be sent based on frequency and last sent time
   */
  private shouldSendAlert(search: any): boolean {
    if (!search.lastAlertSent) return true;

    const now = new Date();
    const lastSent = new Date(search.lastAlertSent);
    const hoursSince = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);

    switch (search.frequency) {
      case 'instant':
        return hoursSince >= 1; // At least 1 hour ago
      case 'daily':
        return hoursSince >= 24; // At least 24 hours ago
      case 'weekly':
        return hoursSince >= 168; // At least 7 days ago
      default:
        return false;
    }
  }

  /**
   * Find loads matching saved search criteria
   */
  private async findMatchingLoads(search: any): Promise<any[]> {
    const query: any = { status: 'available' };

    // Equipment type filter
    if (search.filters.equipment && search.filters.equipment.length > 0) {
      query.equipmentType = { $in: search.filters.equipment };
    }

    // Price range filter
    if (search.filters.priceMin || search.filters.priceMax) {
      query.rate = {};
      if (search.filters.priceMin) query.rate.$gte = search.filters.priceMin;
      if (search.filters.priceMax) query.rate.$lte = search.filters.priceMax;
    }

    // State filters
    if (search.filters.originState) {
      query['origin.state'] = search.filters.originState;
    }
    if (search.filters.destinationState) {
      query['destination.state'] = search.filters.destinationState;
    }

    // Date range filter
    if (search.filters.dateRange) {
      query.pickupDate = {
        $gte: search.filters.dateRange.from,
        $lte: search.filters.dateRange.to
      };
    }

    // Get loads matching criteria
    const loads = await Load.find(query)
      .populate('postedBy', 'company email')
      .limit(50); // Max 50 loads per alert

    return loads.map(load => load.toObject());
  }

  /**
   * Send alert email to user
   */
  private async sendAlert(search: any, matchingLoads: any[]): Promise<void> {
    try {
      const userEmail = (search.userId as any).email;
      const userName = (search.userId as any).company || 'Valued User';

      if (!userEmail) {
        logger.warn('No email found for saved search', { searchId: search._id });
        return;
      }

      // Generate load list HTML
      const loadListHtml = matchingLoads.map(load => `
        <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
          <h3 style="color: #2563eb; margin: 0 0 10px 0;">${load.title}</h3>
          <p><strong>Origin:</strong> ${load.origin.city}, ${load.origin.state}</p>
          <p><strong>Destination:</strong> ${load.destination.city}, ${load.destination.state}</p>
          <p><strong>Equipment:</strong> ${load.equipmentType}</p>
          <p><strong>Rate:</strong> $${load.rate.toLocaleString()}</p>
        </div>
      `).join('');

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Loads Matching Your Saved Search</h2>
          <p>Hi ${userName},</p>
          <p>We found <strong>${matchingLoads.length}</strong> new load${matchingLoads.length > 1 ? 's' : ''} matching your saved search "<strong>${search.name}</strong>":</p>
          ${loadListHtml}
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://cargolume.netlify.app/loads" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Load Board
            </a>
          </div>
        </div>
      `;

      await emailService.sendEmail({
        to: userEmail,
        subject: `New Loads Matching "${search.name}"`,
        html: htmlContent
      });

      logger.info('Alert sent', { 
        searchId: search._id, 
        userId: search.userId._id,
        loadCount: matchingLoads.length 
      });
    } catch (error: any) {
      logger.error('Failed to send alert', { error: error.message, searchId: search._id });
    }
  }
}

export const alertCronService = new AlertCronService();

