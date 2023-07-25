"use strict";

const userModel = require("../models/user.model"); // import our user model
const deviceModel = require("../models/device.model"); // import our user model
const bcrypt = require("bcryptjs"); // used to hash and unhash password to register and login
const { registerValidation, loginValidation } = require("../utils/validation"); // import our constraints on user
const tfaModel = require("../models/tfa");
const sendEmail = require("../utils/emails/sendEmail");
const tfa_googleModel = require("../models/tfa_google");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const { tokenForVerify } = require("../utils/generateToken");
var jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const multer = require("multer");
//eya
const { spawn } = require("child_process");
const chatModel = require("../models/chat.model");

const register = async (req, res) => {
  try {
    //validate data req.body
    const { error } = registerValidation(req.body);
    if (error) {
      return res.status(400).send({ error });
    }
    //check if user exist in the database
    const EMAIL_EXIST = await userModel.findOne({ email: req.body.email });
    if (EMAIL_EXIST) {
      return res.status(400).send({ message: "Email already taken" });
    }

    // hashing Password
    const HASHED_PASSWORD = await bcrypt.hash(req.body.password, 10);

    // create new user
    const user = new userModel({
      email: req.body.email,
      password: HASHED_PASSWORD,
      displayName: req.body.displayName,
    });
    const NEW_USER = await user.save();
    const date = new Date();
    date.setDate(date.getDate() + process.env.REFRESH_TOKEN_COOKIE_EXPIRATION);
    const refreshtoken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });
    res.cookie(process.env.REFRESH_TOKEN_NAME, `${refreshtoken}`, {
      expires: date,
      httpOnly: true,
      secure: false,
    });

    //send email
    const TOKEN = jwt.sign({ _id: NEW_USER._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });
    const body = {
      from: process.env.EMAIL,
      to: `${req.body.email}`,
      subject: "Activation de compte",
      html: `<h2>Hello ${req.body.displayName}</h2>
      <p>Vérifier votre compte pour continuer à utiliser votre compte <strong>IRIs</strong>.</p>

        <p>Ce lien va expirer dans <strong> 15 minutes</strong>.</p>

        <p style="margin-bottom:20px;">Cliquez sur ce bouton pour activer votre compte.</p>

        <a href=http://localhost:3000/verify-account/${TOKEN} style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Vérifier votre compte</a>

        <p style="margin-bottom:0px;">Merci!</p>
        <strong>Iris</strong>
             `,
    };

    sendEmail(body);
    const accessToken = jwt.sign({ _id: NEW_USER._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });

    //create a new chat with for this user
    const chat = new chatModel({
      user: NEW_USER._id,
    });
    const NEW_CHAT = await chat.save();
    res.status(201).send({
      message: "User created successfully, please verify your email!",
      accessToken: accessToken,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Please Try Again" });
  }
};

