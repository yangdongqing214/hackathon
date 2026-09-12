import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { Avatar } from "../../shared/components/Avatar";
import { Badge } from "../../shared/components/Badge";
import { StarRating } from "../../shared/components/StarRating";
import { Pagination } from "../../shared/components/Pagination";
import { SearchInput } from "../../shared/components/SearchInput";
import { Skeleton } from "../../shared/components/Skeleton";
import { EmptyState } from "../../shared/components/EmptyState";
import { Modal } from "../../shared/components/Modal";
import { EmojiPicker } from "../../shared/components/EmojiPicker";
import { ImagePicker } from "../../shared/components/ImagePicker";
import { useToast } from "../../shared/components/ToastProvider";
import { mediaUrl } from "../../shared/api/media";

const DEMO_ROWS_PAGE_SIZE = 4;

const DEMO_TEAM = [
  { name: "Priya Nair", role: "Product design" },
  { name: "Marcus Klein", role: "Backend engineering" },
  { name: "Sofia Alvarez", role: "Customer support" },
  { name: "Dwayne Thompson", role: "Growth marketing" },
  { name: "Yuki Matsuda", role: "Frontend engineering" },
  { name: "Elena Petrova", role: "Data science" },
  { name: "Jamal Carter", role: "Product design" },
  { name: "Wei Zhang", role: "Backend engineering" },
  { name: "Amara Obi", role: "Customer support" },
  { name: "Liam O'Connor", role: "Growth marketing" },
];

// Two 6x6 solid-color PNG data URIs — a file input can't be pre-populated
// with "default files", so we build real File objects from raw bytes here
// to show ImagePicker with a few images already selected instead of empty.
const DEMO_IMAGE_DATA_URIS = [
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAIAAABvrngfAAAAEUlEQVR4nGOI6nmGhhhoKwQAVMRAsYgAOyMAAAAASUVORK5CYII=",
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAIAAABvrngfAAAAEUlEQVR4nGN41mODhhhoKwQAj9U8eREjESgAAAAASUVORK5CYII=",
];

async function dataUriToFile(dataUri: string, filename: string): Promise<File> {
  const res = await fetch(dataUri);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

export function HomePage(): React.JSX.Element {
  const { user } = useAuth();
  const showToast = useToast();
  const [demoPage, setDemoPage] = useState(1);
  const [demoSearch, setDemoSearch] = useState("");
  const [demoRating, setDemoRating] = useState(3);
  const [modalOpen, setModalOpen] = useState(false);
  const [emojiText, setEmojiText] = useState("Loving this template so far 🎉");
  const [demoImages, setDemoImages] = useState<File[]>([]);

  useEffect(() => {
    Promise.all(DEMO_IMAGE_DATA_URIS.map((uri, i) => dataUriToFile(uri, `demo-${i + 1}.png`))).then(setDemoImages);
  }, []);

  if (!user) return <></>;

  const filteredTeam = DEMO_TEAM.filter((row) =>
    `${row.name} ${row.role}`.toLowerCase().includes(demoSearch.trim().toLowerCase()),
  );
  const demoTotalPages = Math.max(1, Math.ceil(filteredTeam.length / DEMO_ROWS_PAGE_SIZE));
  const visiblePage = Math.min(demoPage, demoTotalPages);
  const pageRows = filteredTeam.slice((visiblePage - 1) * DEMO_ROWS_PAGE_SIZE, visiblePage * DEMO_ROWS_PAGE_SIZE);

  return (
    <div className="page component-showcase">
      <h1>Component library</h1>
      <p className="page-subtitle">
        Every shared building block this template ships with, in one place — copy from here into real pages.
      </p>

      <section className="showcase-section">
        <h2>Buttons</h2>
        <div className="showcase-row">
          <button className="primary-button" type="button">
            Primary
          </button>
          <button className="ghost-button" type="button">
            Ghost
          </button>
          <button className="primary-button" type="button" disabled>
            Disabled
          </button>
        </div>
      </section>

      <section className="showcase-section">
        <h2>Avatar &amp; Badge</h2>
        <div className="showcase-row">
          <Avatar src={mediaUrl(user.avatarUrl)} name={user.nickname} />
          <Avatar name="No Avatar" />
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="danger">Danger</Badge>
        </div>
      </section>

      <section className="showcase-section">
        <h2>Star rating</h2>
        <StarRating value={demoRating} onChange={setDemoRating} />
      </section>

      <section className="showcase-section">
        <h2>Search + Pagination</h2>
        <SearchInput
          value={demoSearch}
          onChange={(v) => {
            setDemoSearch(v);
            setDemoPage(1);
          }}
          placeholder="Search the demo team by name or role…"
        />
        {pageRows.length === 0 ? (
          <EmptyState>No one matches "{demoSearch}".</EmptyState>
        ) : (
          <div className="item-list">
            {pageRows.map((row) => (
              <div key={row.name} className="item-row">
                <div className="item-row-heading">
                  <strong>{row.name}</strong>
                  <Badge>{row.role}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination page={visiblePage} totalPages={demoTotalPages} onChange={setDemoPage} />
      </section>

      <section className="showcase-section">
        <h2>Skeleton &amp; empty state</h2>
        <p className="field-hint">What a loading row and a genuinely empty list look like, side by side.</p>
        <Skeleton height={16} width={220} />
        <div style={{ height: 8 }} />
        <Skeleton height={16} width={160} />
        <div style={{ height: 12 }} />
        <EmptyState>Nothing here yet — this is what an empty list looks like.</EmptyState>
      </section>

      <section className="showcase-section">
        <h2>Modal &amp; toast</h2>
        <div className="showcase-row">
          <button className="ghost-button" type="button" onClick={() => setModalOpen(true)}>
            Open modal
          </button>
          <button className="ghost-button" type="button" onClick={() => showToast("Saved successfully.")}>
            Show success toast
          </button>
          <button className="ghost-button" type="button" onClick={() => showToast("Something went wrong.", "error")}>
            Show error toast
          </button>
        </div>
        {modalOpen && (
          <Modal title="Example modal" onClose={() => setModalOpen(false)}>
            <p>Any content goes here — a form, a confirmation, details.</p>
          </Modal>
        )}
      </section>

      <section className="showcase-section">
        <h2>Emoji picker &amp; image picker</h2>
        <div className="showcase-row">
          <input value={emojiText} onChange={(e) => setEmojiText(e.target.value)} placeholder="Pick an emoji →" />
          <EmojiPicker onPick={(e) => setEmojiText((prev) => prev + e)} />
        </div>
        <ImagePicker files={demoImages} onChange={setDemoImages} />
      </section>
    </div>
  );
}
