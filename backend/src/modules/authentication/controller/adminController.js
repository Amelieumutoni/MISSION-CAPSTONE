const { User, Profile } = require("../../index");

exports.getAllArtists = async (req, res) => {
  try {
    const artisans = await User.findAll({
      where: {
        role: "AUTHOR",
      },
      attributes: ["user_id", "name", "email", "status", "created_at"],
      include: [
        {
          model: Profile,
          as: "profile",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: artisans.length,
      data: artisans,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching artisans" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const artisans = await User.findAll({
      attributes: ["user_id", "name", "email", "status", "created_at"],
      include: [
        {
          model: Profile,
          as: "profile",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: artisans.length,
      data: artisans,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching artisans" });
  }
};

// Enabling an artist to be active on the system or not so that the arts can be seen
exports.updateArtistStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const validStatuses = ["ACTIVE", "INACTIVE", "PENDING"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status type" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Artisan not found" });
    }

    await user.update({ status });

    res.status(200).json({
      success: true,
      message: `Artisan status updated to ${status}`,
      data: {
        userId: user.user_id,
        status: user.status,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating artisan status" });
  }
};
