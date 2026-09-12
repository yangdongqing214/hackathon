export interface CommentAuthor {
  id: string;
  nickname: string;
  avatarUrl: string | null;
}

export interface Comment {
  id: string;
  author: CommentAuthor;
  rating: number | null;
  body: string;
  imageUrls: string[];
  createdAt: string;
  replies: Comment[];
}

export interface PagedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
