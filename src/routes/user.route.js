const express = require("express");
const router = express.Router();
// import middleware
const { isAuth } = require("../middleware");
const uploadCloudinary = require('../middleware/cloudinary.middleware');

// import controller register
const {
  register,
  login,
  tfa_setup,
  tfa_verify,
  google_tfaSetup,
  googleCallback,
  githubCallback,
  changerPass,
  sendPasswordResetEmail,
  
  updateUser,
  deleteUser,
  getUserProfile,
  setMfaTrue,
  setTfaTypeToFaceId,
  setTfaTypeToAuthenticator,
  setTfaTypeToEmail,
  
 
  logout,
  refreshToken,
  google_tfaVerify,
  verifyAccount,
  resend_verification_email,
  checkPasswordResetToken,
  
} = require("../controllers/user.controller");

router.post("/register", register);

router.post("/login", login);

router.get("/refresh", refreshToken);

router.post("/verify", isAuth, verifyAccount);

router.get("/resend_verification_email", isAuth, resend_verification_email);

router.get("/checkPasswordResetTokenValid", isAuth, checkPasswordResetToken);

router.get("/logout", logout);


router.get("/tfa", isAuth, tfa_setup);

router.post("/tfa_verify", isAuth, tfa_verify);

router.get("/google_tfa", isAuth, google_tfaSetup);

router.post("/google_tfa_verify", isAuth, google_tfaVerify);

//Password reset request
router.get("/forget-password", sendPasswordResetEmail);

router.put("/resetPassword", isAuth, changerPass);


// router.put("/updateUser", uploadCloudinary.single('profilePicture'), updateUser);
router.put("/updateUser", uploadCloudinary.single('profilePicture'), updateUser);





// router.put('/updateUser', uploadCloudinary.single('profilePicture'), updateUser);


router.delete("/deleteUser", deleteUser);
router.get("/getUser/:id", getUserProfile);
router.post('/setMfaTrue', setMfaTrue);
router.post('/setTfaTypeToFaceId', isAuth, setTfaTypeToFaceId);
router.post('/setTfaTypeToAuthenticator', isAuth, setTfaTypeToAuthenticator);
router.post('/setTfaTypeToEmail', isAuth, setTfaTypeToEmail);

//

// // Passport JS CONFIG
// var GoogleStrategy = require("passport-google-oauth2").Strategy;
// var GitHubStrategy = require("passport-github2").Strategy;
// const passport = require("passport");
// const { verify } = require("jsonwebtoken");
// var userProfile = null;
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL,
//       scope: ["email", "profile"],
//     },
//     function (accessToken, refreshToken, profile, done) {
//       userProfile = profile;
//       return done(null, userProfile);
//     }
//   )
// );
// passport.use(
//   new GitHubStrategy(
//     {
//       clientID: process.env.GITHUB_OAUTH_CLIENT_ID,
//       clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
//       callbackURL: process.env.GITHUB_OAUTH_CALLBACK_URL,
//       scope: ["user:email"],
//     },
//     function (accessToken, refreshToken, profile, done) {
//       userProfile = profile;
//       return done(null, profile);
//     }
//   )
// );
// passport.serializeUser(function (user, cb) {
//   cb(null, user);
// });
// passport.deserializeUser(function (obj, cb) {
//   cb(null, obj);
// });

// // GOOGLE OAUTH
// router.get("/google", passport.authenticate("google"));
// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/login/failed",
//   }),
//   function (req, res) {
//     let prevSession = req.session;
//     req.session.regenerate((err) => {
//       Object.assign(req.session, prevSession);
//       res.redirect("/api/user/google/success");
//     });
//   }
// );
// router.get(
//   "/google/success",
//   [
//     (req, res, next) => {
//       req.profile = userProfile;
//       next();
//     },
//   ],
//   googleCallback
// );
// // GITHUB OAUTH
// router.get("/github", passport.authenticate("github"));
// router.get(
//   "/github/callback",
//   passport.authenticate("github", { failureRedirect: "/login/error" }),
//   function (req, res) {
//     let prevSession = req.session;
//     req.session.regenerate((err) => {
//       Object.assign(req.session, prevSession);
//       res.redirect("/api/user/github/success");
//     });
//   }
// );
// router.get(
//   "/github/success",
//   [
//     (req, res, next) => {
//       req.profile = userProfile;
//       next();
//     },
//   ],
//   githubCallback
// );

module.exports = router;
