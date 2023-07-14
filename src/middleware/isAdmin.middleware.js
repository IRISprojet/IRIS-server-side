const User = require("../models/user.model");
//this goes after  middleware isAuth
const isAdmin = async (req, res, next) => {
  const admin = await User.findOne({ _id: req.user._id, role: "admin" });

  if (admin) {
    next();
  } else {
    res.status(401).send({
      message: "User is not Admin",
    });
  }
};
module.exports = isAdmin;
