import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogPost } from '@/types/blog';

const mockPost: BlogPost = {
  slug: 'test-post',
  title: 'Test Blog Post Title',
  excerpt: 'This is a test excerpt for the blog post that should be displayed on the card component.',
  content: 'Full content here',
  author: 'Test Author',
  authorBio: 'Test bio',
  authorImage: '/test-author.jpg',
  date: '2026-10-08',
  category: 'Test Category',
  tags: ['test', 'blog'],
  featuredImage: '/test-image.jpg',
  premium: false,
  readTime: '5 min',
};

const mockPremiumPost: BlogPost = {
  ...mockPost,
  slug: 'premium-post',
  title: 'Premium Post',
  premium: true,
};

describe('BlogCard', () => {
  it('renders post title and excerpt', () => {
    render(
      <BrowserRouter>
        <BlogCard post={mockPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Blog Post Title')).toBeInTheDocument();
    expect(screen.getByText(/This is a test excerpt/)).toBeInTheDocument();
  });

  it('renders author, date and read time', () => {
    render(
      <BrowserRouter>
        <BlogCard post={mockPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Author')).toBeInTheDocument();
    // Date format depends on locale/timezone, so just check it's present
    expect(screen.getByText(/\d{2}\/\d{2}\/2026/)).toBeInTheDocument();
    expect(screen.getByText('5 min')).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(
      <BrowserRouter>
        <BlogCard post={mockPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('renders Premium badge for premium posts', () => {
    render(
      <BrowserRouter>
        <BlogCard post={mockPremiumPost} />
      </BrowserRouter>
    );

    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it('truncates long excerpts to 150 characters', () => {
    const longExcerptPost: BlogPost = {
      ...mockPost,
      excerpt: 'A'.repeat(200),
    };

    render(
      <BrowserRouter>
        <BlogCard post={longExcerptPost} />
      </BrowserRouter>
    );

    const excerpt = screen.getByText(/A+\.\.\./);
    expect(excerpt.textContent?.length).toBeLessThanOrEqual(154); // 150 + '...'
  });

  it('renders "Ler Mais" button with correct link', () => {
    render(
      <BrowserRouter>
        <BlogCard post={mockPost} />
      </BrowserRouter>
    );

    const button = screen.getByRole('link', { name: /Ler Mais/i });
    expect(button).toHaveAttribute('href', '/empresa/blog/test-post');
  });

  it('hides preview image when showPreview is false', () => {
    const { container } = render(
      <BrowserRouter>
        <BlogCard post={mockPost} showPreview={false} />
      </BrowserRouter>
    );

    const image = container.querySelector('img[alt="Test Blog Post Title"]');
    expect(image).not.toBeInTheDocument();
  });

  it('shows preview image when showPreview is true', () => {
    const { container } = render(
      <BrowserRouter>
        <BlogCard post={mockPost} showPreview={true} />
      </BrowserRouter>
    );

    const image = container.querySelector('img[alt="Test Blog Post Title"]');
    expect(image).toBeInTheDocument();
  });
});
