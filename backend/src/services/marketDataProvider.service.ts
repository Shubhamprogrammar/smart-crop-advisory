/**
 * Market data provider — currently SIMULATED, at the user's explicit
 * request, since no real market-price API is connected yet (would need a
 * free data.gov.in Agmarknet API key). Isolated behind this module
 * specifically so it can be swapped for a real provider later without
 * touching market.service.ts or any route/controller code — same pattern
 * as weatherProvider.service.ts (Phase 5).
 *
 * Every value this module returns is fabricated for demo purposes and
 * must never be labeled "real_data" by any caller (see DATA_SOURCE in
 * constants/enums.ts). Mandi *names and locations* below are real,
 * existing APMC markets (approximate city-level coordinates) — only the
 * *prices* are simulated; this keeps "nearby mandis" demo-meaningful
 * without fabricating place names too.
 */

// Simulated baseline prices (INR/quintal) — plausible order-of-magnitude
// reference points for demo purposes, not sourced from any real quote.
const BASE_PRICES_PER_QUINTAL: Record<string, number> = {
  rice: 2000,
  maize: 1900,
  wheat: 2200,
  tomato: 1500,
  potato: 1200,
  chickpea: 5000,
  kidneybeans: 7000,
  pigeonpeas: 6500,
  mothbeans: 5500,
  mungbean: 7500,
  blackgram: 6800,
  lentil: 6000,
  pomegranate: 8000,
  banana: 1500,
  mango: 4000,
  grapes: 5000,
  watermelon: 800,
  muskmelon: 1000,
  apple: 8000,
  orange: 3000,
  papaya: 1200,
  coconut: 2500,
  cotton: 6500,
  jute: 4500,
  coffee: 15000,
};
const DEFAULT_BASE_PRICE = 2000;

export interface ReferenceMandi {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}

// Real, existing APMC markets; coordinates are approximate (city-level).
export const REFERENCE_MANDIS: ReferenceMandi[] = [
  { name: "Pune APMC (Market Yard)", state: "Maharashtra", latitude: 18.5074, longitude: 73.8677 },
  { name: "Nashik APMC", state: "Maharashtra", latitude: 19.9975, longitude: 73.7898 },
  { name: "Vashi APMC (Navi Mumbai)", state: "Maharashtra", latitude: 19.0759, longitude: 73.0022 },
  { name: "Azadpur Mandi", state: "Delhi", latitude: 28.7041, longitude: 77.1638 },
  { name: "Ahmedabad APMC", state: "Gujarat", latitude: 23.0225, longitude: 72.5714 },
  { name: "Indore Mandi", state: "Madhya Pradesh", latitude: 22.7196, longitude: 75.8577 },
  { name: "Yeshwantpur APMC (Bengaluru)", state: "Karnataka", latitude: 13.0234, longitude: 77.554 },
  { name: "Koyambedu Market (Chennai)", state: "Tamil Nadu", latitude: 13.0694, longitude: 80.1948 },
];

export interface SimulatedPrice {
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// mulberry32 — small, deterministic PRNG so the same (crop, market, date)
// always yields the same simulated price, keeping "historical" series
// internally consistent across repeated requests rather than re-rolling
// random noise every call.
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dayIndex(date: Date): number {
  return Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
}

export function getSimulatedPrice(cropName: string, market: string, date: Date): SimulatedPrice {
  const basePrice = BASE_PRICES_PER_QUINTAL[cropName.toLowerCase()] ?? DEFAULT_BASE_PRICE;

  const seed = hashSeed(`${cropName}|${market}|${dayIndex(date)}`);
  const rand = seededRandom(seed);

  // Slow seasonal-ish drift (multi-day sine wave) plus small daily noise,
  // so a plotted series looks like a plausible price chart rather than
  // pure white noise or a flat line.
  const drift = Math.sin(dayIndex(date) / 17) * 0.08;
  const noise = (rand() - 0.5) * 0.06;
  const modalPrice = Math.round(basePrice * (1 + drift + noise));

  return {
    minPrice: Math.round(modalPrice * 0.94),
    maxPrice: Math.round(modalPrice * 1.06),
    modalPrice,
  };
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestMandis(
  latitude: number,
  longitude: number,
  limit = 5
): (ReferenceMandi & { distanceKm: number })[] {
  return REFERENCE_MANDIS.map((m) => ({
    ...m,
    distanceKm: Math.round(haversineDistanceKm(latitude, longitude, m.latitude, m.longitude)),
  }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
