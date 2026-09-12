import { useState } from "react";
import { Avatar } from "../../shared/components/Avatar";
import { StarRating } from "../../shared/components/StarRating";
import { mediaUrl } from "../../shared/api/media";
import { CommentComposer } from "./CommentComposer";
import type { Comment } from "./types";

const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });

export function CommentItem({
  comment,
  onPosted,
  depth = 0,
}: {
  comment: Comment;
  onPosted: () => void;
  depth?: number;
}): React.JSX.Element {
  const [replying, setReplying] = useState(false);
  // The backend only supports one level of replies (a reply hangs off a
  // top-level comment; replies aren't queried recursively) — exposing
  // "Reply" past that depth would submit a comment whose parent_id isn't a
  // top-level comment id, so it would never be fetched back and just vanish.
  const canReply = depth === 0;

  return (
    <article className={depth === 0 ? "review-card" : "review-reply-card"}>
      <Avatar src={mediaUrl(comment.author.avatarUrl)} name={comment.author.nickname} size={depth === 0 ? 44 : 34} />
      <div className="review-card-body">
        <div className="review-card-heading">
          <strong className="review-author">{comment.author.nickname}</strong>
          <span className="review-date">{formatDate(comment.createdAt)}</span>
        </div>
        {comment.rating != null && (
          <div className="review-rating-row">
            <StarRating value={comment.rating} size={15} />
          </div>
        )}
        <p className="review-text">{comment.body}</p>
        {comment.imageUrls.length > 0 && (
          <div className="review-images">
            {comment.imageUrls.map((url) => (
              <img key={url} src={mediaUrl(url) ?? undefined} alt="" />
            ))}
          </div>
        )}
        {canReply && (
          <button type="button" className="review-reply-toggle" onClick={() => setReplying((v) => !v)}>
            {replying ? "Cancel" : "↩ Reply"}
          </button>
        )}

        {replying && (
          <CommentComposer
            parentId={comment.id}
            onCancel={() => setReplying(false)}
            onPosted={() => {
              setReplying(false);
              onPosted();
            }}
          />
        )}

        {comment.replies.length > 0 && (
          <div className="review-replies">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} onPosted={onPosted} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
