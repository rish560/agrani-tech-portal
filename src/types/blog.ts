// Blog Types
export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  description: string;
  tags: string[];
  coverImage: string;
  content?: string;
  readingTime?: number;
}

export interface BlogMeta {
  slug: string;
  title: string;
  date: string;
  author: string;
  description: string;
  tags: string[];
  coverImage: string;
}
