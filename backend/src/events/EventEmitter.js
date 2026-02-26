const EventEmitter = require("events");

const notificationEmitter = new EventEmitter();

notificationEmitter.setMaxListeners(50);

notificationEmitter.on("error", (err) => {
  console.error("[Notification Emitter Error]:", err);
});
module.exports = notificationEmitter;
