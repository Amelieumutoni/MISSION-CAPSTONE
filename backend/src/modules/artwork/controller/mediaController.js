const { Media, Artwork } = require("../../index");

/**
 * BULK UPLOAD MEDIA (AUTHOR ONLY – OWN ARTWORK)
 */
exports.bulkUploadMedia = async (req, res) => {
  try {
    const { artworkId } = req.params;
    const { primary_index } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Media files are required" });
    }

    const artwork = await Artwork.findOne({
      where: {
        artwork_id: artworkId,
        author_id: req.user.id,
      },
    });

    if (!artwork) {
      return res
        .status(404)
        .json({ message: "Artwork not found or access denied" });
    }

    // Reset previous primary
    await Media.update(
      { is_primary: false },
      { where: { artwork_id: artworkId } },
    );

    const payload = req.files.map((file, index) => ({
      artwork_id: artworkId,
      file_path: `/store/artworks/media/${file.filename}`,
      media_type: file.mimetype.startsWith("video") ? "VIDEO" : "IMAGE",
      is_primary:
        primary_index !== undefined && Number(primary_index) === index,
    }));

    const media = await Media.bulkCreate(payload);

    res.status(201).json({
      success: true,
      count: media.length,
      data: media,
    });
  } catch (err) {
    console.error("Bulk upload media error:", err);
    res.status(500).json({ message: "Error uploading media" });
  }
};

/**
 * PUBLIC – GET MEDIA BY ARTWORK
 */
exports.getArtworkMedia = async (req, res) => {
  try {
    const { artworkId } = req.params;

    const media = await Media.findAll({
      where: { artwork_id: artworkId },
      attributes: [
        "media_id",
        "file_path",
        "media_type",
        "is_primary",
        "created_at",
      ],
      order: [
        ["is_primary", "DESC"],
        ["created_at", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      count: media.length,
      data: media,
    });
  } catch (err) {
    console.error("Get artwork media error:", err);
    res.status(500).json({ message: "Error fetching media" });
  }
};

/**
 * UPDATE MEDIA (SET PRIMARY)
 */
exports.setPrimaryMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;

    const media = await Media.findByPk(mediaId, {
      include: {
        model: Artwork,
        as: "artwork",
      },
    });

    if (!media || media.artwork.author_id !== req.user.id) {
      return res
        .status(404)
        .json({ message: "Media not found or access denied" });
    }

    await Media.update(
      { is_primary: false },
      { where: { artwork_id: media.artwork_id } },
    );

    await media.update({ is_primary: true });

    res.status(200).json({
      success: true,
      message: "Primary media updated",
      data: media,
    });
  } catch (err) {
    console.error("Set primary media error:", err);
    res.status(500).json({ message: "Error updating primary media" });
  }
};

/**
 * DELETE MEDIA (AUTHOR – OWN | ADMIN)
 */
exports.deleteMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;

    const media = await Media.findByPk(mediaId, {
      include: {
        model: Artwork,
        as: "artwork",
      },
    });

    if (
      !media ||
      (req.user.role !== "ADMIN" && media.artwork.author_id !== req.user.id)
    ) {
      return res
        .status(404)
        .json({ message: "Media not found or access denied" });
    }

    await media.destroy();

    res.status(200).json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (err) {
    console.error("Delete media error:", err);
    res.status(500).json({ message: "Error deleting media" });
  }
};
