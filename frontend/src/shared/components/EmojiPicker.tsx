import { useState } from "react";

const EMOJIS = ["😀", "😂", "😍", "👍", "🙏", "🎉", "😢", "😡", "🔥", "❤️", "👏", "🤔"];

export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }): React.JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <div className="emoji-picker-wrapper">
      <button type="button" className="ghost-button" onClick={() => setOpen((v) => !v)} aria-label="Insert emoji">
        🙂
      </button>
      {open && (
        <div className="emoji-picker-panel">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              className="emoji-option"
              onClick={() => {
                onPick(e);
                setOpen(false);
              }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
