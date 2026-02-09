"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fetch users to link profiles correctly
    const users = await queryInterface.sequelize.query(
      `SELECT user_id, role FROM users;`,
    );

    const userRows = users[0];
    const profiles = [];

    userRows.forEach((user) => {
      if (user.role === "AUTHOR") {
        profiles.push({
          user_id: user.user_id,
          bio: "Professional weaver from the Northern Province, specialized in traditional Agaseke.",
          location: "Musanze",
          specialty: "Basketry",
          years_experience: 15,
          phone_contact: "+250780000001",
          created_at: new Date(),
          updated_at: new Date(),
        });
      } else {
        profiles.push({
          user_id: user.user_id,
          bio: "Art enthusiast and researcher interested in Rwandan heritage.",
          location: "Kigali",
          specialty: null,
          years_experience: null,
          phone_contact: "+250780000002",
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    });

    return queryInterface.bulkInsert("profiles", profiles);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("profiles", null, {});
  },
};
