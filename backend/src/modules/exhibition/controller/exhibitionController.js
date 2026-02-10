const { Exhibition, Artwork } = require("../../index");

/**
 * ADMIN – Create Exhibition (Draft)
 */
exports.createExhibition = async (req, res) => {
  try {
    const { title, description, type, stream_link, start_date, end_date } =
      req.body;

    if (!title || !type) {
      return res.status(400).json({ message: "Title and type are required" });
    }

    if (type === "LIVE") {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Live exhibitions require a banner image" });
      }

      if (!stream_link) {
        return res
          .status(400)
          .json({ message: "Live exhibitions require a stream link" });
      }
    }

    const exhibition = await Exhibition.create({
      title,
      description,
      type,
      stream_link: type === "LIVE" ? stream_link : null,
      banner_image: req.file ? `/store/exhibitions/${req.file.filename}` : null,
      start_date: start_date || null,
      end_date: end_date || null,
      is_published: false, // draft by default
    });

    res.status(201).json({
      success: true,
      message: "Exhibition created as draft",
      data: exhibition,
    });
  } catch (err) {
    console.error("Create exhibition error:", err);
    res.status(500).json({ message: "Error creating exhibition" });
  }
};

/**
 * ADMIN – Publish / Unpublish Exhibition
 */
exports.toggleVisibility = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const { is_published } = req.body;

    if (typeof is_published !== "boolean") {
      return res.status(400).json({ message: "is_published must be boolean" });
    }

    const exhibition = await Exhibition.findByPk(exhibitionId);
    if (!exhibition) {
      return res.status(404).json({ message: "Exhibition not found" });
    }

    await exhibition.update({ is_published });

    res.status(200).json({
      success: true,
      message: `Exhibition ${
        is_published ? "published" : "unpublished"
      } successfully`,
      data: exhibition,
    });
  } catch (err) {
    console.error("Toggle exhibition visibility error:", err);
    res.status(500).json({ message: "Error updating visibility" });
  }
};

/**
 * ADMIN – Assign Artworks to Exhibition
 */
exports.assignArtworks = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const { artworkIds } = req.body;

    if (!Array.isArray(artworkIds)) {
      return res.status(400).json({ message: "artworkIds must be an array" });
    }

    const exhibition = await Exhibition.findByPk(exhibitionId);
    if (!exhibition) {
      return res.status(404).json({ message: "Exhibition not found" });
    }

    await exhibition.setArtworks(artworkIds);

    res.status(200).json({
      success: true,
      message: "Artworks assigned successfully",
    });
  } catch (err) {
    console.error("Assign artworks error:", err);
    res.status(500).json({ message: "Error assigning artworks" });
  }
};

/**
 * PUBLIC – Get Published Exhibitions
 */
exports.getPublicExhibitions = async (req, res) => {
  try {
    const exhibitions = await Exhibition.findAll({
      where: { is_published: true },
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Artwork,
          as: "artworks",
          attributes: ["artwork_id", "title", "main_image"],
          through: { attributes: [] },
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: exhibitions.length,
      data: exhibitions,
    });
  } catch (err) {
    console.error("Get public exhibitions error:", err);
    res.status(500).json({ message: "Error fetching exhibitions" });
  }
};

/**
 * PUBLIC – Get Single Exhibition
 */
exports.getExhibitionById = async (req, res) => {
  try {
    const { exhibitionId } = req.params;

    const exhibition = await Exhibition.findOne({
      where: {
        exhibition_id: exhibitionId,
        is_published: true,
      },
      include: [
        {
          model: Artwork,
          as: "artworks",
          attributes: ["artwork_id", "title", "main_image"],
          through: { attributes: [] },
        },
      ],
    });

    if (!exhibition) {
      return res.status(404).json({ message: "Exhibition not found" });
    }

    res.status(200).json({ success: true, data: exhibition });
  } catch (err) {
    console.error("Get exhibition error:", err);
    res.status(500).json({ message: "Error fetching exhibition" });
  }
};
