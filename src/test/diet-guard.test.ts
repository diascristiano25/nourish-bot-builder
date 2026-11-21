import { describe, it, expect } from 'vitest';
import { findViolations, buildRestrictionGuidance } from '../../supabase/functions/generate-meal-plan/diet-guard';

const plan = (...foods: string[]) => ({ meals: [{ name: 'Café da Manhã', items: foods.map(food => ({ food })) }] });
const bad = (foods: string[], allergies: string[] = [], restrictions: string[] = []) =>
  findViolations(plan(...foods), allergies, restrictions).map(v => v.food);

describe('diet-guard: vegan / vegetarian', () => {
  const vegan = ['Vegano'];
  it('blocks animal products for vegans', () => {
    expect(bad(['Frango grelhado', 'Salmão grelhado', 'Iogurte natural', 'Ovo mexido', 'Queijo minas', 'Mel', 'Gelatina de morango', 'Leite desnatado', 'Manteiga', 'Requeijão cremoso', 'Atum'], [], vegan).length).toBe(11);
  });
  it('allows plant-based alternatives for vegans', () => {
    expect(bad(['Leite de soja', 'Leite de coco', 'Leite de amêndoa', 'Iogurte de coco', 'Requeijão vegetal de soja', 'Manteiga de amendoim', 'Bolo de cenoura sem ovos', 'Hambúrguer de grão-de-bico', 'Tofu grelhado', 'Pasta de grão-de-bico', 'Feijão carioca', 'Aveia em flocos', 'Salada de folhas verdes com tomate (1 prato raso)'], [], vegan)).toEqual([]);
  });
  it('vegetarian allows egg and dairy but not meat/fish', () => {
    expect(bad(['Ovo cozido', 'Queijo minas', 'Iogurte natural'], [], ['Vegetariano'])).toEqual([]);
    expect(bad(['Frango grelhado', 'Salmão', 'Camarão', 'Carne moída'], [], ['Vegetariano']).length).toBe(4);
  });
});

describe('diet-guard: allergies', () => {
  it('gluten', () => {
    expect(bad(['Pão integral', 'Aveia em flocos', 'Macarrão', 'Bolo de cenoura', 'Biscoito cream cracker'], ['Glúten']).length).toBe(5);
    expect(bad(['Pão sem glúten', 'Tapioca', 'Pão de queijo', 'Arroz', 'Batata-doce'], ['Glúten'])).toEqual([]);
  });
  it('lactose', () => {
    expect(bad(['Leite', 'Queijo', 'Iogurte natural', 'Manteiga', 'Requeijão'], ['Lactose']).length).toBe(5);
    expect(bad(['Leite de aveia', 'Iogurte sem lactose', 'Leite de coco'], ['Lactose'])).toEqual([]);
  });
  it('peanut, tree nuts, soy, egg', () => {
    expect(bad(['Pasta de amendoim', 'Paçoca'], ['Amendoim']).length).toBe(2);
    expect(bad(['Castanha-do-pará', 'Castanha de caju', 'Amêndoas', 'Nozes', 'Leite de amêndoa', 'Pistache'], ['Nozes']).length).toBe(6);
    expect(bad(['Tofu', 'Leite de soja', 'Molho shoyu', 'Edamame'], ['Soja']).length).toBe(4);
    expect(bad(['Ovo mexido', 'Omelete', 'Maionese'], ['Ovos']).length).toBe(3);
    expect(bad(['Coco ralado', 'Abacate', 'Sementes de chia', 'Peça de fruta (1 peça)'], ['Nozes', 'Amendoim', 'Soja', 'Ovos'])).toEqual([]);
  });
  it('seafood (fish and shellfish)', () => {
    expect(bad(['Salmão', 'Camarão', 'Lula', 'Mexilhão', 'Atum', 'Tilápia'], ['Frutos do mar', 'Mariscos']).length).toBe(6);
    expect(bad(['Frango', 'Arroz'], ['Frutos do mar'])).toEqual([]);
  });
  it('unknown custom allergy is matched by name', () => {
    expect(bad(['Morango', 'Banana'], ['Morango'])).toEqual(['Morango']);
  });
});

