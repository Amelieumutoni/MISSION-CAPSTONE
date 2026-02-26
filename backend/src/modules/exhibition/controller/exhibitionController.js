const notificationEmitter = require("../../../events/EventEmitter");
const {
  Exhibition,
  Artwork,
  LiveStream,
  User,
  Profile,
} = require("../../index");
const { Op } = require("sequelize");

exports.createExhibition = async (req, res) => {
  try {
    const { title, description, type, stream_link, start_date, end_date } =
      req.body;

    if (!title || !type) {
      return res.status(400).json({ message: "Title and type are required." });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "An exhibition banner image is mandatory." });
    }

    let calculatedStatus = "UPCOMING";
    let start = null;
    let end = null;

    if (type === "LIVE") {
      if (!start_date || !end_date) {
        return res.status(400).json({
          message: "Start and end dates are required for live events.",
        });
      }
      if (!stream_link) {
        return res.status(400).json({
          message: "A public stream link is required for live exhibitions.",
        });
      }

      const now = new Date();
      start = new Date(start_date);
      end = new Date(end_date);

      if (now >= start && now <= end) calculatedStatus = "LIVE";
      else if (now > end) calculatedStatus = "ARCHIVED";
      else calculatedStatus = "UPCOMING";
    } else {
      calculatedStatus = "UPCOMING";
    }

    const [exhibition, admin] = await Promise.all([
      Exhibition.create({
        author_id: req.user.id,
        title,
        description,
        type,
        status: calculatedStatus,
        stream_link: type === "LIVE" ? stream_link : null,
        start_date: type === "LIVE" ? start : new Date(),
        end_date: type === "LIVE" ? end : null,
        banner_image: `/store/exhibitions/${req.file.filename}`,
        is_published: false,
      }),
      User.findOne({ where: { role: "ADMIN" } }),
    ]);

    if (type === "LIVE") {
      const realStreamLink = `${process.env.FRONTEND_URL}/exhibitions/${exhibition.exhibition_id}/watch`;
      await exhibition.update({ stream_link: realStreamLink });

      await LiveStream.create({
        exhibition_id: exhibition.exhibition_id,
        stream_status: "IDLE",
        current_viewers: 0,
      });
    }

    if (admin) {
      notificationEmitter.emit("sendNotification", {
        recipient_id: admin.user_id,
        actor_id: req.user.id,
        type: "admin_message",
        title: "New Exhibition Pending Review",
        message: `Artist "${req.user.email}" created a ${type} exhibition: "${title}". It requires visibility approval.`,
        entity_type: "exhibition",
        entity_id: exhibition.exhibition_id,
        priority: "high",
        metadata: {
          banner: exhibition.banner_image,
          type: type,
          stream_link: exhibition.stream_link,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: `Exhibition created as ${calculatedStatus}.`,
      data: exhibition,
    });
  } catch (err) {
    console.error("Create exhibition error:", err);
    return res.status(500).json({ message: "Error creating exhibition." });
  }
};

exports.toggleVisibility = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const { is_published } = req.body;

    const exhibition = await Exhibition.findByPk(exhibitionId);
    if (!exhibition) {
      return res.status(404).json({ message: "Exhibition not found" });
    }

    if (exhibition.status === "ARCHIVED") {
      return res
        .status(400)
        .json({ message: "Archived exhibitions cannot be modified" });
    }

    exhibition.is_published = is_published;
    await exhibition.save();

    notificationEmitter.emit("sendNotification", {
      recipient_id: exhibition.author_id,
      actor_id: req.user.id,
      type: "exhibition_live",
      title: is_published ? "Exhibition Published" : "Exhibition Hidden",
      message: `Your exhibition "${exhibition.title}" is now ${is_published ? "visible to the public" : "hidden"}.`,
      entity_type: "exhibition",
      entity_id: exhibition.exhibition_id,
      priority: "normal",
    });

    res.json({
      success: true,
      message: "Visibility updated",
      data: exhibition,
    });
  } catch (err) {
    console.error("Toggle visibility error:", err);
    res.status(500).json({ message: "Error updating exhibition status." });
  }
};

