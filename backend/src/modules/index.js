const fs = require("fs");
const path = require("path");

const sequelize = require("../utils/database/connection");

const db = {};

const modulesPath = path.resolve(__dirname);
fs.readdirSync(modulesPath).forEach((moduleFolder) => {
  const modulePath = path.join(modulesPath, moduleFolder);

  if (!fs.statSync(modulePath).isDirectory()) return;

  const modelsPath = path.join(modulePath, "models");

  if (fs.existsSync(modelsPath)) {
    fs.readdirSync(modelsPath)
      .filter((file) => file.endsWith(".js"))
      .forEach((file) => {
        const model = require(path.join(modelsPath, file));
        db[model.name] = model;
      });
  }
});

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
module.exports = db;
