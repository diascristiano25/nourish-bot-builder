import { describe, it, expect } from 'vitest';
import { parseCsv, parseRows, parseDate, parseNumber, detectColumns } from '../patient-import';

const none = { emails: new Set<string>(), phones: new Set<string>() };

describe('patient-import', () => {
  it('parses dates and numbers pt-BR', () => {
    expect(parseDate('15/03/1990')).toBe('1990-03-15');
    expect(parseDate('31/02/1990')).toBeNull();
    expect(parseNumber('72,5')).toBe(72.5);
    expect(parseNumber('1.234,5')).toBe(1234.5);
  });

  it('recognizes headers from the template and common variants', () => {
    const { map } = detectColumns(['Nome *', 'Celular', 'Peso (kg)', 'Altura (cm)', 'Anamnese / Observações', 'WhatsApp?']);
    expect(map.full_name).toBe(0);
    expect(map.phone).toBe(1);
    expect(map.weight).toBe(2);
    expect(map.height).toBe(3);
    expect(map.notes).toBe(4);
  });

  it('maps rows, measurements and duplicates', () => {
    const csv = 'Nome;Email;Celular;Sexo;Objetivo;Peso;Altura;Alergias;Anamnese\n' +
      'Maria;maria@x.com;(11) 99999-9999;Feminino;Emagrecimento;72,5;1,65;"Lactose; Glúten";"Dorme mal; come fora"\n' +
      'Maria 2;MARIA@x.com;;;;;;;\n' +
      ';a@b.com;;;;;;;\n' +
      'João;;11988887777;M;Hipertrofia;80;180;;';
    const { rows } = parseRows(parseCsv(csv), { emails: new Set(), phones: new Set(['11988887777']) });
    expect(rows[0].patient).toMatchObject({ full_name: 'Maria', gender: 'female', goal: 'weight_loss', height: 165, initial_weight: 72.5 });
    expect(rows[0].patient.allergies).toEqual(["Lactose", "Glúten"]);
    expect(rows[0].patient.notes).toBe('Dorme mal; come fora');
    expect(rows[0].measurement).toMatchObject({ weight_kg: 72.5, height_cm: 165 });
    expect(rows[1].duplicate).toMatch(/repetido/);
    expect(rows[2].errors).toContain('Nome vazio');
    expect(rows[3].duplicate).toMatch(/Celular já/);
  });

  it('requires a Nome column', () => {
    expect(() => parseRows([['Foo'], ['x']], none)).toThrow(/Nome/);
  });
});
