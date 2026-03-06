const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const adminEmail = "admin@example.com";
    
    // Check if user already exists
    const [existingUsers] = await queryInterface.sequelize.query(
      `SELECT user_id FROM users WHERE email = '${adminEmail}' LIMIT 1;`
    );

    if (existingUsers.length === 0) {
      return queryInterface.bulkInsert("users", [{
        name: "Admin User",
        email: adminEmail,
        password_hash: await bcrypt.hash("hashedpassword1", 10),
        role: "ADMIN",
        status: "ACTIVE",
        created_at: new Date(),
      }]);
    }
    console.log("Admin user already exists, skipping...");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", { email: "admin@example.com" }, {});
  },
};