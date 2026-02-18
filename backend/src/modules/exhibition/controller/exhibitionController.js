const { Exhibition, Artwork, LiveStream } = require("../../index");
const { Op } = require("sequelize");

exports.createExhibition = async (req, res) => {
  try {
    const { title, description, type, stream_link, start_date, end_date } =
      req.body;

    if (!title || !type || !start_date || !end_date) {
      return res
        .status(400)
        .json({ message: "Title, type, start, and end dates are required." });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "An exhibition banner image is mandatory." });
    }

    const now = new Date();
    const start = new Date(start_date);
    const end = new Date(end_date);

    let calculatedStatus = "UPCOMING";
    if (now >= start && now <= end) calculatedStatus = "LIVE";
    else if (now > end) calculatedStatus = "ARCHIVED";

    // Create the Exhibition
    const exhibition = await Exhibition.create({
      author_id: req.user.id,
      title,
      description,
      type,
      status: calculatedStatus,
      stream_link: type === "LIVE" ? stream_link : null,
      banner_image: `/store/exhibitions/${req.file.filename}`,
      start_date: start,
      end_date: end,
      is_published: false,
    });

    // IF TYPE IS LIVE: Initialize the LiveStream entry automatically
    if (type === "LIVE") {
      await LiveStream.create({
        exhibition_id: exhibition.exhibition_id,
        stream_status: "IDLE",
        current_viewers: 0,
      });
    }

    res.status(201).json({
      success: true,
      message: `Exhibition created as ${calculatedStatus} draft.`,
      data: exhibition,
    });
  } catch (err) {
    console.error("Create exhibition error:", err);
    res.status(500).json({ message: "Error creating exhibition." });
  }
};

exports.toggleVisibility = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const { status } = req.body; // Expecting UPCOMING, LIVE, or ARCHIVED

    const exhibition = await Exhibition.findOne({
      where: { exhibition_id: exhibitionId, author_id: req.user.id },
    });

    if (!exhibition)
      return res.status(404).json({ message: "Exhibition not found." });

    await exhibition.update({ status });

    res.status(200).json({
      success: true,
      message: `Exhibition marked as ${status}.`,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating exhibition status." });
  }
};

exports.startLiveStream = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const { peerId } = req.body;

    if (!peerId)
      return res
        .status(400)
        .json({ message: "PeerID is required to start stream." });

    // Ensure user owns this exhibition
    const exhibition = await Exhibition.findOne({
      where: { exhibition_id: exhibitionId, author_id: req.user.id },
    });

    if (!exhibition)
      return res
        .status(404)
        .json({ message: "Exhibition not found or access denied." });

    // Update LiveStream data
    await LiveStream.update(
      { artist_peer_id: peerId, stream_status: "STREAMING" },
      { where: { exhibition_id: exhibitionId } },
    );

    // Also ensure exhibition status is marked as LIVE
    await exhibition.update({ status: "LIVE" });

    res
      .status(200)
      .json({ success: true, message: "Stream started successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error starting stream." });
  }
};

exports.assignArtworks = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const { artworkIds } = req.body;

    if (!Array.isArray(artworkIds)) {
      return res.status(400).json({ message: "artworkIds must be an array" });
    }

    const exhibition = await Exhibition.findOne({
      where: {
        exhibition_id: exhibitionId,
        author_id: req.user.id,
      },
    });

    if (!exhibition) {
      return res
        .status(404)
        .json({ message: "Exhibition not found or access denied" });
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

exports.getPublicExhibitions = async (req, res) => {
  try {
    const { status, type } = req.query;

    const queryOptions = {
      where: { is_published: true },
      order: [["start_date", "DESC"]],
      include: [
        {
          model: Artwork,
          as: "artworks",
          attributes: ["artwork_id", "title", "main_image"],
          through: { attributes: [] },
        },
        {
          model: LiveStream,
          as: "live_details",
          attributes: ["stream_status", "current_viewers"],
        },
      ],
    };

    if (status) queryOptions.where.status = status;
    if (type) queryOptions.where.type = type;

    const exhibitions = await Exhibition.findAll(queryOptions);

    res.status(200).json({
      success: true,
      count: exhibitions.length,
      data: exhibitions,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching exhibitions." });
    console.log(err);
  }
};

exports.getExhibitionById = async (req, res) => {
  try {
    const { exhibitionId } = req.params;

    const exhibition = await Exhibition.findOne({
      where: {
        exhibition_id: exhibitionId,
        is_published: true, // Only show public ones to the public
      },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "profile_image", "bio"], // Only public info
        },
        {
          model: Artwork,
          as: "artworks",
          attributes: ["artwork_id", "title", "main_image", "price"],
          through: { attributes: [] }, // Hide the junction table data
        },
        {
          model: LiveStream,
          as: "live_details",
          attributes: ["artist_peer_id", "current_viewers", "stream_status"],
        },
      ],
    });

    if (!exhibition) {
      return res.status(404).json({ message: "Exhibition not found." });
    }

    res.status(200).json({
      success: true,
      data: exhibition,
    });
  } catch (err) {
    console.error("Get exhibition error:", err);
    res.status(500).json({ message: "Error fetching exhibition details." });
  }
};
