// src/modules/routes/livekit.js  (or wherever your routes live)
const express = require("express");
const { AccessToken } = require("livekit-server-sdk");

const router = express.Router();

router.post("/token", async (req, res) => {
  const { exhibitionId, role } = req.body;

  if (!exhibitionId || !role) {
    return res.status(400).json({
      success: false,
      error: "exhibitionId and role are required",
    });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret) {
    console.error("[LiveKit Token] Missing API credentials in .env");
    return res.status(500).json({
      success: false,
      error: "Server misconfigured: LiveKit API key/secret missing",
    });
  }

  if (!livekitUrl) {
    console.warn(
      "[LiveKit Token] LIVEKIT_URL not set in .env – frontend may need to hardcode it",
    );
  }

  try {
    const identity = `${role.toUpperCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
    });

    at.addGrant({
      roomJoin: true,
      room: `exhibition_${exhibitionId}`,
      canPublish: role === "artist" || role === "AUTHOR",
      canSubscribe: true,
      video: { canPublish: role === "artist" || role === "AUTHOR" },
    });

    const token = await at.toJwt();

    // Safety check – toJwt() should never return empty/invalid
    if (
      !token ||
      typeof token !== "string" ||
      token.length < 200 ||
      !token.startsWith("eyJ")
    ) {
      throw new Error("Generated token is invalid or empty");
    }

    console.log(
      `[LiveKit Token] Generated for ${identity} in room exhibition_${exhibitionId} (length: ${token.length})`,
    );

    res.json({
      success: true,
      token, // ← the raw JWT string
      url: livekitUrl || "wss://livestreaming-yrj2soge.livekit.cloud", // fallback
    });
  } catch (err) {
    console.error("[LiveKit Token] Generation failed:", {
      message: err.message,
      stack: err.stack,
      apiKeyPresent: !!apiKey,
      apiSecretPresent: !!apiSecret,
      envKeys: Object.keys(process.env).filter((k) => k.startsWith("LIVEKIT_")),
    });

    res.status(500).json({
      success: false,
      error: "Failed to generate LiveKit token",
      details: err.message, // only in dev – remove in production if sensitive
    });
  }
});

module.exports = router;
