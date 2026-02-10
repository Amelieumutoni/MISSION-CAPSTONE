const { Artwork, User } = require("../../index");
const path = require("path");

exports.createArtwork = async (req, res) => {
  try {
    const {
      title,
      description,
      technique,
      materials,
      dimensions,
      creation_year,
      price,
      stock_quantity,
    } = req.body;

    // 1. Ensure main image exists
    if (!req.file) {
      return res.status(400).json({ message: "Main image is required" });
    }

    // 2. Create artwork
    const artwork = await Artwork.create({
      author_id: req.user.id,
      title,
      description,
      technique,
      materials,
      dimensions,
      creation_year,
      price,
      stock_quantity,
      main_image: `/store/artworks/${req.file.filename}`,
    });

    res.status(201).json({
      success: true,
      message: "Artwork created successfully",
      data: artwork,
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.message || "Error creating artwork",
    });
  }
};

// Getting all artworks by the owner
exports.getMyArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.findAll({
      where: { author_id: req.user.id },
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: artworks.length,
      data: artworks,
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.message || "Error fetching artworks",
    });
  }
};

// Getting all artworks public
exports.getArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.findAll({
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: artworks.length,
      data: artworks,
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.message || "Error fetching artworks",
    });
  }
};

// Getting a single artwork by ID public
exports.getArtworkById = async (req, res) => {
  try {
    const { artworkId } = req.params;

    const artwork = await Artwork.findOne({
      where: {
        artwork_id: artworkId,
      },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["user_id", "name", "email"],
        },
      ],
    });

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    res.status(200).json({
      success: true,
      data: artwork,
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.message || "Error fetching artwork",
    });
  }
};

// updating a single artwork
exports.updateArtwork = async (req, res) => {
  try {
    const { artworkId } = req.params;

    const artwork = await Artwork.findOne({
      where: {
        artwork_id: artworkId,
        author_id: req.user.id,
      },
    });

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    let mainImage = artwork.main_image;
    if (req.file) {
      mainImage = `/store/artworks/${req.file.filename}`;
    }

    await artwork.update({
      ...req.body,
      main_image: mainImage,
    });

    res.status(200).json({
      success: true,
      message: "Artwork updated successfully",
      data: artwork,
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.message || "Error updating artwork",
    });
  }
};

// archieving the artwork by admin or the owner
exports.archiveArtwork = async (req, res) => {
  try {
    const { artworkId } = req.params;

    const artwork = await Artwork.findOne({
      where: {
        artwork_id: artworkId,
      },
    });

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    await artwork.update({ status: "ARCHIVED" });

    res.status(200).json({
      success: true,
      message: "Artwork archived successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.message || "Error archiving artwork",
    });
  }
};
