/**
 * PatientProfile - Patient profile edit page
 * Allows patients to view and edit their profile information
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion-variants';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Calendar, Target } from 'lucide-react';

export default function PatientProfile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { patient, isLoading, error } = usePatientData(user?.id || '');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    goal: '',
    height: '',
    current_weight: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (patient.data) {
      setFormData({
        full_name: patient.data.full_name || '',
        email: patient.data.email || '',
        phone: patient.data.phone || '',
        date_of_birth: patient.data.date_of_birth || '',
        goal: patient.data.goal || '',
        height: patient.data.height?.toString() || '',
        current_weight: patient.data.current_weight?.toString() || '',
      });
    }
  }, [patient.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          goal: formData.goal,
          height: formData.height ? parseFloat(formData.height) : null,
          current_weight: formData.current_weight ? parseFloat(formData.current_weight) : null,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar seu perfil. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (authLoading || isLoading) {
    return (
      <PatientLayout>
        <LoadingState />
      </PatientLayout>
    );
  }

  if (error) {
    return (
      <PatientLayout>
        <ErrorBoundary error={error} />
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="max-w-2xl mx-auto p-6"
      >
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Meu Perfil</h1>

        <motion.form
          variants={staggerContainer}
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-blue-200 shadow-sm p-6 space-y-6"
        >
          <motion.div variants={staggerItem}>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome Completo
              </div>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Seu nome completo"
            />
          </motion.div>

          <motion.div variants={staggerItem}>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </div>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-slate-50 text-slate-500"
              placeholder="seu@email.com"
            />
            <p className="text-xs text-slate-500 mt-1">Email não pode ser alterado</p>
          </motion.div>

          <motion.div variants={staggerItem}>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefone
              </div>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="(00) 00000-0000"
            />
          </motion.div>

          <motion.div variants={staggerItem}>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Nascimento
              </div>
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </motion.div>

          <motion.div variants={staggerItem}>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Seu Objetivo
              </div>
            </label>
            <input
              type="text"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Ex: Perder 10kg, Ganhar massa muscular"
            />
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div variants={staggerItem}>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Altura (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="170"
                step="0.1"
              />
            </motion.div>

            <motion.div variants={staggerItem}>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Peso Atual (kg)
              </label>
              <input
                type="number"
                name="current_weight"
                value={formData.current_weight}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="70"
                step="0.1"
              />
            </motion.div>
          </div>

          <motion.div variants={staggerItem} className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors font-medium disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </PatientLayout>
  );
}
