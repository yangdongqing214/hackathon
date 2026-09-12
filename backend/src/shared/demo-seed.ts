import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { UserModel } from "../modules/user/user.model";
import { CommentModel } from "../modules/comment/comment.model";
import { UPLOAD_ROOT, publicPath } from "./upload";

const TARGET_TYPE = "demo";
const TARGET_ID = "demo-thread";

// 6x6 solid-color PNGs, hardcoded as base64 — used for demo comment images
// without depending on an external image host.
const DEMO_IMAGE_PNGS: Record<string, string> = {
  "demo-1.png":
    "iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAIAAABvrngfAAAAEUlEQVR4nGOI6nmGhhhoKwQAVMRAsYgAOyMAAAAASUVORK5CYII=",
  "demo-2.png":
    "iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAIAAABvrngfAAAAEUlEQVR4nGN41mODhhhoKwQAj9U8eREjESgAAAAASUVORK5CYII=",
};

const DEMO_REVIEWERS = [
  { username: "priya.reviews", email: "priya@demo.local", nickname: "Priya Nair", avatarSeed: 12 },
  { username: "marcus.k", email: "marcus@demo.local", nickname: "Marcus Klein", avatarSeed: 32 },
  { username: "sofia_writes", email: "sofia@demo.local", nickname: "Sofia Alvarez", avatarSeed: 45 },
  { username: "dwayne_t", email: "dwayne@demo.local", nickname: "Dwayne Thompson", avatarSeed: 53 },
  { username: "yuki.m", email: "yuki@demo.local", nickname: "Yuki Matsuda", avatarSeed: 68 },
];

// pravatar.cc serves stable, realistic-looking placeholder headshots by index — no
// account/API key needed. Falls back to no avatar (initials) if the fetch fails, e.g. offline.
async function fetchDemoAvatar(seed: number): Promise<string | null> {
  try {
    const res = await fetch(`https://i.pravatar.cc/150?img=${seed}`);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const dir = path.join(UPLOAD_ROOT, "avatars");
    fs.mkdirSync(dir, { recursive: true });
    const filename = `demo-${seed}.jpg`;
    fs.writeFileSync(path.join(dir, filename), buf);
    return publicPath("avatars", filename);
  } catch {
    return null;
  }
}

interface DemoComment {
  authorIndex: number;
  rating: number | null;
  body: string;
  imageKeys?: string[];
  replies?: { authorIndex: number; body: string }[];
}

const DEMO_COMMENTS: DemoComment[] = [
  {
    authorIndex: 0,
    rating: 5,
    body: "Setup took about ten minutes end to end — the remember-me flow especially just worked. 🎉",
    replies: [{ authorIndex: 3, body: "Same experience here, no surprises." }],
  },
  {
    authorIndex: 1,
    rating: 4,
    body: "Solid starting point. Docs on swapping the role list could be clearer, but the code itself is easy to follow.",
    imageKeys: ["demo-1.png"],
  },
  {
    authorIndex: 2,
    rating: 3,
    body: "Works, but I had to dig into the middleware to understand session renewal. A short comment would've saved me 20 minutes 🙂",
  },
  {
    authorIndex: 3,
    rating: 5,
    body: "Password reset flow being mocked instead of half-implemented is the right call for a template. Clear about what's real vs. stubbed.",
    imageKeys: ["demo-2.png"],
    replies: [
      { authorIndex: 4, body: "Agreed — better than a broken email integration nobody configures." },
      { authorIndex: 0, body: "This is what sold me on using it for the hackathon." },
    ],
  },
  {
    authorIndex: 4,
    rating: 2,
    body: "Ran into a port conflict with another Mongo container on first boot — worth calling out in the README up front.",
  },
];

export async function ensureDemoDataSeeded(): Promise<void> {
  const existing = await CommentModel.countDocuments({ target_type: TARGET_TYPE, target_id: TARGET_ID });
  if (existing > 0) return;

  const dir = path.join(UPLOAD_ROOT, "comment-images");
  fs.mkdirSync(dir, { recursive: true });
  for (const [filename, base64] of Object.entries(DEMO_IMAGE_PNGS)) {
    const filePath = path.join(dir, filename);
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
  }

  const passwordHash = await bcrypt.hash("password123", 10);
  const authorIds: string[] = [];
  for (const reviewer of DEMO_REVIEWERS) {
    const existingUser = await UserModel.findOne({ username: reviewer.username });
    if (existingUser) {
      authorIds.push(existingUser._id.toString());
      continue;
    }
    const avatarUrl = await fetchDemoAvatar(reviewer.avatarSeed);
    const doc = await UserModel.create({
      username: reviewer.username,
      email: reviewer.email,
      password_hash: passwordHash,
      role: "user",
      nickname: reviewer.nickname,
      avatar_url: avatarUrl,
    });
    authorIds.push(doc._id.toString());
  }

  for (const c of DEMO_COMMENTS) {
    const top = await CommentModel.create({
      target_type: TARGET_TYPE,
      target_id: TARGET_ID,
      parent_id: null,
      author_id: authorIds[c.authorIndex],
      rating: c.rating,
      body: c.body,
      image_urls: (c.imageKeys ?? []).map((key) => publicPath("comment-images", key)),
    });
    for (const reply of c.replies ?? []) {
      await CommentModel.create({
        target_type: TARGET_TYPE,
        target_id: TARGET_ID,
        parent_id: top._id.toString(),
        author_id: authorIds[reply.authorIndex],
        rating: null,
        body: reply.body,
        image_urls: [],
      });
    }
  }
}
