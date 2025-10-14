export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  category: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  comments: Comment[];
  tags: string[];
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isLoggedIn: boolean;
}

export interface AnalyticsData {
  postViews: { date: string; views: number }[];
  postLikes: { date: string; likes: number }[];
  comments: { date: string; comments: number }[];
  topPosts: { title: string; views: number; likes: number }[];
}

export interface Bookmark {
  id: string;
  articleId: string;
  userId: string;
  createdAt: string;
}

export type Theme = 'light' | 'dark';

export interface AppState {
  theme: Theme;
  user: User | null;
  blogPosts: BlogPost[];
  bookmarks: Bookmark[];
  analytics: AnalyticsData;
}