exports.startLiveStream = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const { peerId } = req.body;

    if (!peerId)
      return res.status(400).json({ message: "PeerID is required." });

    const exhibition = await Exhibition.findOne({
      where: { exhibition_id: exhibitionId, author_id: req.user.id },
    });

    if (!exhibition) return res.status(404).json({ message: "Access denied." });

    await LiveStream.update(
      { artist_peer_id: peerId, stream_status: "STREAMING" },
      { where: { exhibition_id: exhibitionId } },
    );

    await exhibition.update({ status: "LIVE" });

    res.status(200).json({ success: true, message: "Stream started." });
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
      where: { exhibition_id: exhibitionId, author_id: req.user.id },
    });

    if (!exhibition)
      return res.status(404).json({ message: "Exhibition not found." });

    await exhibition.setArtworks(artworkIds);

    res
      .status(200)
      .json({ success: true, message: "Artworks assigned successfully" });
  } catch (err) {
    console.error("Assign artworks error:", err);
    res.status(500).json({ message: "Error assigning artworks" });
  }
};

exports.addArtworksToExhibition = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const { artworkIds } = req.body;

    if (!Array.isArray(artworkIds) || artworkIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Valid array of artworkIds required." });
    }

    const exhibition = await Exhibition.findOne({
      where: { exhibition_id: exhibitionId, author_id: req.user.id },
    });

    if (!exhibition)
      return res.status(404).json({ message: "Exhibition not found." });

    await exhibition.addArtworks(artworkIds);

    res.status(200).json({ success: true, message: "Artworks added." });
  } catch (err) {
    res.status(500).json({ message: "Error adding artworks." });
  }
};

exports.updateExhibition = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const {
      title,
      description,
      type,
      stream_link,
      start_date,
      end_date,
      is_published,
    } = req.body;

    const exhibition = await Exhibition.findOne({
      where: { exhibition_id: exhibitionId, author_id: req.user.id },
    });

    if (!exhibition)
      return res.status(404).json({ message: "Exhibition not found." });

    let calculatedStatus = exhibition.status;
    if (type === "LIVE" && start_date && end_date) {
      const now = new Date();
      const start = new Date(start_date);
      const end = new Date(end_date);
      if (now >= start && now <= end) calculatedStatus = "LIVE";
      else if (now > end) calculatedStatus = "ARCHIVED";
      else calculatedStatus = "UPCOMING";
    }

    await exhibition.update({
      title: title || exhibition.title,
      description: description ?? exhibition.description,
      type: type || exhibition.type,
      status: calculatedStatus,
      stream_link: type === "LIVE" ? stream_link : null,
      start_date: type === "LIVE" ? new Date(start_date) : null,
      end_date: type === "LIVE" ? new Date(end_date) : null,
      is_published: is_published === "true" || is_published === true,
      ...(req.file && {
        banner_image: `/store/exhibitions/${req.file.filename}`,
      }),
    });

    return res.status(200).json({
      success: true,
      message: "Exhibition updated.",
      data: exhibition,
    });
  } catch (err) {
    console.error("Update exhibition error:", err);
    return res.status(500).json({ message: "Error updating exhibition." });
  }
};

exports.getMyExhibitions = async (req, res) => {
  try {
    const exhibitions = await Exhibition.findAll({
      where: { author_id: req.user.id },
      order: [["created_at", "DESC"]],
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
    });

    res
      .status(200)
      .json({ success: true, count: exhibitions.length, data: exhibitions });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching your exhibitions." });
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
          model: User,
          as: "author",
        },
        {
          model: LiveStream,
          as: "live_details",
        },
      ],
    };

    if (status) queryOptions.where.status = status;
    if (type) queryOptions.where.type = type;

    const exhibitions = await Exhibition.findAll(queryOptions);

    res
      .status(200)
      .json({ success: true, count: exhibitions.length, data: exhibitions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching public exhibitions." });
  }
};

