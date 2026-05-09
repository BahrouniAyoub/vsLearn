import type { StreakInfo } from "./types";
import { todayDate, daysBetween } from "./types";

export function computeStreak(
  activityDates: string[],
  longestStreak: number,
): StreakInfo {
  const today = todayDate();

  if (activityDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: "",
      activeToday: false,
      atRisk: false,
    };
  }

  const sorted = [...new Set(activityDates)].sort().reverse();
  const lastDate = sorted[0];
  const activeToday = lastDate === today;
  const daysSinceLast = daysBetween(today, lastDate);
  const atRisk = !activeToday && daysSinceLast === 1;

  let currentStreak = 0;
  const todayDateObj = new Date(today);

  for (const dateStr of sorted) {
    const expected = new Date(todayDateObj);
    expected.setDate(expected.getDate() - currentStreak);
    const expectedStr = expected.toISOString().slice(0, 10);
    if (dateStr === expectedStr) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    lastActivityDate: lastDate,
    activeToday,
    atRisk,
  };
}

export function recordActivity(
  activityDates: string[],
  longestStreak: number,
): { activityDates: string[]; currentStreak: number; longestStreak: number } {
  const today = todayDate();
  if (activityDates[activityDates.length - 1] === today) {
    return { activityDates, currentStreak: computeStreak(activityDates, longestStreak).currentStreak, longestStreak };
  }
  const updated = [...activityDates, today];
  const streak = computeStreak(updated, longestStreak);
  return {
    activityDates: updated,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
  };
}

export function streakLabel(streak: number): string {
  if (streak === 0) return "Start your streak";
  if (streak === 1) return "1 day";
  if (streak < 7) return `${streak} day streak`;
  if (streak < 14) return `${streak} day streak 🔥`;
  if (streak < 30) return `${streak} day streak 🔥🔥`;
  if (streak < 60) return `${streak} day streak 🔥🔥🔥`;
  if (streak < 100) return `${streak} day streak 🔥🔥🔥🔥`;
  return `${streak} day streak 💪`;
}