const login = async (req, res) => {
  try {
    // validate data req.body
    const { error } = loginValidation(req.body.data);
    if (error) {
      return res.status(400).send({ message: "Something went wrong" });
    }

    // check if user exists in the database
    const user = await userModel.findOne({ email: req.body.data.email });
    if (!user) {
      return res.status(401).send({ message: "Invalid credentials!" });
    }

    //check if user is verified

    if (!user.isVerified) {
      return res.status(401).send({ message: " Please verify your account" });
    }
    // check if user is banned
    if (user.isBanned) {
      return res.status(401).send({ message: "Your account has been banned" });
    }
    // check if password is correct
    const passwordMatches = bcrypt.compareSync(req.body.data.password, user.password);
    if (!passwordMatches) {
      return res.status(401).send({ message: "Invalid credentials!" });
    }

    const Device = await deviceModel.findOne({
      visitorId: req.body.data.visitorId,
      user: user._id,
    });
    let refreshToken;
    // if device not exist, new device
    if (Device == null) {
      refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
      });
      await deviceModel.create({
        visitorId: req.body.data.visitorId,
        user: user._id,
        refreshToken: refreshToken,
      });
    }
    // if device exist
    else {
      try {
        jwt.verify(Device.refreshToken, process.env.JWT_SECRET);
        refreshToken = Device.refreshToken;
      } catch (error) {
        refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
        });
        Device.refreshToken = refreshToken;
        await Device.save();
      }
    }

    // final response in case tfa enabled
    if (user.TFA) {
      return res.status(200).send({
        type: user.TFA_type,
        // TFA token only valid in login logics
        // seccret must change
        accessToken: jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
        }),
      });
    }

    const date = new Date();
    date.setDate(date.getDate() + process.env.REFRESH_TOKEN_COOKIE_EXPIRATION);
    const refreshtoken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });

    res.cookie(process.env.REFRESH_TOKEN_NAME, `${refreshtoken}`, {
      expires: date,
      httpOnly: true,
      secure: false,
    });
    return res.status(200).send({
      type: "valid",
      message: "Signed-in!",
      accessToken: jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
      }),
      user: user,
    });
  } catch (err) {
    return res.status(500).send({ success: false, error: "something went wrong" });
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies[process.env.REFRESH_TOKEN_NAME];
    if (!refreshToken) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const Device = await deviceModel.findOne({
      visitorId: req?.query?.visitorId,
    });
    if (Device == null) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded._id);
    if (!user) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });

    const date = new Date();
    date.setDate(date.getDate() + process.env.REFRESH_TOKEN_COOKIE_EXPIRATION);
    const refreshtoken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });

    res.cookie(process.env.REFRESH_TOKEN_NAME, `${refreshtoken}`, {
      expires: date,
      httpOnly: true,
      secure: false,
    });
    return res.status(200).send({
      accessToken: accessToken,
    });
  } catch (err) {}
};

const logout = async (req, res) => {
  try {
    res.clearCookie(process.env.REFRESH_TOKEN_NAME);
    res.status(200).send({ message: "logged out" });
  } catch (err) {
    res.status(500).send({ message: "something went wrong" });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).send({ message: "user not found" });
    }
    // search for device
    const Device = await deviceModel.findOne({
      visitorId: req.query.visitorId,
      user: user._id,
    });
    // if device not exist, kick user out
    if (Device == null) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    // if device exist
    res.status(200).send({ user: user });
  } catch (err) {
    res.status(500).send({ message: "something went wrong" });
  }
};

const tfa_setup = async (req, res) => {
  try {
    //TODO missing middleware to extract user id from token
    const USER = await userModel.findById(req.user._id);
    if (!USER) {
      return res.status(404).send({ message: "user not found" });
    }
    var code = Math.floor(100000 + Math.random() * 900000);
    await tfaModel.create({
      user: USER._id,
      tempSecret: code,
    });
    await sendEmail({
      from: "esprit community",
      to: USER.email,
      subject: "Verify your identity | esprit community",
      text: `Hello ${USER.displayName}, please use this code to verify your identity: ${code}`,
    });
    res.status(200).send({ message: "email sent successfully" });
  } catch (err) {
    res.status(500).send({ message: "Please Try Again" });
  }
};

