const isAuth = require("./isAuth.middleware");
const isAdmin = require("./isAdmin.middleware");

module.exports = {
  isAuth,
  isAdmin,
};
