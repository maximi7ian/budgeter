/**
 * Test sending a budget alert email
 */

import "dotenv/config";
import { sendBudgetAlertForPeriod } from "./src/alertService";

async function testBudgetAlert() {
  console.log("\n=".repeat(60));
  console.log("📊 BUDGET ALERT TEST");
  console.log("=".repeat(60));

  const period: "weekly" | "monthly" = "weekly";

  console.log(`\nSending ${period} budget alert...`);

  try {
    await sendBudgetAlertForPeriod(period);
    console.log("\n✅ Budget alert sent successfully!");
    console.log("=".repeat(60));
  } catch (error: any) {
    console.log("\n❌ Failed to send budget alert");
    console.log(`   Error: ${error.message}`);
    console.log("\n" + "=".repeat(60));
    process.exit(1);
  }
}

testBudgetAlert().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