const tfa_verify = async (req, res) => {
  try {
    const USER = await userModel.findById(req.user._id);
    //checks if it needs sorting or not
    const TFA = await tfaModel.findOne({ user: USER._id }, {}, { sort: { _id: -1 } });

    if (!TFA) {
      return res.status(500).send({ message: "Please regenerate your code and try again" });
    }
    if (req.body.code !== TFA.tempSecret) {
      return res.status(403).send({ message: "Incorrect code, check your email and try again" });
    }

    let now = new Date();
    let created = new Date(TFA.createdAt);
    let diffInMilliSeconds = Math.abs(now - created) / 1000;
    const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;

    if (hours >= 1) {
      return res.status(500).send({
        message: "This code is no longer valid please resend code and try again",
      });
    }

    await tfaModel.remove({ user: USER._id });

    return res.status(200).send({
      type: "valid",
      message: "verified",
      accessToken: jwt.sign({ _id: USER._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
      }),
      user: USER,
    });
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" });
  }
};
4;
const google_tfaSetup = async (req, res) => {
  try {
    const USER = await userModel.findById(req.user._id);
    const EXIST = await tfa_googleModel.findOne({ user: USER._id });
    if (EXIST === null) {
      const secret = speakeasy.generateSecret({
        length: 10,
        name: USER.displayName,
        issuer: "esprit community v1.0",
      });
      var url = speakeasy.otpauthURL({
        secret: secret.base32,
        label: "userName",
        issuer: "esprit community v1.0",
        encoding: "base32",
      });
      QRCode.toDataURL(url, async (err, dataURL) => {
        await tfa_googleModel.create({
          user: req.user._id,
          tempSecret: secret.base32,
        });
        return res.json({
          message: "TFA Auth needs to be verified",
          tempSecret: secret.base32,
          dataURL,
          tfaURL: secret.otpauth_url,
        });
      });
    } else {
      return res.json({
        message: "TFA Already setup, proceed to verify",
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: "Something went wrong",
    });
  }
};

const google_tfaVerify = async (req, res) => {
  //  find secret from db
  try {
    const USER = await userModel.findById(req.user._id);
    const SECRET = await tfa_googleModel.findOne({
      where: { _id: req.user._id },
    });
    const IS_VERIFIED = speakeasy.totp.verify({
      secret: SECRET.tempSecret,
      encoding: "base32",
      token: req.body.code,
    });
    //throw error;
    //
    if (IS_VERIFIED) {
      return res.status(200).send({
        type: "valid",
        message: "approved!",
        accessToken: jwt.sign({ id: USER._id }, process.env.JWT_SECRET, {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
        }),
        user: USER,
      });
    } else {
      return res.status(403).send({
        message: "Invalid code",
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: "something went wrong ",
      Error: error.message,
    });
  }
};

const googleCallback = async (req, res) => {
  try {
    let googleUser = req.profile;
    const user = await userModel.findOne({ email: googleUser.emails[0].value });
    if (user === null) {
      const newUser = new userModel({
        email: googleUser.emails[0].value,
        isVerified: true,
        displayName: googleUser.name.givenName + googleUser.name.familyName,
        from: "Google",
        password: googleUser.sub,
        photoURL: googleUser.picture,
      });
      const savedUser = await newUser.save();
      await signIn(savedUser, req, res);
    } else {
      await signIn(user, req, res);
    }
  } catch (error) {
    return res.status(500).send({ message: "Oops an error occurred", Error: error.message });
  }
};
const githubCallback = async (req, res) => {
  try {
    let githubUser = req.profile;
    const user = await userModel.findOne({ email: githubUser.emails[0].value });
    if (user === null) {
      const newUser = new userModel({
        email: githubUser.emails[0].value,
        isVerified: true,
        displayName: githubUser.username,
        from: "Github",
        password: githubUser.nodeId,
        photoURL: githubUser.photos[0].value,
      });
      const savedUser = await newUser.save();
      await signIn(savedUser, req, res);
    } else {
      await signIn(user, req, res);
    }
  } catch (error) {
    return res.status(500).send({ message: "Oops an error occurred", Error: error.message });
  }
};

const signIn = async (user, req, res) => {
  try {
    const date = new Date();
    date.setDate(date.getDate() + process.env.REFRESH_TOKEN_COOKIE_EXPIRATION);
    const refreshtoken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });
    res.cookie(process.env.REFRESH_TOKEN_NAME, `${refreshtoken}`, {
      expires: date,
      httpOnly: true,
      secure: false,
    });
    let redirectionValue = {
      user: user,
      accessToken: refreshtoken,
    };
    res.redirect(
      process.env.FRONTEND_URL + "/sign-in?user=" + btoa(JSON.stringify(redirectionValue))
    );
  } catch (error) {}
};

//feriel

