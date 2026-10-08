import { mockMealPlan } from "./src/services/mockMealPlan";

console.log("🍽️ Mock Meal Plan Test\n");
console.log("=" .repeat(50));

console.log("\n📊 CAFÉ DA MANHÃ:");
mockMealPlan.breakfast.forEach((item, i) => {
  console.log(`${i + 1}. ${item.name}`);
  console.log(`   Porção: ${item.portion}`);
  console.log(`   Calorias: ${item.macros.calories} kcal | Proteína: ${item.macros.protein}g | Carbs: ${item.macros.carbs}g | Gordura: ${item.macros.fat}g`);
});

console.log("\n📊 ALMOÇO:");
mockMealPlan.lunch.forEach((item, i) => {
  console.log(`${i + 1}. ${item.name}`);
  console.log(`   Porção: ${item.portion}`);
  console.log(`   Calorias: ${item.macros.calories} kcal | Proteína: ${item.macros.protein}g | Carbs: ${item.macros.carbs}g | Gordura: ${item.macros.fat}g`);
});

console.log("\n📊 JANTAR:");
mockMealPlan.dinner.forEach((item, i) => {
  console.log(`${i + 1}. ${item.name}`);
  console.log(`   Porção: ${item.portion}`);
  console.log(`   Calorias: ${item.macros.calories} kcal | Proteína: ${item.macros.protein}g | Carbs: ${item.macros.carbs}g | Gordura: ${item.macros.fat}g`);
});

if (mockMealPlan.snack_morning) {
  console.log("\n📊 LANCHE DA MANHÃ:");
  mockMealPlan.snack_morning.forEach((item, i) => {
    console.log(`${i + 1}. ${item.name}`);
    console.log(`   Porção: ${item.portion}`);
    console.log(`   Calorias: ${item.macros.calories} kcal | Proteína: ${item.macros.protein}g | Carbs: ${item.macros.carbs}g | Gordura: ${item.macros.fat}g`);
  });
}

if (mockMealPlan.snack_afternoon) {
  console.log("\n📊 LANCHE DA TARDE:");
  mockMealPlan.snack_afternoon.forEach((item, i) => {
    console.log(`${i + 1}. ${item.name}`);
    console.log(`   Porção: ${item.portion}`);
    console.log(`   Calorias: ${item.macros.calories} kcal | Proteína: ${item.macros.protein}g | Carbs: ${item.macros.carbs}g | Gordura: ${item.macros.fat}g`);
  });
}

console.log("\n📝 NOTAS:");
console.log(mockMealPlan.notes);

// Calculate totals
const allItems = [
  ...mockMealPlan.breakfast,
  ...mockMealPlan.lunch,
  ...mockMealPlan.dinner,
  ...(mockMealPlan.snack_morning || []),
  ...(mockMealPlan.snack_afternoon || []),
];

const totals = allItems.reduce(
  (acc, item) => ({
    calories: acc.calories + item.macros.calories,
    protein: acc.protein + item.macros.protein,
    carbs: acc.carbs + item.macros.carbs,
    fat: acc.fat + item.macros.fat,
    fiber: acc.fiber + item.macros.fiber,
  }),
  { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
);

console.log("\n" + "=".repeat(50));
console.log("📈 TOTAIS DO DIA:");
console.log(`   Calorias: ${totals.calories} kcal`);
console.log(`   Proteínas: ${totals.protein}g`);
console.log(`   Carboidratos: ${totals.carbs}g`);
console.log(`   Gorduras: ${totals.fat}g`);
console.log(`   Fibras: ${totals.fiber}g`);
console.log("=".repeat(50));
