export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorBio?: string;
  authorImage?: string;
  date: string;
  category: string;
  tags?: string[];
  featuredImage: string;
  premium: boolean;
  readTime: string;
}
