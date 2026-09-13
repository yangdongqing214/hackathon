import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");

function storageFor(subdir: string): multer.StorageEngine {
  const dir = path.join(UPLOAD_ROOT, subdir);
  fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: dir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
  });
}

export const uploadAvatar = multer({ storage: storageFor("avatars"), limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadCommentImages = multer({
  storage: storageFor("comment-images"),
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
});
export const uploadNonprofitLogo = multer({ storage: storageFor("nonprofit-logos"), limits: { fileSize: 5 * 1024 * 1024 } });

export function publicPath(subdir: string, filename: string): string {
  return `/uploads/${subdir}/${filename}`;
}

export { UPLOAD_ROOT };
