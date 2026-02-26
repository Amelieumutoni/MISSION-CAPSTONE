const notificationEmitter = require("../../../events/EventEmitter");
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

    const oldStatus = user.status;
    await user.update({ status });

    if (oldStatus !== status) {
      let notifType = "admin_message";
      let notifTitle = "Account Status Updated";
      let notifMessage = `Your account status has been changed to ${status} by the archival administration.`;

      if (status === "ACTIVE") {
        notifType = "account_reactivated";
        notifTitle = "Account Activated";
        notifMessage =
          "Welcome! Your artist profile is now active. You can now publish exhibitions and manage your catalog.";
      } else if (status === "INACTIVE") {
        notifType = "account_suspended";
        notifTitle = "Account Deactivated";
        notifMessage =
          "Your artist profile has been set to inactive. Please contact the administrator for more details.";
      }

      notificationEmitter.emit("sendNotification", {
        recipient_id: user.user_id,
        actor_id: req.user.id,
        type: notifType,
        title: notifTitle,
        message: notifMessage,
        entity_type: "user",
        entity_id: user.id,
        priority: status === "ACTIVE" ? "high" : "urgent",
        metadata: {
          previous_status: oldStatus,
          new_status: status,
          updated_at: new Date(),
        },
      });
    }

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