const sendPasswordResetEmail = async (req, res) => {
  try {
    // find the user with the given email address
    const user = await userModel.findOne({ email: req.query.email });
    // if no user is found, send an error response
    if (!user) {
      // to prevent user enumeration, we'll send the same response
      return res.status(200).send({ message: "Code sent" });
    }

    const TOKEN = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });
    const link = `http://localhost:3000/reset-password/${TOKEN}`;
    // create the email message
    const message = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      html: `<h1>Hello,</h1> 
      <p>
      We have received a request to reset the password associated with 
      your account. To proceed with resetting your password, </p>
      <a href="${link}">Click here</a>
      <p>
      Once you have clicked on the link, you will be redirected to our website where you can continue to access our services.
      
      If you have any questions or concerns regarding the verification of your account, please do not hesitate to contact us by replying to this email.
      
      Thank you for your cooperation, \n
      
      Best regards,</p>`,
    };

    // send the email
    sendEmail(message);

    // send a success response
    return res.status(200).send({ message: "Code sent" });
  } catch (error) {
    // handle errors
    console.error(error);
  }
};

const changerPass = async (req, res) => {
  try {
    const USER = await userModel.findById(req.user._id);

    if (!USER) {
      return res.status(404).json({ error: "User not found" });
    }
    const password = req.body.password;

    USER.password = await bcrypt.hash(password, 10);
    await USER.save();
    res.send({ success: true, message: "password changed" });
  } catch (error) {
    res.status(500).send({ success: false, message: "something went wrong" });
  }
};

const checkPasswordResetToken = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.send({ success: true, message: "token is valid" });
  } catch (error) {}
};

// const loginWithFace = async (req, res) => {
//   // Find the user with the given ID
//   const USER = await userModel.findById(req.user._id);
//   console.log(USER)

//   // Spawn a Python process to recognize the user's face
//   const pythonProcess = spawn("python", [
//     "C://Users//eyaba//Desktop//Server-Side//src//utils//Face-Recog38//recognition.py",
//   ]);

//   pythonProcess.stdout.on("data", (data) => {
//     const output = data.toString().trim();
//     console.log(`Output from script: ${output}`);

//     // If the face is recognized, send an access token and the user object
//     if (output.startsWith("authenticated")) {
//       const user_id = output.split(' ')[1];
//       console.log(`User ID: ${user_id}`);

//       // Verify that the recognized face belongs to the logged-in user
//       if (USER._id.toString() === user_id) {
//         console.log("Face authenticated");
//         return res.status(200).send({
//           type: "valid",
//           message: "Face verified",
//           accessToken: jwt.sign({ _id: USER._id }, process.env.JWT_SECRET, {
//             expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
//           }),
//           user: USER,
//         });
//       } else {
//         console.log("Face not recognized for the logged-in user");
//         return res.status(401).send({
//           type: "invalid",
//           message: "Face not recognized for the logged-in user",
//         });
//       }
//     } else {
//       console.log("Face not recognized");
//       return res.status(401).send({
//         type: "invalid",
//         message: "Face not recognized",
//       });
//     }
//   });
// };

