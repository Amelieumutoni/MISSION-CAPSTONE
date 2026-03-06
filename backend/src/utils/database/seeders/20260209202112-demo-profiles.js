"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get users who DO NOT have a profile yet
    const usersWithoutProfiles = await queryInterface.sequelize.query(
      `SELECT user_id FROM users WHERE user_id NOT IN (SELECT user_id FROM profiles);`
    );

    const userRows = usersWithoutProfiles[0];
    
    if (userRows.length === 0) {
      console.log("No new profiles to create.");
      return;
    }

    const profiles = userRows.map((user) => ({
      user_id: user.user_id,
      bio: "Art enthusiast and researcher interested in Rwandan heritage.",
      location: "Kigali",
      specialty: null,
      years_experience: null,
      phone_contact: "+250780000002",
      created_at: new Date(),
      updated_at: new Date(),
    }));

    return queryInterface.bulkInsert("profiles", profiles);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("profiles", null, {});
  },
};