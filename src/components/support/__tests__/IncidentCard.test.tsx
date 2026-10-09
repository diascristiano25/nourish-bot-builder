import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IncidentCard } from '../IncidentCard';
import type { Incident } from '@/types/status';

describe('IncidentCard', () => {
  it('renders incident with resolved status', () => {
    const incident: Incident = {
      date: '2026-10-05',
      title: 'Lentidão no Dashboard',
      status: 'resolved',
      duration: '23min',
      description: 'Identificado gargalo em queries complexas.',
      severity: 'medium',
    };

    render(<IncidentCard incident={incident} />);

    expect(screen.getByText('Lentidão no Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Resolvido')).toBeInTheDocument();
    expect(screen.getByText('Identificado gargalo em queries complexas.')).toBeInTheDocument();
    expect(screen.getByText(/Duração: 23min/)).toBeInTheDocument();
  });

  it('renders incident with investigating status', () => {
    const incident: Incident = {
      date: '2026-10-08',
      title: 'API instability',
      status: 'investigating',
      duration: '10min',
    };

    render(<IncidentCard incident={incident} />);

    expect(screen.getByText('API instability')).toBeInTheDocument();
    expect(screen.getByText('Investigando')).toBeInTheDocument();
  });

  it('renders incident with identified status', () => {
    const incident: Incident = {
      date: '2026-10-08',
      title: 'Database slow queries',
      status: 'identified',
      duration: '15min',
    };

    render(<IncidentCard incident={incident} />);

    expect(screen.getByText('Database slow queries')).toBeInTheDocument();
    expect(screen.getByText('Identificado')).toBeInTheDocument();
  });

  it('renders incident with monitoring status', () => {
    const incident: Incident = {
      date: '2026-10-08',
      title: 'High CPU usage',
      status: 'monitoring',
      duration: '30min',
    };

    render(<IncidentCard incident={incident} />);

    expect(screen.getByText('High CPU usage')).toBeInTheDocument();
    expect(screen.getByText('Monitorando')).toBeInTheDocument();
  });

  it('renders severity badge when provided', () => {
    const incident: Incident = {
      date: '2026-10-05',
      title: 'Critical issue',
      status: 'resolved',
      duration: '1h',
      severity: 'high',
    };

    render(<IncidentCard incident={incident} />);

    expect(screen.getByText('Alta')).toBeInTheDocument();
  });

  it('renders low severity badge', () => {
    const incident: Incident = {
      date: '2026-10-05',
      title: 'Minor issue',
      status: 'resolved',
      duration: '5min',
      severity: 'low',
    };

    render(<IncidentCard incident={incident} />);

    expect(screen.getByText('Baixa')).toBeInTheDocument();
  });

  it('renders medium severity badge', () => {
    const incident: Incident = {
      date: '2026-10-05',
      title: 'Moderate issue',
      status: 'resolved',
      duration: '20min',
      severity: 'medium',
    };

    render(<IncidentCard incident={incident} />);

    expect(screen.getByText('Média')).toBeInTheDocument();
  });

  it('renders without severity badge when not provided', () => {
    const incident: Incident = {
      date: '2026-10-05',
      title: 'Some issue',
      status: 'resolved',
      duration: '10min',
    };

    render(<IncidentCard incident={incident} />);

    expect(screen.queryByText('Baixa')).not.toBeInTheDocument();
    expect(screen.queryByText('Média')).not.toBeInTheDocument();
    expect(screen.queryByText('Alta')).not.toBeInTheDocument();
  });

  it('formats date correctly in Brazilian Portuguese', () => {
    const incident: Incident = {
      date: '2026-10-05',
      title: 'Test incident',
      status: 'resolved',
      duration: '10min',
    };

    render(<IncidentCard incident={incident} />);

    // Brazilian date format: DD de MMM de YYYY (checking for "04 de out." because date might be off by timezone)
    expect(screen.getByText(/0[45] de out\. de 2026/i)).toBeInTheDocument();
  });

  it('renders without description when not provided', () => {
    const incident: Incident = {
      date: '2026-10-05',
      title: 'Simple incident',
      status: 'resolved',
      duration: '5min',
    };

    const { container } = render(<IncidentCard incident={incident} />);

    expect(screen.getByText('Simple incident')).toBeInTheDocument();
    // Should not have a description paragraph
    const descriptions = container.querySelectorAll('p.text-sm.text-slate-600.leading-relaxed');
    expect(descriptions.length).toBe(0);
  });
});