const loginWithFace = async (req, res) => {
  try {
    // Find the user with the given ID
    const USER = await userModel.findById(req.user._id);
    console.log(USER);

    // Spawn a Python process to recognize the user's face
    const pythonProcess = spawn("python", [
      "C://Users//eyaba//Desktop//Server-Side//src//utils//Face-Recog38//recognition.py",
    ]);

    pythonProcess.stdout.on("data", async (data) => {
      const output = data.toString().trim();
      console.log(`Output from script: ${output}`);

      // If the face is recognized, send an access token and the user object
      if (output.startsWith("authenticated")) {
        const user_id = output.split(" ")[1];
        console.log(`User ID: ${user_id}`);

        // Verify that the recognized face belongs to the logged-in user
        if (USER._id.toString() === user_id) {
          console.log("Face authenticated");

          try {
            const TFA = await tfaModel.findOne({ user: USER._id }, {}, { sort: { _id: -1 } });

            await tfaModel.remove({ user: USER._id });

            // check if user is verified
            if (!USER.isVerified) {
              return res.status(401).send({ message: "Please verify your account" });
            }
            // check if user is banned
            if (USER.isBanned) {
              return res.status(401).send({ message: "Your account has been banned" });
            }

            const date = new Date();
            date.setDate(date.getDate() + process.env.REFRESH_TOKEN_COOKIE_EXPIRATION);
            const refreshtoken = jwt.sign({ _id: USER._id }, process.env.JWT_SECRET, {
              expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
            });

            res.cookie(process.env.REFRESH_TOKEN_NAME, `${refreshtoken}`, {
              expires: date,
              httpOnly: true,
              secure: false,
            });
            return res.status(200).send({
              type: "valid",
              message: "Signed-in!",
              accessToken: jwt.sign({ _id: USER._id }, process.env.JWT_SECRET, {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
              }),
              user: USER,
            });
          } catch (error) {
            return res.status(500).send({ message: "Something went wrong" });
          }
        } else {
          console.log("Face not recognized for the logged-in user");
          return res.status(401).send({
            type: "invalid",
            message: "Face not recognized for the logged-in user",
          });
        }
      } else {
        console.log("Face not recognized");
        return res.status(401).send({
          type: "invalid",
          message: "Face not recognized",
        });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ success: false, error: "something went wrong" });
  }
};

const verifyAccount = async (req, res) => {
  try {
    const USER = await userModel.findById(req.user._id);
    if (!USER) {
      return res.status(404).json({ error: "User not found" });
    }
    USER.isVerified = true;
    await USER.save();
    const accessToken = jwt.sign({ _id: USER._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });
    res.send({ message: "Account verified", accessToken: accessToken });
  } catch (error) {
    console.error(error);
  }
};

const resend_verification_email = async (req, res) => {
  try {
    const foundUser = await userModel.findById(req.user._id);
    if (!foundUser) {
      return res.status(404).send({ message: "User not found" });
    }
    const token = jwt.sign({ _id: foundUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });
    const message = {
      from: process.env.EMAIL,
      to: foundUser.email,
      subject: "Activation de compte",
      html: `<h2>Hello ${foundUser.displayName}</h2>
      <p>Vérifier votre compte pour continuer à utiliser votre compte <strong>Esprit Community</strong>.</p>

        <p>Ce lien va expirer dans <strong> 15 minutes</strong>.</p>

        <p style="margin-bottom:20px;">Cliquez sur ce bouton pour activer votre compte.</p>

        <a href=http://localhost:3000/verify-account/${token} style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Vérifier votre compte</a>

        <p style="margin-bottom:0px;">Merci!</p>
        <strong>Esprit Community Team</strong>
        `,
    };
    sendEmail(message);
    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error(error);
  }
};

const updateUser = async (req, res, next) => {
  const token = req.headers["x-access-token"];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decodedToken._id;

  const user = await userModel.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  let profilePicture;

  if (req.file && req.file.path) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        public_id: `users/${user.displayName}-${user._id}`,
      });
      profilePicture = result.secure_url;

      // Copy the image to the 'faces' directory
      const fileName = path.basename(req.file.path);
      const destPath = path.join(__dirname, "../utils/Face-Recog38/faces", fileName);
      fs.copyFileSync(req.file.path, destPath);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong." });
    }
  } else {
    profilePicture = req.body.profilePicture;
  }

  const updateObject = {
    ...req.body,
    profilePicture: profilePicture,
  };

  // Check if profilePicture is being updated
  if (updateObject.profilePicture) {
    try {
      const result = await cloudinary.uploader.upload(updateObject.profilePicture, {
        public_id: `users/${user.displayName}-${user._id}`,
      });
      updateObject.profilePicture = result.secure_url;

      // Copy the image to the 'faces' directory
      const fileName = path.basename(updateObject.profilePicture);
      const destPath = path.join(__dirname, "../utils/Face-Recog38/faces", fileName);
      const response = await axios({
        url: updateObject.profilePicture,
        responseType: "stream",
      });
      response.data.pipe(fs.createWriteStream(destPath));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong." });
    }
  }

  try {
    const updatedUser = await userModel.findOneAndUpdate({ _id: userId }, updateObject, {
      new: true,
    });

    res.status(200).json({ message: "User updated successfully.", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken._id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.body.password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const passwordMatches = await bcrypt.compare(req.body.password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid password" });
    }

    await userModel.deleteOne({ _id: userId });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.log(err); // log the actual error message to the console
    res.status(500).json({ errormsg: err.message }); // return the actual error message in the response
  }
};

const getUserProfile = (req, res, next) => {
  userModel
    .findOne({ id: req.params.id })
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      res.json({ errormsg: "something went wrong!!" });
    });
};

