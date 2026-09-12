import { useEffect, useState } from "react";

// Only object URLs are used for previews; revoke them all on unmount or
// whenever the file list changes, to avoid leaking memory.
export function ImagePicker({
  files,
  onChange,
  max = 4,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  max?: number;
}): React.JSX.Element {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  return (
    <div className="image-picker">
      <div className="image-picker-previews">
        {previews.map((src, i) => (
          <div key={src} className="image-picker-thumb">
            <img src={src} alt="" />
            <button type="button" aria-label="Remove image" onClick={() => onChange(files.filter((_, j) => j !== i))}>
              ×
            </button>
          </div>
        ))}
      </div>
      {files.length < max && (
        <label className="ghost-button image-picker-add">
          + Add photo
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange([...files, file]);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}
