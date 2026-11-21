// Server-side check that an AI-generated meal plan respects the patient's allergies and
// dietary restrictions. The model is never trusted: every food name is matched against
// keyword lists and the plan is rejected when something forbidden shows up.
//
// Enforced (hard): allergies, vegano, vegetariano, sem carne vermelha, halal, kosher.
// Not enforced (soft, only asked in the prompt): low carb / cetogênica.
//
// Pure TypeScript with no Deno-specific imports so it can be unit-tested with vitest.

export interface PlanItem { food?: string; portion?: string }
export interface PlanMeal { name?: string; items?: PlanItem[] }
export interface MealPlanLike { meals?: PlanMeal[] }

export interface Violation {
  food: string;
  meal: string;
  reason: string;
}

const norm = (s: string) =>
  (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const rx = (src: string) => new RegExp(src, 'i');

// Marks an item as explicitly plant-based / free-from, neutralising animal-product words
// ("leite de coco", "manteiga de amendoim", "requeijão vegetal", "bolo sem ovos").
const PLANT_BASED = rx(
  '\\b(couve[ -]manteiga|vegetal|vegetais|vegano|vegana|veganos|veganas|plant based|sem (ovo|ovos|leite|lactose|laticinios|gluten)|zero lactose|lactose free|livre de (lactose|ovo|ovos|gluten))\\b' +
  '|\\b(leite|iogurte|queijo|requeijao|manteiga|creme|bebida|pasta|farinha|molho|patê|pate|hamburguer|almondega|nuggets?|carne|linguica|salsicha|maionese|nata|sorvete|chocolate)\\s+(de|do|da)\\s+(soja|amendoa|amendoas|coco|aveia|arroz|castanha|castanhas|caju|gergelim|cacau|amendoim|grao de bico|grao-de-bico|lentilha|feijao|cogumelo|cogumelos|jaca|ervilha|quinoa|tofu|cevada|banana|abacate|girassol|chia|linhaca|inhame|batata|beterraba|cenoura|berinjela|grao|nozes|castanhas)',
);

// ---- animal products -------------------------------------------------------------------------

const RED_MEAT =
  '\\b(carne(s)?(?! de (frango|peru|peixe|soja|jaca|vegetal|cogumelo|grao))|bife|boi|bovin[oa]s?|patinho|alcatra|picanha|acem|coxao (mole|duro)|costela|fraldinha|contra ?file|maminha|cupim|vitela|cordeiro|carneiro|cabrito|figado|rim|moela|porco|suin[oa]s?|lombo|bacon|toucinho|linguica|salsicha|mortadela|presunto(?! de peru)|salame|hamburguer|almondega|bisteca|panceta|torresmo|mocoto|rabada|dobradinha)\\b';
const WHITE_MEAT = '\\b(frango|galinha|peru|chester|pato|coelho|codorna|peito de (frango|peru)|sobrecoxa|coxa|asa|nuggets?)\\b';
const FISH = '\\b(peixe|pescado|salmao|atum|sardinha|tilapia|bacalhau|merluza|anchova|truta|pescada|linguado|robalo|badejo|arenque|caldo de peixe|surimi|kani(kama)?|ceviche|sushi|sashimi|caviar|tucunare)\\b';
const SHELLFISH = '\\b(camarao|camaroes|lagosta|caranguejo|siri|lula|polvo|marisco|mariscos|mexilhao|mexilhoes|ostra|ostras|vieira|vieiras|berbigao|sururu|lambreta|frutos do mar|crustaceo|crustaceos|molusco|moluscos|pitu|cavaquinha)\\b';
const EGG = '\\b(ovo|ovos|omelete|gema|gemas|clara|claras|gemada|merengue|maionese|ovomaltine|ovo de codorna|quiche|souffle|suflê)\\b';
const DAIRY =
  '\\b(leite(?! de (coco|soja|amendoa|aveia|arroz|castanha))|queijo|queijos|iogurte|iogurtes|manteiga|requeijao|creme de leite|nata|ricota|coalhada|kefir|whey|caseina|cottage|mussarela|muçarela|parmesao|chantilly|sorvete|doce de leite|leite condensado|cream cheese|catupiry|ghee|petit suisse|danone|yakult|coalho|minas frescal|gorgonzola|provolone|brie|gouda|cheddar)\\b';
const HONEY_GELATIN = '\\b(mel|geleia real|propolis|gelatina(?! (vegetal|vegana|de agar))|colageno|caldo de (carne|galinha|frango)|banha|sebo)\\b';
const PORK = '\\b(porco|suin[oa]s?|bacon|toucinho|presunto|linguica|salsicha|mortadela|salame|panceta|torresmo|banha|lombo|bisteca|pernil|costelinha)\\b';
const ALCOHOL = '\\b(vinho|cerveja|cachaca|vodka|whisky|rum|licor|espumante|champanhe|sake|conhaque|alcool)\\b';

// Preparations that normally contain egg and/or dairy: accepted for vegans / egg or dairy allergies
// only when the name says they are plant-based or egg/milk-free ("bolo vegano", "panqueca sem ovos").
const AMBIGUOUS_PREP = '\\b(bolo|bolos|pudim|panqueca|panquecas|waffle|cookie|brownie|torta|pure|crepe|pao de lo|mousse|sorvete|cheesecake|quiche)\\b';

// ---- allergens -------------------------------------------------------------------------------

const GLUTEN =
  '\\b(trigo|pao|paes|pao frances|pao integral|pao de forma|torrada de pao|biscoito|biscoitos|bolacha|bolachas|macarrao|massa|massas|espaguete|lasanha|pizza|bolo|bolos|cevada|centeio|malte|cuscuz marroquino|farinha de trigo|seitan|aveia|granola|cereal matinal|wrap|tortilla|nhoque|panqueca|pastel|empada|coxinha|croissant|sanduiche|torta|waffle|cookie|brownie|biscoito de polvilho|kibe|esfiha|farofa de trigo|pao sirio|pao pita|bulgur|couscous|semolina|farelo de trigo|cerveja)\\b';
const GLUTEN_OK = rx('\\b(sem gluten|livre de gluten|gluten free|pao de queijo|tapioca|polvilho)\\b');

const TREE_NUTS =
  '\\b(noz|nozes|castanha|castanhas|castanha do para|castanha de caju|amendoa|amendoas|avela|avelas|pistache|pistaches|macadamia|pecan|noz pecan|pinhao|pinhoes|oleaginosas?|mix de nuts|nuts|pasta de castanha|farinha de amendoa|leite de amendoa|leite de castanha|noz moscada)\\b';
const NUT_COMPOSITE = '\\b(granola|trilha|barra de cereal|mix de castanhas)\\b';
// Composite foods that usually contain nuts are accepted only when explicitly labelled nut-free.
const NUT_FREE_LABEL = rx('\\bsem (noz|nozes|castanhas?|oleaginosas?|nuts)\\b');
const PEANUT = '\\b(amendoim|amendoins|pacoca|pasta de amendoim|manteiga de amendoim)\\b';
const SOY = '\\b(soja|tofu|edamame|shoyu|tempeh|miso|missô|molho de soja|proteina (de soja|texturizada)|pts|okara|leite de soja|iogurte de soja|queijo de soja|carne de soja)\\b';

// ---- rule table ------------------------------------------------------------------------------

interface Rule { reason: string; re: RegExp; allow?: RegExp }

const ANIMAL_FLESH = [RED_MEAT, WHITE_MEAT, FISH, SHELLFISH].join('|');

const NEGATION = /\b(sem|livre de|zero|isento de|isenta de)\s+[a-z]+(\s+(e|ou)\s+[a-z]+)?/g;

const vegetarian: Rule = { reason: 'vegetariano (carne/peixe)', re: rx(ANIMAL_FLESH), allow: PLANT_BASED };
const vegan: Rule[] = [
  vegetarian,
  { reason: 'vegano (ovos)', re: rx(EGG), allow: PLANT_BASED },
  { reason: 'vegano (laticínios)', re: rx(DAIRY), allow: PLANT_BASED },
  { reason: 'vegano (mel/gelatina)', re: rx(HONEY_GELATIN), allow: PLANT_BASED },
  { reason: 'vegano (preparação que costuma levar ovo/leite: especifique "vegano" ou "sem ovos")', re: rx(AMBIGUOUS_PREP), allow: PLANT_BASED },
];

const norm1 = (s: string) => norm(s);

function allergyRules(allergy: string): Rule[] {
  const a = norm1(allergy);
  const rules: Rule[] = [];
  if (/gluten|trigo|celiac/.test(a)) rules.push({ reason: `alergia: ${allergy}`, re: rx(GLUTEN), allow: GLUTEN_OK });
  if (/lactose|leite|laticin/.test(a)) rules.push({ reason: `alergia: ${allergy}`, re: rx(DAIRY), allow: PLANT_BASED });
  if (/lactose|leite|laticin/.test(a)) rules.push({ reason: `alergia: ${allergy} (preparação que costuma levar leite: especifique "sem leite")`, re: rx(AMBIGUOUS_PREP), allow: PLANT_BASED });
  if (/amendoim/.test(a)) rules.push({ reason: `alergia: ${allergy}`, re: rx(PEANUT) });
  if (/noz|nozes|castanha|oleaginosa|nuts/.test(a)) {
    rules.push({ reason: `alergia: ${allergy}`, re: rx(TREE_NUTS) });
    rules.push({ reason: `alergia: ${allergy} (granola/barra costumam conter oleaginosas)`, re: rx(NUT_COMPOSITE), allow: NUT_FREE_LABEL });
  }
  if (/soja/.test(a)) rules.push({ reason: `alergia: ${allergy}`, re: rx(SOY) });
  if (/\bovo|ovos/.test(a)) rules.push({ reason: `alergia: ${allergy}`, re: rx(EGG), allow: PLANT_BASED });
  if (/\bovo|ovos/.test(a)) rules.push({ reason: `alergia: ${allergy} (preparação que costuma levar ovo: especifique "sem ovos")`, re: rx(AMBIGUOUS_PREP), allow: PLANT_BASED });
  if (/fruto.*mar|marisco|crustace|molusco|peixe|camarao/.test(a)) {
    rules.push({ reason: `alergia: ${allergy}`, re: rx(SHELLFISH + '|' + FISH) });
  }
  if (rules.length === 0 && a.length >= 3) {
    // Unknown / custom allergy: flag any food that contains the allergen as a word.
    const esc = a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    rules.push({ reason: `alergia: ${allergy}`, re: rx(`\\b${esc}s?\\b`) });
  }
  return rules;
}

function restrictionRules(restriction: string): Rule[] {
  const r = norm1(restriction);
  if (/vegan/.test(r)) return vegan;
  if (/vegetarian/.test(r)) return [vegetarian];
  if (/carne vermelha/.test(r)) return [{ reason: 'sem carne vermelha', re: rx(RED_MEAT), allow: PLANT_BASED }];
  if (/halal/.test(r)) return [
    { reason: 'halal (porco)', re: rx(PORK), allow: PLANT_BASED },
    { reason: 'halal (álcool)', re: rx(ALCOHOL) },
  ];
  if (/kosher/.test(r)) return [
    { reason: 'kosher (porco)', re: rx(PORK), allow: PLANT_BASED },
    { reason: 'kosher (frutos do mar sem escamas)', re: rx(SHELLFISH), allow: PLANT_BASED },
  ];
  return []; // low carb / cetogênica / others: not enforced
}

/** Returns every forbidden food found in the plan (empty array = plan is safe). */
export function findViolations(
  plan: MealPlanLike,
  allergies: string[] = [],
  restrictions: string[] = [],
): Violation[] {
  const rules: Rule[] = [
    ...allergies.flatMap(allergyRules),
    ...restrictions.flatMap(restrictionRules),
  ];
  const kosher = restrictions.some(r => /kosher/.test(norm(r)));
  const out: Violation[] = [];
  const seen = new Set<string>();

  for (const meal of plan.meals ?? []) {
    const mealName = meal.name || 'Refeição';
    let hasMeat = false;
    let hasDairy = false;
    for (const item of meal.items ?? []) {
      const food = item.food || '';
      const n = norm(food);
      if (!n) continue;
      // "granola sem nozes", "bolo sem ovos": the "sem X" part negates X, so ignore it when matching.
      const np = n.replace(NEGATION, ' ');
      for (const rule of rules) {
        if (rule.re.test(np) && !(rule.allow && rule.allow.test(n))) {
          const key = `${mealName}|${food}`;
          if (!seen.has(key)) { seen.add(key); out.push({ food, meal: mealName, reason: rule.reason }); }
        }
      }
      if (kosher) {
        if (rx(RED_MEAT + '|' + WHITE_MEAT).test(n) && !PLANT_BASED.test(n)) hasMeat = true;
        if (rx(DAIRY).test(n) && !PLANT_BASED.test(n)) hasDairy = true;
      }
    }
    if (kosher && hasMeat && hasDairy) {
      out.push({ food: '(carne + laticínio)', meal: mealName, reason: 'kosher (carne com laticínio na mesma refeição)' });
    }
  }
  return out;
}

/** Plain-language explanation of the restrictions, appended to the prompt. */
export function buildRestrictionGuidance(allergies: string[] = [], restrictions: string[] = []): string {
  const lines: string[] = [];
  const rs = restrictions.map(norm);
  if (rs.some(r => /vegan/.test(r))) {
    lines.push('- VEGANO: nenhum alimento de origem animal. Proibido: carnes, aves, peixes, frutos do mar, ovos, leite e derivados (queijo, iogurte, manteiga, requeijão), mel e gelatina. Use leites/iogurtes vegetais e proteínas vegetais.');
  } else if (rs.some(r => /vegetarian/.test(r))) {
    lines.push('- VEGETARIANO: nenhuma carne, ave, peixe ou fruto do mar (ovos e laticínios são permitidos, salvo alergia).');
  }
  if (rs.some(r => /carne vermelha/.test(r))) lines.push('- SEM CARNE VERMELHA: nada de carne bovina, suína, cordeiro, embutidos ou vísceras.');
  if (rs.some(r => /halal/.test(r))) lines.push('- HALAL: nada de porco, derivados de porco ou álcool.');
  if (rs.some(r => /kosher/.test(r))) lines.push('- KOSHER: nada de porco nem frutos do mar sem escamas; nunca misture carne e laticínios na mesma refeição.');
  if (rs.some(r => /low carb|cetogen|keto/.test(r))) lines.push('- LOW CARB / CETOGÊNICA: priorize gorduras boas e proteínas; evite açúcar, pães, massas, arroz e farinhas.');
  const al = allergies.map(norm);
  if (al.some(a => /gluten/.test(a))) lines.push('- ALERGIA A GLÚTEN: nada de trigo, pão, massas, bolos, biscoitos, aveia, cevada ou centeio.');
  if (al.some(a => /lactose|leite/.test(a))) lines.push('- ALERGIA A LACTOSE: nada de leite, queijo, iogurte, manteiga, requeijão ou derivados do leite.');
  if (al.some(a => /noz|castanha/.test(a))) lines.push('- ALERGIA A NOZES: nada de nozes, castanhas (inclusive do-pará e de caju), amêndoas, avelãs, pistache ou macadâmia.');
  if (al.some(a => /amendoim/.test(a))) lines.push('- ALERGIA A AMENDOIM: nada de amendoim, paçoca ou pasta de amendoim.');
  if (al.some(a => /soja/.test(a))) lines.push('- ALERGIA A SOJA: nada de soja, tofu, edamame, shoyu, tempeh ou leite de soja.');
  if (al.some(a => /\bovo/.test(a))) lines.push('- ALERGIA A OVOS: nada de ovos, maionese, omelete ou preparações com ovo.');
  if (al.some(a => /fruto.*mar|marisco/.test(a))) lines.push('- ALERGIA A FRUTOS DO MAR/MARISCOS: nada de peixes, camarão, lula, polvo, mexilhão, ostra ou similares.');
  return lines.length
    ? `\nREGRAS DE SEGURANÇA (violá-las é um erro grave; revise cada alimento antes de responder):\n${lines.join('\n')}\n`
    : '';
}

export function formatViolations(v: Violation[]): string {
  return v.slice(0, 8).map(x => `"${x.food}" (${x.meal}: ${x.reason})`).join('; ');
}
