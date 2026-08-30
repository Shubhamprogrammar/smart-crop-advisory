import { CropStage, CalendarTaskType } from "../constants/enums";
import { CalendarStage, CalendarTask } from "../models/CropCalendar.model";

/**
 * Generic stage-duration template, expressed as a fraction of the crop's
 * total growth duration. This is a simplification applied uniformly across
 * crops (a real agronomic calendar varies stage-by-stage per crop) — a
 * reasonable planning default for a hackathon-scope calendar, not a
 * precise claim, and documented as such.
 */
const STAGE_TEMPLATE: { name: CropStage; startFraction: number; endFraction: number }[] = [
  { name: "sowing", startFraction: 0, endFraction: 0.03 },
  { name: "germination", startFraction: 0.03, endFraction: 0.12 },
  { name: "vegetative", startFraction: 0.12, endFraction: 0.45 },
  { name: "flowering", startFraction: 0.45, endFraction: 0.62 },
  { name: "fruiting", startFraction: 0.62, endFraction: 0.88 },
  { name: "harvest", startFraction: 0.88, endFraction: 1.0 },
];

interface TaskTemplate {
  title: string;
  description: string;
  type: CalendarTaskType;
  /** Position within the stage's date range, 0 = start date, 1 = end date. */
  dueFraction: number;
}

const TASK_TEMPLATES: Record<CropStage, TaskTemplate[]> = {
  sowing: [
    {
      title: "Prepare land and sow",
      description: "Prepare the field and sow seeds/seedlings at the recommended spacing for this crop.",
      type: "general",
      dueFraction: 0,
    },
    {
      title: "Ensure adequate soil moisture",
      description: "Irrigate before/at sowing so the soil has enough moisture for germination.",
      type: "irrigation",
      dueFraction: 0.5,
    },
  ],
  germination: [
    {
      title: "Monitor germination",
      description: "Check germination rate after a few days and gap-fill any bare patches.",
      type: "general",
      dueFraction: 0.5,
    },
    {
      title: "Light, frequent irrigation",
      description: "Keep the soil consistently moist (not waterlogged) while seedlings establish.",
      type: "irrigation",
      dueFraction: 0.8,
    },
  ],
  vegetative: [
    {
      title: "Apply vegetative-stage fertilizer",
      description:
        "Apply a basal/vegetative-stage fertilizer dose based on your soil test results — consult a local expert or soil report for exact quantity.",
      type: "fertilizer",
      dueFraction: 0.2,
    },
    {
      title: "Weed control",
      description: "Remove weeds competing with the crop for nutrients, light, and water.",
      type: "general",
      dueFraction: 0.5,
    },
    {
      title: "Monitor for early pest activity",
      description: "Inspect leaves and stems regularly for early signs of pest damage.",
      type: "pest_monitoring",
      dueFraction: 0.8,
    },
  ],
  flowering: [
    {
      title: "Avoid water stress",
      description: "Flowering is a water-sensitive stage — avoid letting the soil dry out completely.",
      type: "irrigation",
      dueFraction: 0.3,
    },
    {
      title: "Monitor for flower/bud pests",
      description: "Check for pests that target flowers or buds, which can reduce fruit/grain set.",
      type: "pest_monitoring",
      dueFraction: 0.6,
    },
  ],
  fruiting: [
    {
      title: "Monitor for pests and disease",
      description: "Inspect developing fruit/pods/grain regularly — this stage is often most vulnerable to loss.",
      type: "disease_monitoring",
      dueFraction: 0.2,
    },
    {
      title: "Maintain consistent irrigation",
      description: "Keep irrigation consistent through fruit/grain development to avoid stress-related losses.",
      type: "irrigation",
      dueFraction: 0.5,
    },
    {
      title: "Consider top-dressing fertilizer",
      description: "If recommended for this crop, apply a top-dressing fertilizer dose based on soil/crop condition.",
      type: "fertilizer",
      dueFraction: 0.7,
    },
  ],
  harvest: [
    {
      title: "Check maturity indicators",
      description: "Watch for this crop's typical maturity signs (color, firmness, moisture) before harvesting.",
      type: "harvest",
      dueFraction: 0.2,
    },
    {
      title: "Plan harvest timing",
      description: "Time the harvest to avoid rain or extreme heat where possible, to reduce post-harvest loss.",
      type: "harvest",
      dueFraction: 0.5,
    },
    {
      title: "Arrange storage and market logistics",
      description: "Plan storage and transport, and check current market prices before selling.",
      type: "general",
      dueFraction: 0.8,
    },
  ],
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + Math.round(days));
  return result;
}

export function generateCropCalendarStages(sowingDate: Date, growthDurationDays: number): CalendarStage[] {
  return STAGE_TEMPLATE.map(({ name, startFraction, endFraction }) => {
    const startDate = addDays(sowingDate, growthDurationDays * startFraction);
    const endDate = addDays(sowingDate, growthDurationDays * endFraction);
    const stageDurationDays = growthDurationDays * (endFraction - startFraction);

    const tasks: CalendarTask[] = TASK_TEMPLATES[name].map((template) => ({
      title: template.title,
      description: template.description,
      type: template.type,
      dueDate: addDays(startDate, stageDurationDays * template.dueFraction),
      status: "pending",
    })) as CalendarTask[];

    return {
      name,
      startDate,
      endDate,
      status: "upcoming",
      tasks,
    };
  });
}
