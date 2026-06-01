export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  content2?: string;
  content3?: string;
  content4?: string;
  content5?: string;
  content6?: string;
  content7?: string;
  instructions?: string;
  category: Category;
  tags: string[];
  tools?: string[];
  testedModels?: string[];
  youtubeUrl?: string;
  author: string;
  likes: number;
  copyCount: number;
  createdAt: string;
}

export enum Category {
  MARKETING = 'Marketing',
  SOCIAL_MEDIA = 'Social Media',
  TRANSACTIONS = 'Transactions',
  IMAGE_GENERATION = 'Image Generation',
  COACHING = 'Coaching',
  PRODUCTIVITY = 'Productivity',
  AI_SEARCH = 'AI Search',
  OTHER = 'Other',
}

export type SortOption = 'recent' | 'popular' | 'category';

export type UserProfile = {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
};
