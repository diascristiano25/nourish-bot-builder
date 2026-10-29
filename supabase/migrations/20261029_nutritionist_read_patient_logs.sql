-- Permite que o nutricionista dono do paciente leia os logs de peso, água e alimentação
-- Causa raiz: o painel do nutri (PatientDetail) mostrava tudo zerado porque as políticas
-- RLS existentes só permitiam SELECT pelo próprio paciente (user_id = auth.uid()).
-- Agora adicionamos políticas permitindo SELECT quando o nutritionist_id do paciente
-- corresponde ao profile do usuário autenticado.

-- weight_logs: nutri pode ler logs dos seus pacientes
CREATE POLICY "Nutritionists can view patient weight logs"
ON weight_logs FOR SELECT
USING (
  patient_id IN (
    SELECT p.id FROM patients p
    WHERE p.nutritionist_id = (
      SELECT pr.id FROM profiles pr WHERE pr.user_id = auth.uid()
    )
  )
);

-- water_logs: nutri pode ler logs dos seus pacientes
CREATE POLICY "Nutritionists can view patient water logs"
ON water_logs FOR SELECT
USING (
  patient_id IN (
    SELECT p.id FROM patients p
    WHERE p.nutritionist_id = (
      SELECT pr.id FROM profiles pr WHERE pr.user_id = auth.uid()
    )
  )
);

-- food_intake_logs: nutri pode ler logs dos seus pacientes
CREATE POLICY "Nutritionists can view patient food intake logs"
ON food_intake_logs FOR SELECT
USING (
  patient_id IN (
    SELECT p.id FROM patients p
    WHERE p.nutritionist_id = (
      SELECT pr.id FROM profiles pr WHERE pr.user_id = auth.uid()
    )
  )
);

-- anthropometrics: nutri pode ler dados antropométricos dos seus pacientes
CREATE POLICY "Nutritionists can view patient anthropometrics"
ON anthropometrics FOR SELECT
USING (
  patient_id IN (
    SELECT p.id FROM patients p
    WHERE p.nutritionist_id = (
      SELECT pr.id FROM profiles pr WHERE pr.user_id = auth.uid()
    )
  )
);

-- exercise_logs: nutri pode ler logs de exercício dos seus pacientes
CREATE POLICY "Nutritionists can view patient exercise logs"
ON exercise_logs FOR SELECT
USING (
  patient_id IN (
    SELECT p.id FROM patients p
    WHERE p.nutritionist_id = (
      SELECT pr.id FROM profiles pr WHERE pr.user_id = auth.uid()
    )
  )
);