import type { XpEvent } from "./types";

const XP_LESSON_COMPLETE = 50;
const XP_CHALLENGE_PASS = 100;
const XP_STREAK_BONUS = 25;
const XP_QUIZ_CORRECT = 15;
const XP_COURSE_COMPLETE = 500;
const XP_MODULE_COMPLETE = 150;
const XP_FIRST_OF_DAY = 20;

const LEVEL_THRESHOLDS = [
  0, 200, 500, 1000, 1800, 2800, 4000, 5500, 7500, 10000,
  13000, 17000, 22000, 28000, 35000, 43000, 52000, 62000, 73000, 85000,
];

export function levelForXp(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function xpForNextLevel(xp: number): number {
  const level = levelForXp(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold + 500;
  return nextThreshold - currentThreshold;
}

export function xpProgressInLevel(xp: number): number {
  const level = levelForXp(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold + 500;
  return Math.min(100, Math.round(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100));
}

export function calculateXp(
  category: XpEvent["category"],
  streak: number,
  extras?: { score?: number; totalQuestions?: number; isFirstToday?: boolean },
): number {
  let base = 0;

  switch (category) {
    case "lesson":
      base = XP_LESSON_COMPLETE;
      break;
    case "challenge":
      base = XP_CHALLENGE_PASS;
      break;
    case "quiz":
      if (extras?.score != null && extras?.totalQuestions) {
        base = Math.round((extras.score / extras.totalQuestions) * XP_QUIZ_CORRECT * 4);
      } else {
        base = XP_QUIZ_CORRECT;
      }
      break;
    case "streak":
      base = XP_STREAK_BONUS;
      break;
    case "course":
      base = XP_COURSE_COMPLETE;
      break;
  }

  const streakMultiplier = 1 + Math.min(streak, 30) * 0.02;
  let total = Math.round(base * streakMultiplier);

  if (extras?.isFirstToday) {
    total += XP_FIRST_OF_DAY;
  }

  return total;
}

export function createXpEvent(
  amount: number,
  reason: string,
  category: XpEvent["category"],
): XpEvent {
  return {
    id: `xp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    amount,
    reason,
    timestamp: new Date().toISOString(),
    category,
  };
}
