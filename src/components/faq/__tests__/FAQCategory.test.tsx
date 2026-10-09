import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FAQCategory } from '../FAQCategory';
import { FAQCategory as FAQCategoryType } from '@/types/faq';

describe('FAQCategory', () => {
  const mockCategory: FAQCategoryType = {
    id: 'test-category',
    title: 'Test Category',
    icon: 'Rocket',
    questions: [
      {
        id: 'q1',
        question: 'What is the first question?',
        answer: 'This is the first answer.',
      },
      {
        id: 'q2',
        question: 'What is the second question?',
        answer: 'This is the second answer.',
      },
    ],
  };

  it('renders category title', () => {
    render(<FAQCategory category={mockCategory} />);
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('renders all questions', () => {
    render(<FAQCategory category={mockCategory} />);
    expect(screen.getByText('What is the first question?')).toBeInTheDocument();
    expect(screen.getByText('What is the second question?')).toBeInTheDocument();
  });

  it('renders icon with correct styling', () => {
    const { container } = render(<FAQCategory category={mockCategory} />);
    const iconContainer = container.querySelector('.bg-\\[\\#518C5B\\]\\/10');
    expect(iconContainer).toBeInTheDocument();
  });

  it('uses fallback icon when icon name is invalid', () => {
    const invalidIconCategory: FAQCategoryType = {
      ...mockCategory,
      icon: 'InvalidIconName',
    };
    const { container } = render(<FAQCategory category={invalidIconCategory} />);
    // Should render without crashing
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders accordion structure', () => {
    const { container } = render(<FAQCategory category={mockCategory} />);
    const accordionItems = container.querySelectorAll('[data-radix-collection-item]');
    expect(accordionItems.length).toBe(2);
  });
});
