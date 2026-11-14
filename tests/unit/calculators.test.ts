import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  bmi,
  bmiCategory,
  bmrMifflin,
  bodyFatNavy,
  calories,
  idealWeight,
  protein,
  proteinReferenceKg,
} from '../../src/lib/calculators.ts';

const close = (actual: number, expected: number, tolerance = 0.05) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected} ± ${tolerance}, got ${actual}`);

test('Mifflin–St Jeor BMR matches the published equation', () => {
  // 10 × 80 + 6.25 × 180 − 5 × 30 + 5
  assert.equal(bmrMifflin({ sex: 'male', weightKg: 80, heightCm: 180, age: 30 }), 1780);
  // 10 × 60 + 6.25 × 165 − 5 × 25 − 161
  assert.equal(bmrMifflin({ sex: 'female', weightKg: 60, heightCm: 165, age: 25 }), 1345.25);
});

test('calories: activity factor and goal adjustment', () => {
  const maintain = calories({ sex: 'male', age: 30, heightCm: 180, weightKg: 80, activity: 'moderate', goal: 'maintain' });
  assert.equal(maintain.bmr, 1780);
  assert.equal(maintain.tdee, 2759); // 1780 × 1.55 = 2759
  assert.equal(maintain.target, 2760); // rounded to 10 kcal
  const lose = calories({ sex: 'male', age: 30, heightCm: 180, weightKg: 80, activity: 'moderate', goal: 'lose' });
  assert.equal(lose.target, 2210); // 2759 × 0.8 = 2207.2
  const gain = calories({ sex: 'male', age: 30, heightCm: 180, weightKg: 80, activity: 'moderate', goal: 'gain' });
  assert.equal(gain.target, 3030); // 2759 × 1.1 = 3034.9
  const sedentary = calories({ sex: 'female', age: 25, heightCm: 165, weightKg: 60, activity: 'sedentary', goal: 'maintain' });
  assert.equal(sedentary.tdee, 1614); // 1345.25 × 1.2 = 1614.3
});

test('calories never go below the safe floor', () => {
  const r = calories({ sex: 'female', age: 70, heightCm: 150, weightKg: 45, activity: 'sedentary', goal: 'lose' });
  assert.equal(r.target, 1200);
  assert.equal(r.floored, true);
});

test('calorie macros add up to the target', () => {
  const r = calories({ sex: 'male', age: 30, heightCm: 180, weightKg: 80, activity: 'moderate', goal: 'lose' });
  assert.equal(r.macros.proteinG, 160); // 2.0 g/kg on a cut
  const kcal = r.macros.proteinG * 4 + r.macros.carbsG * 4 + r.macros.fatG * 9;
  close(kcal, r.target, 10);
});

test('protein range by goal', () => {
  const pick = ({ minG, maxG, targetG, perMealG }: ReturnType<typeof protein>) => ({ minG, maxG, targetG, perMealG });
  assert.deepEqual(pick(protein({ weightKg: 80, goal: 'lose', meals: 4 })), { minG: 144, maxG: 176, targetG: 160, perMealG: 40 });
  assert.deepEqual(pick(protein({ weightKg: 70, goal: 'health', meals: 3 })), { minG: 56, maxG: 70, targetG: 65, perMealG: 22 });
  assert.deepEqual(pick(protein({ weightKg: 90, goal: 'gain', meals: 5 })), { minG: 144, maxG: 198, targetG: 170, perMealG: 34 });
});

test('BMI and WHO categories', () => {
  close(bmi(70, 175), 22.857, 0.001);
  assert.equal(bmiCategory(18.4), 'under');
  assert.equal(bmiCategory(18.5), 'healthy');
  assert.equal(bmiCategory(24.99), 'healthy');
  assert.equal(bmiCategory(25), 'over');
  assert.equal(bmiCategory(30), 'obese');
});

test('ideal weight: healthy BMI range and Devine/Robinson formulas', () => {
  const r = idealWeight({ sex: 'male', heightCm: 180, weightKg: 80 });
  assert.equal(r.bmi, 24.7);
  assert.equal(r.category, 'healthy');
  assert.equal(r.healthyMinKg, 59.9); // 18.5 × 1.8²
  assert.equal(r.healthyMaxKg, 80.7); // 24.9 × 1.8²
  // 180 cm = 70.87 in → 10.87 in over 5 ft
  assert.equal(r.devineKg, 75); // 50 + 2.3 × 10.87 = 75.0
  assert.equal(r.robinsonKg, 72.6); // 52 + 1.9 × 10.87 = 72.65
  const f = idealWeight({ sex: 'female', heightCm: 165, weightKg: 60 });
  assert.equal(f.devineKg, 56.9); // 165 cm = 64.96 in → 45.5 + 2.3 × 4.96 = 56.9
});

test('U.S. Navy body fat, known values', () => {
  // Male, 180 cm, neck 38, waist 85 → ≈ 16.1 %
  const m = bodyFatNavy({ sex: 'male', heightCm: 180, neckCm: 38, waistCm: 85, weightKg: 80 });
  close(m.percent!, 16.1, 0.1);
  assert.equal(m.category, 'fit');
  close(m.fatMassKg!, 12.9, 0.1);
  close(m.leanMassKg!, 67.1, 0.1);
  // Female, 165 cm, neck 32, waist 70, hips 95: girth 133 → density 1.04242 → ≈ 24.9 %
  const f = bodyFatNavy({ sex: 'female', heightCm: 165, neckCm: 32, waistCm: 70, hipCm: 95 });
  close(f.percent!, 24.9, 0.05);
  assert.equal(f.category, 'fit');
});

test('body fat refuses impossible measurements', () => {
  assert.equal(bodyFatNavy({ sex: 'male', heightCm: 180, neckCm: 40, waistCm: 38 }).percent, null);
  assert.equal(bodyFatNavy({ sex: 'female', heightCm: 165, neckCm: 32, waistCm: 70 }).percent, null);
});

test('protein above BMI 25 is based on the weight at BMI 25', () => {
  // 180 cm: BMI 25 is 81 kg.
  assert.equal(proteinReferenceKg(150, 180), 81);
  assert.equal(proteinReferenceKg(70, 180), 70);
  const p150 = protein({ weightKg: 150, heightCm: 180, goal: 'lose', meals: 4 });
  assert.deepEqual(
    { min: p150.minG, max: p150.maxG, target: p150.targetG, ref: p150.referenceKg, adjusted: p150.adjusted },
    { min: 146, max: 178, target: 160, ref: 81, adjusted: true },
  );
  const p250 = protein({ weightKg: 250, heightCm: 180, goal: 'lose', meals: 4 });
  assert.equal(p250.targetG, 160, '250 kg gets the same protein as anyone 81 kg and up at 180 cm');
  assert.equal(protein({ weightKg: 70, heightCm: 180, goal: 'lose', meals: 4 }).adjusted, false);
});

test('calorie macros: protein on the reference weight, carbohydrate never squeezed out', () => {
  for (const input of [
    { sex: 'male', age: 30, heightCm: 180, weightKg: 150, activity: 'moderate', goal: 'lose' },
    { sex: 'male', age: 30, heightCm: 180, weightKg: 250, activity: 'sedentary', goal: 'lose' },
    { sex: 'female', age: 70, heightCm: 150, weightKg: 45, activity: 'sedentary', goal: 'lose' },
    { sex: 'female', age: 40, heightCm: 155, weightKg: 140, activity: 'sedentary', goal: 'lose' },
  ] as const) {
    const r = calories({ ...input });
    assert.ok(r.macros.proteinG * 4 <= r.target * 0.35 + 4, `${input.weightKg} kg: protein at most 35% of energy`);
    assert.ok(r.macros.carbsG * 4 >= r.target * 0.39, `${input.weightKg} kg: carbs keep at least ~40% (${r.macros.carbsG} g of ${r.target} kcal)`);
  }
  // 150 kg at 180 cm, cutting: 2.0 g × 81 kg = 162 g.
  assert.equal(calories({ sex: 'male', age: 30, heightCm: 180, weightKg: 150, activity: 'moderate', goal: 'lose' }).macros.proteinG, 162);
  assert.equal(calories({ sex: 'male', age: 30, heightCm: 180, weightKg: 250, activity: 'sedentary', goal: 'lose' }).macros.proteinG, 162);
});

test('BMI category follows the rounded value shown', () => {
  // 80.85 kg at 180 cm is BMI 24.954…, shown as 25.0.
  const r = idealWeight({ sex: 'male', heightCm: 180, weightKg: 80.85 });
  assert.equal(r.bmi, 25);
  assert.equal(r.category, 'over');
});
