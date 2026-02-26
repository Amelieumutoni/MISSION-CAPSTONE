const cron = require("node-cron");
const { Exhibition } = require("../modules/index");
const { Op } = require("sequelize");
const notificationEvents = require("../events/EventEmitter");

// Run every minute
cron.schedule("* * * * *", async () => {
  const now = new Date();

  try {
    // 1. Flip UPCOMING to LIVE
    const startedExhibitions = await Exhibition.findAll({
      where: {
        status: "UPCOMING",
        start_date: { [Op.lte]: now },
        end_date: { [Op.gt]: now },
        is_published: true,
      },
    });

    for (const ex of startedExhibitions) {
      await ex.update({ status: "LIVE" });

      // Notify the Artist that their show is now live
      notificationEvents.emit("sendNotification", {
        recipient_id: ex.author_id,
        type: "exhibition_live",
        title: "Your Exhibition is LIVE!",
        message: `"${ex.title}" has officially started.`,
        entity_id: ex.exhibition_id,
      });
    }

    // 2. Flip LIVE to ARCHIVED
    await Exhibition.update(
      { status: "ARCHIVED" },
      {
        where: {
          status: "LIVE",
          end_date: { [Op.lte]: now },
        },
      },
    );
  } catch (err) {
    console.error("Cron Job Error:", err);
  }
});
