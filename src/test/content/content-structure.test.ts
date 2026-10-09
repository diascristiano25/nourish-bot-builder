import { describe, it, expect } from 'vitest';
import blogPosts from '../../content/blog/posts.json';
import publicFAQ from '../../content/faq/public.json';
import authFAQ from '../../content/faq/auth.json';
import trainings from '../../content/trainings.json';
import status from '../../content/status.json';

describe('Blog Posts Structure', () => {
  it('should have posts array', () => {
    expect(blogPosts).toHaveProperty('posts');
    expect(Array.isArray(blogPosts.posts)).toBe(true);
  });

  it('should have 5 posts', () => {
    expect(blogPosts.posts).toHaveLength(5);
  });

  it('should have first post as free (premium: false)', () => {
    expect(blogPosts.posts[0].premium).toBe(false);
  });

  it('should have remaining posts as premium', () => {
    const premiumPosts = blogPosts.posts.slice(1);
    premiumPosts.forEach(post => {
      expect(post.premium).toBe(true);
    });
  });

  it('should have all required fields in each post', () => {
    blogPosts.posts.forEach(post => {
      expect(post).toHaveProperty('slug');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('excerpt');
      expect(post).toHaveProperty('content');
      expect(post).toHaveProperty('author');
      expect(post).toHaveProperty('date');
      expect(post).toHaveProperty('category');
      expect(post).toHaveProperty('featuredImage');
      expect(post).toHaveProperty('premium');
      expect(post).toHaveProperty('readTime');
    });
  });

  it('should have valid date format (YYYY-MM-DD)', () => {
    blogPosts.posts.forEach(post => {
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('should have categories array', () => {
    expect(blogPosts).toHaveProperty('categories');
    expect(Array.isArray(blogPosts.categories)).toBe(true);
    expect(blogPosts.categories.length).toBeGreaterThan(0);
  });
});

describe('Public FAQ Structure', () => {
  it('should have categories array', () => {
    expect(publicFAQ).toHaveProperty('categories');
    expect(Array.isArray(publicFAQ.categories)).toBe(true);
  });

  it('should have 5 categories', () => {
    expect(publicFAQ.categories).toHaveLength(5);
  });

  it('should have required category fields', () => {
    publicFAQ.categories.forEach(category => {
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('title');
      expect(category).toHaveProperty('icon');
      expect(category).toHaveProperty('questions');
      expect(Array.isArray(category.questions)).toBe(true);
    });
  });

  it('should have 3-5 questions per category', () => {
    publicFAQ.categories.forEach(category => {
      expect(category.questions.length).toBeGreaterThanOrEqual(3);
      expect(category.questions.length).toBeLessThanOrEqual(5);
    });
  });

  it('should have required question fields', () => {
    publicFAQ.categories.forEach(category => {
      category.questions.forEach((q: any) => {
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('question');
        expect(q).toHaveProperty('answer');
      });
    });
  });
});

describe('Auth FAQ Structure', () => {
  it('should have categories array', () => {
    expect(authFAQ).toHaveProperty('categories');
    expect(Array.isArray(authFAQ.categories)).toBe(true);
  });

  it('should have 8 categories', () => {
    expect(authFAQ.categories).toHaveLength(8);
  });

  it('should include advanced categories', () => {
    const categoryIds = authFAQ.categories.map((c: any) => c.id);
    expect(categoryIds).toContain('integrations');
    expect(categoryIds).toContain('reports');
    expect(categoryIds).toContain('api');
  });

  it('should have 5-7 questions per category', () => {
    authFAQ.categories.forEach(category => {
      expect(category.questions.length).toBeGreaterThanOrEqual(5);
      expect(category.questions.length).toBeLessThanOrEqual(7);
    });
  });

  it('should have approximately 40 total questions', () => {
    const totalQuestions = authFAQ.categories.reduce(
      (sum: number, cat: any) => sum + cat.questions.length,
      0
    );
    expect(totalQuestions).toBeGreaterThanOrEqual(38);
    expect(totalQuestions).toBeLessThanOrEqual(52);
  });
});

describe('Trainings Structure', () => {
  it('should have courses array', () => {
    expect(trainings).toHaveProperty('courses');
    expect(Array.isArray(trainings.courses)).toBe(true);
  });

  it('should have 3 courses', () => {
    expect(trainings.courses).toHaveLength(3);
  });

  it('should have required course fields', () => {
    trainings.courses.forEach(course => {
      expect(course).toHaveProperty('id');
      expect(course).toHaveProperty('title');
      expect(course).toHaveProperty('description');
      expect(course).toHaveProperty('instructor');
      expect(course).toHaveProperty('thumbnail');
      expect(course).toHaveProperty('duration');
      expect(course).toHaveProperty('level');
      expect(course).toHaveProperty('premium');
      expect(course).toHaveProperty('modules');
    });
  });

  it('first course should have free preview video', () => {
    const firstCourse = trainings.courses[0];
    expect(firstCourse.premium).toBe(false);

    const hasPreview = firstCourse.modules.some((module: any) =>
      module.videos.some((video: any) => video.free_preview === true)
    );
    expect(hasPreview).toBe(true);
  });

  it('remaining courses should be premium', () => {
    const premiumCourses = trainings.courses.slice(1);
    premiumCourses.forEach(course => {
      expect(course.premium).toBe(true);
    });
  });

  it('should have modules with videos', () => {
    trainings.courses.forEach(course => {
      expect(Array.isArray(course.modules)).toBe(true);
      expect(course.modules.length).toBeGreaterThan(0);

      course.modules.forEach((module: any) => {
        expect(module).toHaveProperty('id');
        expect(module).toHaveProperty('title');
        expect(module).toHaveProperty('videos');
        expect(Array.isArray(module.videos)).toBe(true);
      });
    });
  });

  it('videos should have required fields', () => {
    trainings.courses.forEach(course => {
      course.modules.forEach((module: any) => {
        module.videos.forEach((video: any) => {
          expect(video).toHaveProperty('id');
          expect(video).toHaveProperty('title');
          expect(video).toHaveProperty('duration');
          expect(video).toHaveProperty('youtube_id');
          expect(video).toHaveProperty('free_preview');
        });
      });
    });
  });
});

describe('Status Structure', () => {
  it('should have required top-level fields', () => {
    expect(status).toHaveProperty('uptime');
    expect(status).toHaveProperty('services');
    expect(status).toHaveProperty('incidents');
    expect(status).toHaveProperty('uptime_history');
  });

  it('should have uptime value of 99.94', () => {
    expect(status.uptime).toBe(99.94);
  });

  it('should have 4 services', () => {
    expect(Array.isArray(status.services)).toBe(true);
    expect(status.services).toHaveLength(4);
  });

  it('all services should be operational', () => {
    status.services.forEach(service => {
      expect(service.status).toBe('operational');
      expect(service).toHaveProperty('name');
      expect(service).toHaveProperty('latency');
    });
  });

  it('should have 2-3 past incidents', () => {
    expect(Array.isArray(status.incidents)).toBe(true);
    expect(status.incidents.length).toBeGreaterThanOrEqual(2);
    expect(status.incidents.length).toBeLessThanOrEqual(3);
  });

  it('all incidents should be resolved', () => {
    status.incidents.forEach(incident => {
      expect(incident.status).toBe('resolved');
      expect(incident).toHaveProperty('date');
      expect(incident).toHaveProperty('title');
      expect(incident).toHaveProperty('duration');
    });
  });

  it('should have 30 days of uptime history', () => {
    expect(Array.isArray(status.uptime_history)).toBe(true);
    expect(status.uptime_history).toHaveLength(30);
  });

  it('uptime history should have date and uptime fields', () => {
    status.uptime_history.forEach(entry => {
      expect(entry).toHaveProperty('date');
      expect(entry).toHaveProperty('uptime');
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry.uptime).toBeGreaterThanOrEqual(0);
      expect(entry.uptime).toBeLessThanOrEqual(100);
    });
  });
});
