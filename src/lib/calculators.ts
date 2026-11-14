/**
 * The fitness calculators, as plain functions so they can be tested against
 * known values. All inputs are metric (kg, cm, years). Every result is an
 * estimate for healthy adults, not medical advice; the UI says so.
 */

export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
export type CalorieGoal = 'lose' | 'maintain' | 'gain';

/** Standard multipliers applied to BMR to estimate daily expenditure (TDEE). */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

/** Calorie target relative to TDEE: a 20% deficit, maintenance, or a 10% surplus. */
export const GOAL_FACTORS: Record<CalorieGoal, number> = {
  lose: 0.8,
  maintain: 1,
  gain: 1.1,
};

/** Never suggest less than this per day without medical supervision. */
export const CALORIE_FLOOR: Record<Sex, number> = { male: 1500, female: 1200 };

export const LIMITS = {
  age: [15, 90],
  heightCm: [120, 230],
  weightKg: [35, 250],
  neckCm: [20, 70],
  waistCm: [40, 200],
  hipCm: [50, 200],
} as const;

const round = (n: number, step = 1) => Math.round(n / step) * step;

/** Mifflin–St Jeor resting energy expenditure, kcal/day. */
export const bmrMifflin = ({ sex, weightKg, heightCm, age }: { sex: Sex; weightKg: number; heightCm: number; age: number }): number =>
  10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);

export interface CalorieInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: CalorieGoal;
}

export interface CalorieResult {
  bmr: number;
  tdee: number;
  target: number;
  /** true when the target was raised to the safe floor. */
  floored: boolean;
  macros: { proteinG: number; fatG: number; carbsG: number };
}

/**
 * The weight protein is based on. Protein needs follow lean mass, not fat,
 * so above a BMI of 25 the weight at a BMI of 25 for the person's height is
 * used instead (otherwise someone at 150 kg would be told to eat 300 g).
 */
export const proteinReferenceKg = (weightKg: number, heightCm?: number): number =>
  heightCm ? Math.min(weightKg, 25 * (heightCm / 100) ** 2) : weightKg;

/** Protein never takes more than this share of the calorie target, so carbohydrate always has room. */
export const PROTEIN_MAX_SHARE = 0.35;

export const calories = (input: CalorieInput): CalorieResult => {
  const bmr = bmrMifflin(input);
  const tdee = bmr * ACTIVITY_FACTORS[input.activity];
  const raw = tdee * GOAL_FACTORS[input.goal];
  const floor = CALORIE_FLOOR[input.sex];
  const target = Math.max(raw, floor);
  // Macros: protein from the protein guide (on the reference weight, capped
  // at 35% of energy), a quarter of energy from fat, carbohydrate the rest:
  // at least 40% of the target.
  const perKg = input.goal === 'lose' ? 2.0 : input.goal === 'gain' ? 1.8 : 1.6;
  const proteinG = round(Math.min(proteinReferenceKg(input.weightKg, input.heightCm) * perKg, (target * PROTEIN_MAX_SHARE) / 4));
  const fatG = round((target * 0.25) / 9);
  const carbsG = Math.max(0, round((target - proteinG * 4 - fatG * 9) / 4));
  return {
    bmr: round(bmr),
    tdee: round(tdee),
    target: round(target, 10),
    floored: raw < floor,
    macros: { proteinG, fatG, carbsG },
  };
};

export type ProteinGoal = 'health' | 'fitness' | 'lose' | 'gain';

/** Grams of protein per kg of bodyweight per day, by goal. */
export const PROTEIN_RANGES: Record<ProteinGoal, [number, number]> = {
  health: [0.8, 1.0],
  fitness: [1.2, 1.6],
  lose: [1.8, 2.2],
  gain: [1.6, 2.2],
};

export interface ProteinResult {
  minG: number;
  maxG: number;
  /** The middle of the range, rounded to 5 g. */
  targetG: number;
  perMealG: number;
  /** The weight the range is based on (see proteinReferenceKg). */
  referenceKg: number;
  /** true when that is less than the body weight (BMI above 25). */
  adjusted: boolean;
}

export const protein = ({ weightKg, heightCm, goal, meals }: { weightKg: number; heightCm?: number; goal: ProteinGoal; meals: number }): ProteinResult => {
  const [lo, hi] = PROTEIN_RANGES[goal];
  const referenceKg = proteinReferenceKg(weightKg, heightCm);
  const minG = round(referenceKg * lo);
  const maxG = round(referenceKg * hi);
  const targetG = round((minG + maxG) / 2, 5);
  return { minG, maxG, targetG, perMealG: round(targetG / Math.max(1, meals)), referenceKg: Math.round(referenceKg * 10) / 10, adjusted: referenceKg < weightKg };
};

