const multer = require("multer");
const path = require("path");
const fs = require("fs");

function createUploader({
  folder,
  allowedTypes = ["image/jpeg", "image/png"],
  maxSize = 800 * 1024 * 1024, // Default 800MB
}) {
  const uploadDir = path.join("uploads", folder);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      // Use user_id if available, otherwise 'public' for anonymous uploads
      const userId = req.user?.id || "public";

      // For video files, add 'recording' prefix to make them identifiable
      if (file.mimetype.startsWith("video/")) {
        cb(
          null,
          `recording-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`,
        );
      } else {
        cb(null, `${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
      }
    },
  });

  const fileFilter = (req, file, cb) => {
    // Check if this is for live stream recording (you can add a flag in the request)
    const isLiveStreamRecording =
      req.body?.isRecording || req.query?.type === "recording";

    // For live stream recordings, allow video files
    if (isLiveStreamRecording) {
      if (file.mimetype.startsWith("video/")) {
        return cb(null, true);
      } else {
        return cb(new Error("Live stream recordings must be video files"));
      }
    }

    // For regular uploads, use the allowedTypes from config
    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(
      new Error(
        `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`,
      ),
    );
  };

  return multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter,
  });
}

module.exports = createUploader;
