"use strict";

const notificationEmitter = require("../../../events/EventEmitter");
const { Notification } = require("../../index"); // Adjust path as needed

notificationEmitter.on("sendNotification", async (data) => {
  try {
    const {
      recipient_id,
      actor_id,
      type,
      title,
      message,
      link,
      entity_type,
      entity_id,
      priority,
      metadata,
    } = data;

    const newNotification = await Notification.create({
      recipient_id,
      actor_id,
      type,
      title,
      message,
      link,
      entity_type,
      entity_id,
      priority: priority || "normal",
      metadata,
    });

    console.log(
      `[Notification Service]: Record created for User ${recipient_id}`,
    );
  } catch (error) {
    console.error("[Notification Service Error]:", error);
  }
});
