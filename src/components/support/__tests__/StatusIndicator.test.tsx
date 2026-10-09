import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusIndicator } from '../StatusIndicator';
import type { Service } from '@/types/status';

describe('StatusIndicator', () => {
  it('renders operational status correctly', () => {
    const service: Service = {
      name: 'API',
      status: 'operational',
      latency: '45ms',
    };

    render(<StatusIndicator service={service} />);
    expect(screen.getByText('Operacional')).toBeInTheDocument();
  });

  it('renders degraded status correctly', () => {
    const service: Service = {
      name: 'Dashboard',
      status: 'degraded',
      latency: '200ms',
    };

    render(<StatusIndicator service={service} />);
    expect(screen.getByText('Degradado')).toBeInTheDocument();
  });

  it('renders outage status correctly', () => {
    const service: Service = {
      name: 'Database',
      status: 'outage',
      latency: 'N/A',
    };

    render(<StatusIndicator service={service} />);
    expect(screen.getByText('Indisponível')).toBeInTheDocument();
  });

  it('applies correct color for operational status', () => {
    const service: Service = {
      name: 'API',
      status: 'operational',
      latency: '45ms',
    };

    const { container } = render(<StatusIndicator service={service} />);
    const statusDot = container.querySelector('div[style*="background-color"]');
    expect(statusDot).toHaveStyle({ backgroundColor: '#10b981' });
  });

  it('applies correct color for degraded status', () => {
    const service: Service = {
      name: 'API',
      status: 'degraded',
      latency: '200ms',
    };

    const { container } = render(<StatusIndicator service={service} />);
    const statusDot = container.querySelector('div[style*="background-color"]');
    expect(statusDot).toHaveStyle({ backgroundColor: '#f59e0b' });
  });

  it('applies correct color for outage status', () => {
    const service: Service = {
      name: 'API',
      status: 'outage',
      latency: 'N/A',
    };

    const { container } = render(<StatusIndicator service={service} />);
    const statusDot = container.querySelector('div[style*="background-color"]');
    expect(statusDot).toHaveStyle({ backgroundColor: '#ef4444' });
  });
});
