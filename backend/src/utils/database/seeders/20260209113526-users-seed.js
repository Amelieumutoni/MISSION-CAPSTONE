const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "users",
      [
        {
          name: "Admin User",
          email: "admin@example.com",
          password_hash: await bcrypt.hash("hashedpassword1", 10),
          role: "ADMIN",
          status: "ACTIVE",
          created_at: new Date(),
        },
        {
          name: "Author User",
          email: "author@example.com",
          password_hash: await bcrypt.hash("hashedpassword2", 10),
          role: "AUTHOR",
          status: "ACTIVE",
          created_at: new Date(),
        },
        {
          name: "Buyer User",
          email: "buyer@example.com",
          password_hash: await bcrypt.hash("hashedpassword3", 10),
          role: "BUYER",
          status: "ACTIVE",
          created_at: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
