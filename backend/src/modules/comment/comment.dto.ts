export interface CommentAuthorDto {
  id: string;
  nickname: string;
  avatarUrl: string | null;
}

export interface CommentDto {
  id: string;
  author: CommentAuthorDto;
  rating: number | null;
  body: string;
  imageUrls: string[];
  createdAt: string;
  replies: CommentDto[];
}
