import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlogPost } from '@/types/blog';
import { Calendar, Clock, User } from 'lucide-react';

export interface BlogCardProps {
  post: BlogPost;
  showPreview?: boolean;
}

export function BlogCard({ post, showPreview = true }: BlogCardProps) {
  const truncatedExcerpt = post.excerpt.length > 150
    ? post.excerpt.slice(0, 150) + '...'
    : post.excerpt;

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow bg-card">
      {showPreview && (
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          {post.premium && (
            <Badge className="absolute top-3 right-3 bg-[#C4764A] text-white">
              Premium
            </Badge>
          )}
        </div>
      )}

      <CardHeader className="flex-none">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-[#518C5B] border-[#518C5B]">
            {post.category}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2 text-xl">
          {post.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1">
        <CardDescription className="line-clamp-3">
          {truncatedExcerpt}
        </CardDescription>
      </CardContent>

      <CardFooter className="flex-col gap-3 items-start">
        <div className="flex items-center gap-4 text-sm text-muted-foreground w-full">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{post.readTime}</span>
          </div>
        </div>

        <Button asChild className="w-full bg-[#518C5B] hover:bg-[#518C5B]/90">
          <Link to={`/empresa/blog/${post.slug}`}>
            Ler Mais
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
