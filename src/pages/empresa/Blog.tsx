import { useState } from 'react';
import { HybridPage } from '@/components/hybrid/HybridPage';
import { BlogList } from '@/components/blog/BlogList';
import postsData from '@/content/blog/posts.json';
import { BlogPost } from '@/types/blog';

const posts: BlogPost[] = postsData.posts;

function BlogPublicContent() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Blog NutriFlow
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Artigos, tutoriais e insights para nutricionistas que querem se destacar
          </p>
        </div>

        <BlogList
          posts={posts}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

function BlogAuthContent() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Blog NutriFlow
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Artigos, tutoriais e insights para nutricionistas que querem se destacar
          </p>
        </div>

        <BlogList
          posts={posts}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

export function Blog() {
  return (
    <HybridPage
      title="Blog"
      description="Artigos e tutoriais sobre nutrição, gestão de consultório e tecnologia para nutricionistas"
      publicContent={<BlogPublicContent />}
      authContent={<BlogAuthContent />}
    />
  );
}
