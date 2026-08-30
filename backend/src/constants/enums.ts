export const ROLES = ["farmer", "expert", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const LANGUAGES = ["en", "hi", "mr", "gu"] as const;
export type Language = (typeof LANGUAGES)[number];

export const PRIORITY_LEVELS = ["low", "medium", "high"] as const;
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

export const RISK_LEVELS = ["low", "medium", "high"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const CROP_STAGES = [
  "sowing",
  "germination",
  "vegetative",
  "flowering",
  "fruiting",
  "harvest",
] as const;
export type CropStage = (typeof CROP_STAGES)[number];

export const IRRIGATION_TYPES = [
  "rainfed",
  "canal",
  "borewell",
  "drip",
  "sprinkler",
  "other",
] as const;
export type IrrigationType = (typeof IRRIGATION_TYPES)[number];

export const NOTIFICATION_TYPES = [
  "weather",
  "disease",
  "irrigation",
  "fertilizer",
  "pest",
  "harvest",
  "market",
  "general",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_CHANNELS = ["browser", "email", "sms", "whatsapp"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

// Initial supported crops for disease detection (per spec §H — realistic limited set).
export const SUPPORTED_DISEASE_CROPS = [
  "tomato",
  "potato",
  "rice",
  "wheat",
  "cotton",
  "maize",
] as const;
export type SupportedDiseaseCrop = (typeof SUPPORTED_DISEASE_CROPS)[number];

export const SEASONS = ["kharif", "rabi", "zaid", "perennial"] as const;
export type Season = (typeof SEASONS)[number];

export const DATA_SOURCE = ["real_data", "ai_prediction"] as const;
export type DataSource = (typeof DATA_SOURCE)[number];

export const CALENDAR_TASK_TYPES = [
  "fertilizer",
  "irrigation",
  "pest_monitoring",
  "disease_monitoring",
  "harvest",
  "general",
] as const;
export type CalendarTaskType = (typeof CALENDAR_TASK_TYPES)[number];
