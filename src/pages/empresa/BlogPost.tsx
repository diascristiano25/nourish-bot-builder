import { useParams, Link, Navigate } from 'react-router-dom';
import { HybridPage } from '@/components/hybrid/HybridPage';
import { BlogContent } from '@/components/blog/BlogContent';
import { BlogCard } from '@/components/blog/BlogCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import postsData from '@/content/blog/posts.json';
import { BlogPost } from '@/types/blog';

const posts: BlogPost[] = postsData.posts;

function BlogPostPublicContent({ post }: { post: BlogPost }) {
  const relatedPosts = posts
    .filter(p => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/empresa/blog">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Blog
            </Link>
          </Button>

          <article className="space-y-6">
            <header className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[#518C5B] border-[#518C5B]">
                  {post.category}
                </Badge>
                {post.premium && (
                  <Badge className="bg-[#C4764A] text-white">
                    Premium
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>

              {post.authorBio && (
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  {post.authorImage && (
                    <img
                      src={post.authorImage}
                      alt={post.author}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{post.author}</p>
                    <p className="text-sm text-muted-foreground">{post.authorBio}</p>
                  </div>
                </div>
              )}
            </header>

            <div className="relative aspect-[21/9] overflow-hidden rounded-lg">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>

            <BlogContent
              content={post.content}
              isPremium={post.premium}
              isAuthenticated={false}
            />

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t">
                <span className="text-sm font-semibold text-muted-foreground">Tags:</span>
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </article>

          {relatedPosts.length > 0 && (
            <section className="pt-12 border-t space-y-6">
              <h2 className="text-2xl font-bold text-foreground">
                Artigos Relacionados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map(relatedPost => (
                  <BlogCard key={relatedPost.slug} post={relatedPost} showPreview />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function BlogPostAuthContent({ post }: { post: BlogPost }) {
  const relatedPosts = posts
    .filter(p => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/empresa/blog">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Blog
            </Link>
          </Button>

          <article className="space-y-6">
            <header className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[#518C5B] border-[#518C5B]">
                  {post.category}
                </Badge>
                {post.premium && (
                  <Badge className="bg-[#C4764A] text-white">
                    Premium
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>

              {post.authorBio && (
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  {post.authorImage && (
                    <img
                      src={post.authorImage}
                      alt={post.author}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{post.author}</p>
                    <p className="text-sm text-muted-foreground">{post.authorBio}</p>
                  </div>
                </div>
              )}
            </header>

            <div className="relative aspect-[21/9] overflow-hidden rounded-lg">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>

            <BlogContent
              content={post.content}
              isPremium={post.premium}
              isAuthenticated={true}
            />

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t">
                <span className="text-sm font-semibold text-muted-foreground">Tags:</span>
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </article>

          {relatedPosts.length > 0 && (
            <section className="pt-12 border-t space-y-6">
              <h2 className="text-2xl font-bold text-foreground">
                Artigos Relacionados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map(relatedPost => (
                  <BlogCard key={relatedPost.slug} post={relatedPost} showPreview />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const post = posts.find(p => p.slug === slug);

  if (!post) {
    return <Navigate to="/empresa/blog" replace />;
  }

  return (
    <HybridPage
      title={post.title}
      description={post.excerpt}
      publicContent={<BlogPostPublicContent post={post} />}
      authContent={<BlogPostAuthContent post={post} />}
    />
  );
}
