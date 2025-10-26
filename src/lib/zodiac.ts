/**
 * Zodiac Sign Utility
 *
 * Determines astrology sign based on date of birth
 * Used for personalizing AI interactions
 */

interface ZodiacDate {
  sign: string;
  start: [number, number]; // [month, day]
  end: [number, number];   // [month, day]
}

const zodiacSigns: ZodiacDate[] = [
  { sign: "Capricorn", start: [12, 22], end: [1, 19] },
  { sign: "Aquarius", start: [1, 20], end: [2, 18] },
  { sign: "Pisces", start: [2, 19], end: [3, 20] },
  { sign: "Aries", start: [3, 21], end: [4, 19] },
  { sign: "Taurus", start: [4, 20], end: [5, 20] },
  { sign: "Gemini", start: [5, 21], end: [6, 20] },
  { sign: "Cancer", start: [6, 21], end: [7, 22] },
  { sign: "Leo", start: [7, 23], end: [8, 22] },
  { sign: "Virgo", start: [8, 23], end: [9, 22] },
  { sign: "Libra", start: [9, 23], end: [10, 22] },
  { sign: "Scorpio", start: [10, 23], end: [11, 21] },
  { sign: "Sagittarius", start: [11, 22], end: [12, 21] },
];

/**
 * Get zodiac sign from date of birth
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Zodiac sign name or "Unknown" if invalid date
 */
export function getZodiacSign(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;

    const sign = zodiacSigns.find(z => {
      // Handle Capricorn (crosses year boundary)
      if (z.sign === "Capricorn") {
        return (month === z.start[0] && day >= z.start[1]) ||
               (month === z.end[0] && day <= z.end[1]);
      }
      // All other signs
      return (month === z.start[0] && day >= z.start[1]) ||
             (month === z.end[0] && day <= z.end[1]);
    });

    return sign?.sign || "Unknown";
  } catch (error) {
    console.error('Error determining zodiac sign:', error);
    return "Unknown";
  }
}

/**
 * Get zodiac emoji for a given sign
 */
export function getZodiacEmoji(sign: string): string {
  const emojiMap: Record<string, string> = {
    Aries: "♈",
    Taurus: "♉",
    Gemini: "♊",
    Cancer: "♋",
    Leo: "♌",
    Virgo: "♍",
    Libra: "♎",
    Scorpio: "♏",
    Sagittarius: "♐",
    Capricorn: "♑",
    Aquarius: "♒",
    Pisces: "♓",
  };
  return emojiMap[sign] || "⭐";
}
