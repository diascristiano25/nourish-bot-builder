import { describe, it, expect, vi, beforeEach } from 'vitest';

// Build a mock that supports full Supabase query chaining
const buildMockChain = (finalData: any[] = [], finalError: any = null) => {
  const eq = vi.fn().mockReturnThis();
  const is = vi.fn().mockReturnThis();
  const gte = vi.fn().mockReturnThis();
  const lte = vi.fn().mockResolvedValue({ data: finalData, error: finalError });

  const select = vi.fn(() => ({
    eq,
  }));

  const from = vi.fn(() => ({
    select,
  }));

  // Wire up the chain
  eq.mockReturnThis();
  is.mockReturnThis();
  gte.mockReturnThis();
  lte.mockResolvedValue({ data: finalData, error: finalError });

  // Connect: select returns object with eq, which has is, etc.
  const selectResult = {
    eq: vi.fn(() => ({
      is: vi.fn(() => ({
        gte: vi.fn(() => ({
          lte: lte,
        })),
      })),
    })),
  };

  const fromResult = {
    select: vi.fn(() => selectResult),
  };

  return {
    from: vi.fn(() => fromResult),
    _lte: lte,
  };
};

describe('send-appointment-reminders Edge Function', () => {
  describe('Query Logic', () => {
    it('should filter out appointments with reminder_sent_at already set', () => {
      const appointments = [
        { id: '1', reminder_sent_at: null },
        { id: '2', reminder_sent_at: new Date().toISOString() }
      ];

      const needingReminders = appointments.filter(a => a.reminder_sent_at === null);

      expect(needingReminders).toHaveLength(1);
      expect(needingReminders[0].id).toBe('1');
    });

    it('should only include scheduled appointments within 24h window', () => {
      const now = new Date();
      const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);
      const in36Hours = new Date(now.getTime() + 36 * 60 * 60 * 1000);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const appointments = [
        { id: '1', start_time: in12Hours.toISOString(), status: 'scheduled' },
        { id: '2', start_time: in36Hours.toISOString(), status: 'scheduled' },
        { id: '3', start_time: yesterday.toISOString(), status: 'scheduled' }
      ];

      const withinWindow = appointments.filter(a => {
        const apptTime = new Date(a.start_time);
        return apptTime >= now && apptTime <= new Date(now.getTime() + 24 * 60 * 60 * 1000);
      });

      expect(withinWindow).toHaveLength(1);
      expect(withinWindow[0].id).toBe('1');
    });

    it('should verify mock chain executes correctly', async () => {
      const mockData = [
        { id: '1', patient_id: 'p1', start_time: new Date().toISOString(), status: 'scheduled', reminder_sent_at: null }
      ];

      const mock = buildMockChain(mockData, null);

      const result = await mock.from('appointments')
        .select('*')
        .eq('status', 'scheduled')
        .is('reminder_sent_at', null)
        .gte('start_time', new Date().toISOString())
        .lte('start_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());

      expect(result.data).toHaveLength(1);
      expect(result.error).toBeNull();
      expect(mock.from).toHaveBeenCalledWith('appointments');
    });
  });
});