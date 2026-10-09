import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BlogList } from '@/components/blog/BlogList';
import { BlogPost } from '@/types/blog';

const mockPosts: BlogPost[] = Array.from({ length: 10 }, (_, i) => ({
  slug: `post-${i + 1}`,
  title: `Post ${i + 1}`,
  excerpt: `Excerpt for post ${i + 1}`,
  content: `Content ${i + 1}`,
  author: 'Test Author',
  date: '2026-10-08',
  category: 'Test',
  featuredImage: `/image-${i + 1}.jpg`,
  premium: false,
  readTime: '5 min',
}));

describe('BlogList', () => {
  it('renders first 6 posts on page 1', () => {
    const onPageChange = vi.fn();

    render(
      <BrowserRouter>
        <BlogList posts={mockPosts} currentPage={1} onPageChange={onPageChange} />
      </BrowserRouter>
    );

    expect(screen.getByText('Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post 6')).toBeInTheDocument();
    expect(screen.queryByText('Post 7')).not.toBeInTheDocument();
  });

  it('renders correct posts on page 2', () => {
    const onPageChange = vi.fn();

    render(
      <BrowserRouter>
        <BlogList posts={mockPosts} currentPage={2} onPageChange={onPageChange} />
      </BrowserRouter>
    );

    expect(screen.getByText('Post 7')).toBeInTheDocument();
    expect(screen.getByText('Post 10')).toBeInTheDocument();
    expect(screen.queryByText('Post 1')).not.toBeInTheDocument();
  });

  it('displays pagination controls', () => {
    const onPageChange = vi.fn();

    render(
      <BrowserRouter>
        <BlogList posts={mockPosts} currentPage={1} onPageChange={onPageChange} />
      </BrowserRouter>
    );

    expect(screen.getByText('Anterior')).toBeInTheDocument();
    expect(screen.getByText('Próxima')).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
  });

  it('disables Anterior button on first page', () => {
    const onPageChange = vi.fn();

    render(
      <BrowserRouter>
        <BlogList posts={mockPosts} currentPage={1} onPageChange={onPageChange} />
      </BrowserRouter>
    );

    const anteriorButton = screen.getByRole('button', { name: /Anterior/i });
    expect(anteriorButton).toBeDisabled();
  });

  it('disables Próxima button on last page', () => {
    const onPageChange = vi.fn();

    render(
      <BrowserRouter>
        <BlogList posts={mockPosts} currentPage={2} onPageChange={onPageChange} />
      </BrowserRouter>
    );

    const proximaButton = screen.getByRole('button', { name: /Próxima/i });
    expect(proximaButton).toBeDisabled();
  });

  it('calls onPageChange with correct page number when clicking Próxima', () => {
    const onPageChange = vi.fn();

    render(
      <BrowserRouter>
        <BlogList posts={mockPosts} currentPage={1} onPageChange={onPageChange} />
      </BrowserRouter>
    );

    const proximaButton = screen.getByRole('button', { name: /Próxima/i });
    fireEvent.click(proximaButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with correct page number when clicking Anterior', () => {
    const onPageChange = vi.fn();

    render(
      <BrowserRouter>
        <BlogList posts={mockPosts} currentPage={2} onPageChange={onPageChange} />
      </BrowserRouter>
    );

    const anteriorButton = screen.getByRole('button', { name: /Anterior/i });
    fireEvent.click(anteriorButton);

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('hides pagination when there is only one page', () => {
    const onPageChange = vi.fn();
    const fewPosts = mockPosts.slice(0, 3);

    render(
      <BrowserRouter>
        <BlogList posts={fewPosts} currentPage={1} onPageChange={onPageChange} />
      </BrowserRouter>
    );

    expect(screen.queryByText('Anterior')).not.toBeInTheDocument();
    expect(screen.queryByText('Próxima')).not.toBeInTheDocument();
  });

  it('renders posts in a grid layout', () => {
    const onPageChange = vi.fn();

    const { container } = render(
      <BrowserRouter>
        <BlogList posts={mockPosts} currentPage={1} onPageChange={onPageChange} />
      </BrowserRouter>
    );

    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });
});
