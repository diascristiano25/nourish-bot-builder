import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExerciseTracker } from '../ExerciseTracker';

describe('ExerciseTracker', () => {
  it('displays exercise type selector and duration input', () => {
    render(<ExerciseTracker patientId="p1" weightKg={70} />);
    expect(screen.getByLabelText(/tipo de exercício/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duração/i)).toBeInTheDocument();
  });
});