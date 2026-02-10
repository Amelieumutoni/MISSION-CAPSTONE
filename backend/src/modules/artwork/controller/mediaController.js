const { Media, Artwork } = require("../../index");

// uploading images for a specific artwork either images or videos
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

    // Reset previous primary media
    await Media.update(
      { is_primary: false },
      { where: { artwork_id: artworkId } },
    );

    const mediaPayload = req.files.map((file, index) => ({
      artwork_id: artworkId,
      file_path: `/store/artworks/media/${file.filename}`,
      media_type: file.mimetype.startsWith("video") ? "VIDEO" : "IMAGE",
      is_primary:
        primary_index !== undefined && Number(primary_index) === index,
    }));

    const media = await Media.bulkCreate(mediaPayload);

    res.status(201).json({
      success: true,
      message: "Media uploaded successfully",
      count: media.length,
      data: media,
    });
  } catch (err) {
    console.error("Bulk Upload Media Error:", err);
    res.status(500).json({ message: "Error uploading media" });
  }
};

// listing images for a specific artwork either images or videos
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

    if (!media.length) {
      return res
        .status(404)
        .json({ message: "No media found for this artwork" });
    }

    res.status(200).json({
      success: true,
      count: media.length,
      data: media,
    });
  } catch (err) {
    console.error("Get Artwork Media Error:", err);
    res.status(500).json({ message: "Error fetching artwork media" });
  }
};
