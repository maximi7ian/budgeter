/**
 * Helper functions for working with cron expressions
 */

/**
 * Parse cron expression into human-readable text
 * Format: minute hour day month weekday
 */
export function parseCronExpression(cronExpr: string): string {
  const parts = cronExpr.trim().split(/\s+/);

  if (parts.length !== 5) {
    return cronExpr; // Return as-is if not a standard 5-part cron
  }

  const [minute, hour, day, month, weekday] = parts;

  // Time part
  const timeStr = formatTime(hour, minute);

  // Day/frequency part
  let frequencyStr = "";

  // Check if it's a weekly schedule (weekday is specified)
  if (weekday !== "*") {
    const dayName = getDayName(weekday);
    frequencyStr = `every ${dayName}`;
  }
  // Check if it's a monthly schedule (day of month is specified)
  else if (day !== "*") {
    const dayNum = day;
    frequencyStr = `on the ${getOrdinal(dayNum)} of each month`;
  }
  // Daily
  else if (hour !== "*" && minute !== "*") {
    frequencyStr = "every day";
  }
  // Every hour
  else if (minute !== "*" && hour === "*") {
    frequencyStr = "every hour";
  }
  // Complex/custom
  else {
    return `Custom schedule: ${cronExpr}`;
  }

  return `${frequencyStr} at ${timeStr}`;
}

function formatTime(hour: string, minute: string): string {
  if (hour === "*" && minute === "*") return "every minute";
  if (hour === "*") return `:${minute.padStart(2, "0")}`;

  const h = parseInt(hour);
  const m = parseInt(minute);

  if (isNaN(h) || isNaN(m)) return `${hour}:${minute}`;

  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const displayMinute = m.toString().padStart(2, "0");

  return `${displayHour}:${displayMinute} ${period}`;
}

function getDayName(weekday: string): string {
  const days: { [key: string]: string } = {
    "0": "Sunday",
    "1": "Monday",
    "2": "Tuesday",
    "3": "Wednesday",
    "4": "Thursday",
    "5": "Friday",
    "6": "Saturday",
    "7": "Sunday", // Some systems use 7 for Sunday
  };

  return days[weekday] || `day ${weekday}`;
}

function getOrdinal(day: string): string {
  const num = parseInt(day);
  if (isNaN(num)) return day;

  const suffix = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return num + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
}
