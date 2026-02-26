const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Profile } = require("../../index"); // loaded via modules/index.js
const sequelize = require("../../../utils/database/connection");
const notificationEmitter = require("../../../events/EventEmitter");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

exports.register = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { name, email, password, role, ...rest } = req.body;

    // 1. Check if user exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      await t.rollback();
      return res.status(400).json({ message: "Email already in use" });
    }

    // Fetch admin outside or inside, but before commit
    const adminUser = await User.findOne({ where: { role: "ADMIN" } });

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User within the transaction
    const user = await User.create(
      {
        name,
        email,
        password_hash: hashedPassword,
        role: role?.toUpperCase() || "BUYER",
        status: role?.toUpperCase() === "BUYER" ? "ACTIVE" : "INACTIVE",
      },
      { transaction: t },
    );

    await Profile.create(
      {
        user_id: user.user_id,
        rest,
      },
      { transaction: t },
    );

    // COMMIT HERE
    await t.commit();

    try {
      notificationEmitter.emit("sendNotification", {
        recipient_id: user.user_id,
        actor_id: user.user_id,
        type: "welcome",
        title: `Welcome to the Archive, ${name}!`,
        message:
          role?.toUpperCase() === "BUYER"
            ? "Your account is ready to explore craftfolio artist and designers workspace."
            : "Your application is under review. We will notify you once an admin activates your artist profile.",
        priority: "high",
      });

      if (adminUser && role?.toUpperCase() !== "BUYER") {
        notificationEmitter.emit("sendNotification", {
          recipient_id: adminUser.user_id,
          actor_id: user.user_id,
          type: "admin_message",
          title: "New Artist Pending Approval",
          message: `A new artist (${name}) has registered and is waiting for activation.`,
          entity_type: "user",
          entity_id: user.user_id,
          priority: "urgent",
        });
      }
    } catch (notifErr) {
      console.error("Notification Emitter Error:", notifErr);
    }

    return res.status(201).json({
      message: "User and Profile registered successfully",
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    await t.rollback();
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    res.json({
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password_hash", "refreshToken"] },
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
      ],
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { bio, location, specialty, years_experience, phone_contact } =
      req.body;

    const profile = await Profile.findOne({ where: { user_id: userId } });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const filePath =
      req.file === undefined
        ? profile.profile_picture
        : `/store/profiles/${req.file.filename} `;

    await profile.update({
      bio: bio || profile.bio,
      location: location || profile.location,
      specialty: specialty || profile.specialty,
      years_experience: years_experience || profile.years_experience,
      phone_contact: phone_contact || profile.phone_contact,
      profile_picture: filePath || profile.profile_picture,
    });

    res.status(200).json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
};

exports.updateAccountSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // --- 1. UPDATE USERNAME (NAME) AND EMAIL ---
    if (name) user.name = name;

    if (email && email !== user.email) {
      // Check if the new email is already taken by someone else
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: "Email is already in use" });
      }
      user.email = email;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required to set a new one" });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    notificationEmitter.emit("sendNotification", {
      recipient_id: user.user_id,
      actor_id: user.user_id,
      type: "password_changed",
      title: "Account settings Updated",
      message: `Your account email and password has been successfully changed to ${email}.`,
      priority: "high",
    });

    // Return the updated user (excluding sensitive hash)
    res.json({
      message: "Account settings synchronized successfully",
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Account update error:", err);
    res
      .status(500)
      .json({ message: "Internal server error during synchronization" });
  }
};