export type BmiCategory = 'under' | 'healthy' | 'over' | 'obese';

/** WHO adult BMI bands. */
export const BMI_BANDS: { category: BmiCategory; from: number; to: number }[] = [
  { category: 'under', from: 0, to: 18.5 },
  { category: 'healthy', from: 18.5, to: 25 },
  { category: 'over', from: 25, to: 30 },
  { category: 'obese', from: 30, to: Infinity },
];

export const bmi = (weightKg: number, heightCm: number): number => weightKg / (heightCm / 100) ** 2;

export const bmiCategory = (value: number): BmiCategory =>
  (BMI_BANDS.find((b) => value >= b.from && value < b.to) ?? BMI_BANDS[BMI_BANDS.length - 1]).category;

export interface IdealWeightResult {
  bmi: number;
  category: BmiCategory;
  /** Weight range that gives a BMI of 18.5–24.9 at this height. */
  healthyMinKg: number;
  healthyMaxKg: number;
  /** Devine (1974) and Robinson (1983) ideal body weight formulas. */
  devineKg: number;
  robinsonKg: number;
}

const inchesOver5ft = (heightCm: number) => Math.max(0, heightCm / 2.54 - 60);

export const idealWeight = ({ sex, heightCm, weightKg }: { sex: Sex; heightCm: number; weightKg: number }): IdealWeightResult => {
  // The category follows the value as shown (one decimal), so 24.96 shows
  // "25.0 · Overweight", never "25.0 · Healthy".
  const shown = Math.round(bmi(weightKg, heightCm) * 10) / 10;
  const m2 = (heightCm / 100) ** 2;
  const inches = inchesOver5ft(heightCm);
  return {
    bmi: shown,
    category: bmiCategory(shown),
    healthyMinKg: Math.round(18.5 * m2 * 10) / 10,
    healthyMaxKg: Math.round(24.9 * m2 * 10) / 10,
    devineKg: Math.round(((sex === 'male' ? 50 : 45.5) + 2.3 * inches) * 10) / 10,
    robinsonKg: Math.round(((sex === 'male' ? 52 : 49) + (sex === 'male' ? 1.9 : 1.7) * inches) * 10) / 10,
  };
};

export type BodyFatCategory = 'essential' | 'athletic' | 'fit' | 'average' | 'high';

/** American Council on Exercise body-fat bands (lower bound of each, %). */
export const BODY_FAT_BANDS: Record<Sex, { category: BodyFatCategory; from: number }[]> = {
  male: [
    { category: 'essential', from: 0 },
    { category: 'athletic', from: 6 },
    { category: 'fit', from: 14 },
    { category: 'average', from: 18 },
    { category: 'high', from: 25 },
  ],
  female: [
    { category: 'essential', from: 0 },
    { category: 'athletic', from: 14 },
    { category: 'fit', from: 21 },
    { category: 'average', from: 25 },
    { category: 'high', from: 32 },
  ],
};

export interface BodyFatInput {
  sex: Sex;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  /** Required for women. */
  hipCm?: number;
  /** Optional: adds fat and lean mass to the result. */
  weightKg?: number;
}

export interface BodyFatResult {
  /** Percent, one decimal. null when the measurements cannot be right (e.g. waist ≤ neck). */
  percent: number | null;
  category: BodyFatCategory | null;
  fatMassKg: number | null;
  leanMassKg: number | null;
}

/** U.S. Navy circumference method (Hodgdon & Beckett), metric form. */
export const bodyFatNavy = (input: BodyFatInput): BodyFatResult => {
  const { sex, heightCm, neckCm, waistCm, hipCm = 0, weightKg } = input;
  const girth = sex === 'male' ? waistCm - neckCm : waistCm + hipCm - neckCm;
  const empty: BodyFatResult = { percent: null, category: null, fatMassKg: null, leanMassKg: null };
  if (girth <= 0 || heightCm <= 0 || (sex === 'female' && !hipCm)) return empty;
  const density =
    sex === 'male'
      ? 1.0324 - 0.19077 * Math.log10(girth) + 0.15456 * Math.log10(heightCm)
      : 1.29579 - 0.35004 * Math.log10(girth) + 0.221 * Math.log10(heightCm);
  const pct = 495 / density - 450;
  if (!Number.isFinite(pct) || pct < 2 || pct > 70) return empty;
  const percent = Math.round(pct * 10) / 10;
  const bands = BODY_FAT_BANDS[sex];
  const category = [...bands].reverse().find((b) => percent >= b.from)?.category ?? 'essential';
  const fatMassKg = weightKg ? Math.round(((weightKg * percent) / 100) * 10) / 10 : null;
  return { percent, category, fatMassKg, leanMassKg: weightKg && fatMassKg !== null ? Math.round((weightKg - fatMassKg) * 10) / 10 : null };
};
