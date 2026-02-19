const multer = require("multer");
const path = require("path");
const fs = require("fs");

function createUploader({
  folder,
  allowedTypes = ["image/jpeg", "image/png"],
  maxSize = 20 * 1024 * 1024,
}) {
  const uploadDir = path.join("uploads", folder);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      // Use user_id if available, otherwise 'public' for anonymous uploads
      const userId = req.user?.id || "public";
      cb(null, `${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) return cb(null, true);
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
