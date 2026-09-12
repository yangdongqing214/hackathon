import { useState } from "react";
import { StarRating } from "../../shared/components/StarRating";
import { EmojiPicker } from "../../shared/components/EmojiPicker";
import { ImagePicker } from "../../shared/components/ImagePicker";
import { commentApi } from "./api";

export function CommentComposer({
  parentId,
  onPosted,
  onCancel,
}: {
  parentId: string | null;
  onPosted: () => void;
  onCancel?: () => void;
}): React.JSX.Element {
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(): Promise<void> {
    if (!body.trim()) return;
    setSubmitting(true);
    const res = await commentApi.create({ parentId, rating: parentId ? null : rating || null, body: body.trim(), images });
    setSubmitting(false);
    if (res.code === 0) {
      setBody("");
      setImages([]);
      setRating(0);
      onPosted();
    }
  }

  return (
    <div className={parentId ? "review-composer review-composer-reply" : "review-composer"}>
      {!parentId && (
        <div className="review-composer-rating">
          <span>Your rating</span>
          <StarRating value={rating} onChange={setRating} size={24} />
        </div>
      )}

      {/* Text, emoji, and images share one composer surface — one border, one focus state — instead of three separate stacked controls. */}
      <div className="review-compose-shell">
        <textarea
          className="review-composer-textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={parentId ? "Write a reply…" : "What did you think? Add a photo or an emoji below."}
          rows={parentId ? 2 : 3}
        />
        <div className="review-compose-attachments">
          <ImagePicker files={images} onChange={setImages} />
        </div>
        <div className="review-composer-toolbar">
          <div className="review-composer-toolbar-left">
            <EmojiPicker onPick={(e) => setBody((prev) => prev + e)} />
          </div>
          <div className="review-composer-toolbar-actions">
            {onCancel && (
              <button type="button" className="ghost-button" onClick={onCancel}>
                Cancel
              </button>
            )}
            <button type="button" className="primary-button" disabled={submitting || !body.trim()} onClick={handleSubmit}>
              {submitting && <span className="button-spinner" aria-hidden="true" />}
              {submitting ? "Posting…" : parentId ? "Post reply" : "Post review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
