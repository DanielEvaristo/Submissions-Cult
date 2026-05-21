/**
 * Pricing utilities for the submission flow.
 * Centralizes all credit/cost calculations in one place.
 */

export type PremiumService = "INTERVIEW" | "ARTICLE";
export type Channel = "RADAR" | "INTERNET_WAVE" | "SPOTIFY_PLAYLIST" | "STORIES";
export type SubmissionType = "SINGLE" | "EP" | "ALBUM";

export const PREMIUM_PRICES_USD: Record<PremiumService, number> = {
  INTERVIEW: 30,
  ARTICLE: 25,
};

export const ALL_CHANNELS: Channel[] = [
  "RADAR",
  "INTERNET_WAVE",
  "SPOTIFY_PLAYLIST",
  "STORIES",
];

export interface CreditBreakdown {
  base: number;       // SINGLE=0, EP=1, ALBUM=2
  channels: number;   // 0 or 1 (all-channels upgrade)
  fastTrack: number;  // 0 or 1
  review: number;     // 0 or 1 (detailed A&R review)
  total: number;
}

export function calculateCredits(
  submissionType: SubmissionType | "",
  applyAllChannels: boolean,
  fastTrack: boolean,
  reviewRequested: boolean
): CreditBreakdown {
  const base =
    submissionType === "ALBUM" ? 2 : submissionType === "EP" ? 1 : 0;
  const channels = applyAllChannels ? 1 : 0;
  const fastTrackCredits = fastTrack ? 1 : 0;
  const review = reviewRequested ? 1 : 0;
  return {
    base,
    channels,
    fastTrack: fastTrackCredits,
    review,
    total: base + channels + fastTrackCredits + review,
  };
}

/**
 * Credit tiers for purchasing credit packs.
 * Returns the USD price for a given number of credits.
 */
export function creditPackPrice(credits: number): number {
  if (credits <= 0) return 0;
  if (credits >= 20) return 12;
  if (credits >= 10) return 7;
  if (credits >= 5) return 4;
  if (credits === 1) return 1;
  return credits; // 2, 3, 4 → $2, $3, $4
}