const addClaim = async (req, res) => {
  const { claimName, userEmail, subject, message } = req.body;

  try {
    const user = await evuserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newClaim = new Claim({
      claimName,
      userEmail,
      subject,
      message,
    });

    const savedClaim = await newClaim.save();

    res.status(201).json({
      success: true,
      message: "Claim created successfully",
      claim: savedClaim,
    });
  } catch (err) {
    console.error("Error creating claim:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create claim",
      error: err.message,
    });
  }
};

const setMfaTrue = async (req, res) => {
  const token = req.headers["x-access-token"]; // extract the token from the Authorization header
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // decode the token payload
  const userId = decodedToken._id; // extract the user ID from the payload

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.body.password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const passwordMatches = await bcrypt.compare(req.body.password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid password" });
    }

    user.TFA = true;
    user.TFA_type = "mfa";
    await user.save();

    // Send email to user
    const body = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Multi-factor authentication activated",
      html: `
      <div style="background-color: #F5F5F5; padding: 20px; font-family: Arial, sans-serif; font-size: 16px;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="text-align:center>
        <img src="https://www.pngmart.com/files/7/Cyber-Security-PNG-HD.png"  width="120" height="120">
      </td>
    </tr>
    <tr>
      <td height="30"></td>
    </tr>
    <tr>
      <td>
        <p style="font-size: 20px; font-weight: bold; color:#6e4998; margin-bottom: 10px;">Multi-Factor Authentication Activation</p>
        <p style="margin-top: 0px;  color:#161d2a;">Hello ${user.displayName},</p>
        <p style="margin-bottom: 20px;color:#161d2a;">The multi-factor authentication has been successfully activated on your Esprit Community account.</p>
        <p  style=" color:#161d2a;">If you did not authorize this action, please contact our support team.</p>
        <p style="margin-top: 20px;color:#6e4998; font-weight: bold;">Best regards,</p>
        <p style="margin-top: 0px;color:#161d2a;">The Esprit Community Team</p>
      </td>
    </tr>
    <tr>
      <td height="30"></td>
    </tr>
    <tr>
  
    </tr>
  </table>
</div>`,
    };

    sendEmail(body);

    res.status(200).json({ message: "TFA has been set to true", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const setTfaTypeToFaceId = async (req, res) => {
  const token = req.headers["x-access-token"]; // extract the token from the Authorization header
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // decode the token payload
  const userId = decodedToken._id; // extract the user ID from the payload

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.TFA = true;
    user.TFA_type = "face_id";
    await user.save();

    res.status(200).json({ message: "TFA type has been set to face_id", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const setTfaTypeToAuthenticator = async (req, res) => {
  const token = req.headers["x-access-token"]; // extract the token from the Authorization header
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // decode the token payload
  const userId = decodedToken._id; // extract the user ID from the payload

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.TFA = true;
    user.TFA_type = "authenticator";
    await user.save();

    res.status(200).json({ message: "TFA type has been set to authenticator", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const setTfaTypeToEmail = async (req, res) => {
  const token = req.headers["x-access-token"]; // extract the token from the Authorization header
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // decode the token payload
  const userId = decodedToken._id; // extract the user ID from the payload

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.TFA = true;
    user.TFA_type = "email";
    await user.save();

    res.status(200).json({ message: "TFA type has been set to mfa", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

//

// export our functions to b use in app.js
module.exports = {
  register,
  login,
  getUser,
  tfa_setup,
  tfa_verify,
  google_tfaVerify,
  google_tfaSetup,
  googleCallback,
  githubCallback,
  sendPasswordResetEmail,
  changerPass,
  logout,
  refreshToken,
  verifyAccount,
  resend_verification_email,
  checkPasswordResetToken,
  //eya
  loginWithFace,
  updateUser,
  deleteUser,
  getUserProfile,
  addClaim,
  setMfaTrue,
  setTfaTypeToFaceId,
  setTfaTypeToAuthenticator,
  setTfaTypeToEmail,
};