describe('diet-guard: false positives seen in real runs', () => {
  it('couve-manteiga is a vegetable, not dairy', () => {
    expect(bad(['Couve-manteiga refogada', 'Couve manteiga'], ['Lactose'], ['Vegano'])).toEqual([]);
  });
  it('torradas as an adjective is not bread', () => {
    expect(bad(['Sementes de girassol torradas', 'Sementes de abóbora torradas'], ['Glúten'])).toEqual([]);
    expect(bad(['Torrada de pão integral'], ['Glúten']).length).toBe(1);
  });
  it('cevada and leite de amêndoa are caught', () => {
    expect(bad(['Cevada em grãos'], ['Glúten']).length).toBe(1);
    expect(bad(['Leite de amêndoas sem açúcar'], ['Nozes']).length).toBe(1);
  });
});

describe('diet-guard: "sem X" negation', () => {
  it('free-from labels are accepted, real allergens still caught', () => {
    expect(bad(['Granola sem nozes', 'Granola sem castanhas'], ['Nozes', 'Soja', 'Amendoim'])).toEqual([]);
    expect(bad(['Granola sem soja'], ['Soja'])).toEqual([]);
    expect(bad(['Granola sem mel'], ['Glúten']).length).toBe(1);
    expect(bad(['Leite de amêndoa (sem nozes)'], ['Nozes']).length).toBe(1);
    expect(bad(['Pão sem glúten'], ['Glúten'])).toEqual([]);
    expect(bad(['Iogurte sem lactose'], ['Lactose'])).toEqual([]);
  });
});

describe('diet-guard: composite foods and nuts', () => {
  it('granola needs an explicit nut-free label for nut allergy', () => {
    expect(bad(['Granola sem glúten'], ['Nozes']).length).toBe(1);
    expect(bad(['Granola sem nozes'], ['Nozes'])).toEqual([]);
    expect(bad(['Leite de amêndoa (sem nozes)'], ['Nozes']).length).toBe(1);
    expect(bad(['Granola sem glúten'], [])).toEqual([]);
  });
});

describe('diet-guard: ambiguous preparations', () => {
  it('vegan/egg/dairy-allergic plans must label bolo, purê, panqueca...', () => {
    expect(bad(['Purê de batata', 'Bolo de batata doce', 'Panqueca de aveia'], [], ['Vegano']).length).toBe(3);
    expect(bad(['Purê de batata vegano', 'Bolo vegano de cenoura', 'Panqueca sem ovos', 'Bolo de cenoura sem ovos'], [], ['Vegano'])).toEqual([]);
    expect(bad(['Bolo simples'], ['Ovos']).length).toBe(1);
    expect(bad(['Purê de batata'], ['Lactose']).length).toBe(1);
    expect(bad(['Purê de batata'], [], ['Vegetariano'])).toEqual([]);
  });
});

describe('diet-guard: other restrictions', () => {
  it('sem carne vermelha', () => {
    expect(bad(['Bife', 'Carne moída', 'Presunto', 'Frango grelhado', 'Peixe'], [], ['Sem carne vermelha']).length).toBe(3);
  });
  it('halal / kosher', () => {
    expect(bad(['Bacon', 'Vinho'], [], ['Halal']).length).toBe(2);
    expect(bad(['Camarão', 'Presunto'], [], ['Kosher']).length).toBe(2);
    const mixed = { meals: [{ name: 'Almoço', items: [{ food: 'Frango' }, { food: 'Queijo' }] }] };
    expect(findViolations(mixed, [], ['Kosher']).length).toBe(1);
  });
  it('low carb / keto are not enforced', () => {
    expect(bad(['Arroz', 'Pão'], [], ['Low carb', 'Cetogênica'])).toEqual([]);
  });
});

describe('diet-guard: guidance', () => {
  it('mentions each restriction', () => {
    const g = buildRestrictionGuidance(['Soja'], ['Vegano']);
    expect(g).toMatch(/VEGANO/);
    expect(g).toMatch(/SOJA/);
    expect(buildRestrictionGuidance([], [])).toBe('');
  });
});
