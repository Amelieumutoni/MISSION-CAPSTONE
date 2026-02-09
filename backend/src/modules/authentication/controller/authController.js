const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Profile } = require("../../index"); // loaded via modules/index.js
const sequelize = require("../../../utils/database/connection");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

exports.register = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      await t.rollback();
      return res.status(400).json({ message: "Email already in use" });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User within the transaction
    const user = await User.create(
      {
        name,
        email,
        password_hash: hashedPassword,
        role: role?.toUpperCase() || "BUYER",
      },
      { transaction: t },
    );

    // 4. Automatically create the Profile within the transaction
    await Profile.create(
      {
        user_id: user.user_id,
        bio: `Welcome to my profile! I am ${name}.`,
      },
      { transaction: t },
    );

    await t.commit();

    res.status(201).json({
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
      { expiresIn: "10min" },
    );

    res.json({
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
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

    const filePath = `/store/profiles/${req.file.filename}`;

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
