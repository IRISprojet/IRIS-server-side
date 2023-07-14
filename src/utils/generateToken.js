const jwt = require("jsonwebtoken");

const tokenForVerify = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET_FOR_VERIFY,
    { expiresIn: "30d" }
  );
};

//! for admin dashboard only (leave it like that)
const signInToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.displayName,
      displayName: user.displayName,
      email: user.email,
      address: user.address,
      phone: user.phone,
      image: user.image,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2d",
    }
  );
};
const tokenForVerifyAdmin = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.displayName,
      displayName: user.displayName,
      email: user.email,
      password: user.password,
    },
    process.env.JWT_SECRET_FOR_VERIFY,
    { expiresIn: "30d" }
  );
};
module.exports = { tokenForVerify, signInToken , tokenForVerifyAdmin};