exports.getExhibitionById = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const exhibition = await Exhibition.findOne({
      where: { exhibition_id: exhibitionId, is_published: true },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["user_id", "name"],
          include: [
            {
              model: Profile,
              as: "profile",
              attributes: ["profile_picture", "bio"],
            },
          ],
        },
        {
          model: Artwork,
          as: "artworks",
          attributes: ["artwork_id", "title", "main_image", "price"],
          through: { attributes: [] },
        },
        {
          model: LiveStream,
          as: "live_details",
        },
      ],
    });

    if (!exhibition)
      return res.status(404).json({ message: "Exhibition not found." });
    res.status(200).json({ success: true, data: exhibition });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching exhibition details." });
  }
};

exports.getExhibitionByIdByMe = async (req, res) => {
  const { exhibitionId } = req.params;
  try {
    const exhibition = await Exhibition.findOne({
      where: { exhibition_id: exhibitionId, author_id: req.user.id },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["user_id", "name"],
          include: [
            {
              model: Profile,
              as: "profile",
              attributes: ["profile_picture", "bio"],
            },
          ],
        },
        {
          model: Artwork,
          as: "artworks",
          attributes: ["artwork_id", "title", "main_image", "price"],
          through: { attributes: [] },
        },
        {
          model: LiveStream,
          as: "live_details",
          attributes: ["artist_peer_id", "current_viewers", "stream_status"],
        },
      ],
    });

    if (!exhibition)
      return res.status(404).json({ message: "Exhibition not found." });
    res.status(200).json({ success: true, data: exhibition });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching exhibition details." });
  }
};

exports.startLiveStream = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const { peerId } = req.body;
    if (!peerId)
      return res.status(400).json({ message: "PeerID is required." });
    const exhibition = await Exhibition.findOne({
      where: { exhibition_id: exhibitionId, author_id: req.user.id },
    });
    if (!exhibition) return res.status(404).json({ message: "Access denied." });
    await LiveStream.update(
      { artist_peer_id: peerId, stream_status: "STREAMING" },
      { where: { exhibition_id: exhibitionId } },
    );
    await exhibition.update({ status: "LIVE" });
    res.status(200).json({ success: true, message: "Stream started." });
  } catch (err) {
    res.status(500).json({ message: "Error starting stream." });
  }
};

exports.endLiveStream = async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const exhibition = await Exhibition.findOne({
      where: { exhibition_id: exhibitionId, author_id: req.user.id },
    });
    if (!exhibition) return res.status(404).json({ message: "Access denied." });

    await LiveStream.update(
      { stream_status: "IDLE", current_viewers: 0, artist_peer_id: null },
      { where: { exhibition_id: exhibitionId } },
    );
    await exhibition.update({ status: "ARCHIVED" });

    console.log(exhibitionId);
    res.status(200).json({
      success: true,
      message: "Stream ended and exhibition archived.",
    });
  } catch (err) {
    console.error("Error ending stream:", err);
    res.status(500).json({ message: "Error ending stream." });
  }
};

exports.uploadRecording = async (req, res) => {
  try {
    const { exhibitionId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No recording file provided." });
    }

    const recordingPath = `/store/recordings/${file.filename}`;

    if (exhibitionId) {
      const exhibition = await Exhibition.findOne({
        where: { exhibition_id: exhibitionId, author_id: req.user.id },
      });
      if (exhibition) {
        await LiveStream.update(
          { recording_path: recordingPath },
          { where: { exhibition_id: exhibitionId } },
        );
      } else {
        console.warn(
          "Exhibition not found for recording upload:",
          exhibitionId,
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Recording uploaded successfully.",
      path: recordingPath,
    });
  } catch (err) {
    console.error("Error uploading recording:", err);
    res.status(500).json({ message: "Error uploading recording." });
  }
};

exports.adminExhibitions = async (req, res) => {
  try {
    const { status, type } = req.query;
    const queryOptions = {
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

    res
      .status(200)
      .json({ success: true, count: exhibitions.length, data: exhibitions });
  } catch (err) {
    res.status(500).json({ message: "Error fetching public exhibitions." });
  }
};
