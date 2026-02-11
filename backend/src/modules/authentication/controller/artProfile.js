const { User, Profile, Artwork, Media } = require("../../index");

exports.getArtisanHistory = async (req, res) => {
  try {
    const { artistId } = req.params;

    const artisanData = await User.findOne({
      where: {
        user_id: artistId,
        role: "AUTHOR",
        status: "ACTIVE",
      },
      attributes: ["user_id", "name", "email", "status", "created_at"],
      include: [
        {
          model: Profile,
          as: "profile",
          attributes: [
            "bio",
            "location",
            "profile_picture",
            "specialty",
            "years_experience",
            "phone_contact",
          ],
        },
        {
          model: Artwork,
          as: "artworks",
          required: false,
          include: [
            {
              model: Media,
              as: "gallery",
              attributes: ["file_path", "media_type", "is_primary"],
            },
          ],
        },
      ],
      order: [[{ model: Artwork, as: "artworks" }, "created_at", "DESC"]],
    });

    if (!artisanData) {
      return res.status(404).json({ message: "Artisan not found" });
    }

    res.status(200).json({
      success: true,
      data: artisanData,
    });
  } catch (err) {
    console.error("Error fetching artisan history:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
