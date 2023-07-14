const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

//check if user has a token after login in
const isAuth = async (req, res, next) => {
  const authHeader = req.headers["x-access-token"];

  if (!authHeader) {
    return res.status(401).send("Access Denied");
    
  }
  try {
    // retrieve id and displayName of the user embedded inside the jwt
    const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
    const { _id } = decoded;
    const user = await User.findOne({ _id: _id });
    if (user) {
      req.user = { _id };
      next();
    } else {
      res.status(400).send("invalid Token from our database");
    }
  } catch (error) {
    
    res.status(400).send("invalid Token");
  }
};

module.exports = isAuth;
