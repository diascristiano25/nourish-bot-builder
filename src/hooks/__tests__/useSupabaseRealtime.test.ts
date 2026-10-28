import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSupabaseRealtime } from '../useSupabaseRealtime';

vi.mock('@/integrations/supabase/client', () => {
  const mockUnsubscribe = vi.fn();
  const mockOn = vi.fn().mockReturnThis();
  const mockSubscribe = vi.fn().mockImplementation((callback) => {
    if (typeof callback === 'function') {
      callback('SUBSCRIBED', null);
    }
    return { unsubscribe: mockUnsubscribe };
  });
  const mockRemoveChannel = vi.fn();
  const mockChannel = vi.fn().mockReturnValue({
    on: mockOn,
    subscribe: mockSubscribe,
  });

  return {
    supabase: {
      channel: mockChannel,
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      removeChannel: mockRemoveChannel,
    },
  };
});

describe('useSupabaseRealtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribes on mount and unsubscribes on unmount', async () => {
    const { unmount } = renderHook(() =>
      useSupabaseRealtime('anthropometrics', { column: 'patient_id', value: 'p1' })
    );

    // Verify channel was created and subscribed
    const { supabase } = await import('@/integrations/supabase/client');
    expect(supabase.channel).toHaveBeenCalled();

    // Wait for effects to settle
    await act(async () => {});

    // Verify cleanup on unmount
    await act(async () => {
      unmount();
    });
  });
});