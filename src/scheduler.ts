/**
 * Cron scheduler for automated email alerts
 */

import * as cron from "node-cron";
import { sendBudgetAlertForPeriod } from "./alertService";

let weeklyJob: ReturnType<typeof cron.schedule> | null = null;
let monthlyJob: ReturnType<typeof cron.schedule> | null = null;

/**
 * Start scheduled jobs
 */
export function startScheduler() {
  // Weekly schedule from env (if not set, don't schedule)
  const weeklySchedule = process.env.WEEKLY_CRON_SCHEDULE;
  // Monthly schedule from env (if not set, don't schedule)
  const monthlySchedule = process.env.MONTHLY_CRON_SCHEDULE;

  // Start weekly job if configured
  if (weeklySchedule) {
    if (cron.validate(weeklySchedule)) {
      weeklyJob = cron.schedule(weeklySchedule, async () => {
        console.log("\n⏰ Triggered weekly budget alert");
        try {
          await sendBudgetAlertForPeriod("weekly");
          console.log("✅ Weekly budget alert sent successfully");
        } catch (error: any) {
          console.error("❌ Weekly budget alert failed:", error.message);
        }
      });
      console.log(`✅ Weekly alerts scheduled: ${weeklySchedule}`);
    } else {
      console.warn(`⚠️  Invalid weekly cron schedule: ${weeklySchedule}`);
    }
  } else {
    console.log("ℹ️  Weekly alerts not configured (set WEEKLY_CRON_SCHEDULE in .env)");
  }

  // Start monthly job if configured
  if (monthlySchedule) {
    if (cron.validate(monthlySchedule)) {
      monthlyJob = cron.schedule(monthlySchedule, async () => {
        console.log("\n⏰ Triggered monthly budget alert");
        try {
          await sendBudgetAlertForPeriod("monthly");
          console.log("✅ Monthly budget alert sent successfully");
        } catch (error: any) {
          console.error("❌ Monthly budget alert failed:", error.message);
        }
      });
      console.log(`✅ Monthly alerts scheduled: ${monthlySchedule}`);
    } else {
      console.warn(`⚠️  Invalid monthly cron schedule: ${monthlySchedule}`);
    }
  } else {
    console.log("ℹ️  Monthly alerts not configured (set MONTHLY_CRON_SCHEDULE in .env)");
  }

  if (!weeklySchedule && !monthlySchedule) {
    console.log("ℹ️  No automated alerts configured (set WEEKLY_CRON_SCHEDULE or MONTHLY_CRON_SCHEDULE in .env)");
  }
}

/**
 * Stop all scheduled jobs
 */
export function stopScheduler() {
  if (weeklyJob) {
    weeklyJob.stop();
    weeklyJob = null;
    console.log("⏹️  Stopped weekly alerts");
  }
  if (monthlyJob) {
    monthlyJob.stop();
    monthlyJob = null;
    console.log("⏹️  Stopped monthly alerts");
  }
}

